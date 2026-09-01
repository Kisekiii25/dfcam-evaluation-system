<?php

namespace App\Http\Controllers;

use App\Exports\UsersExport;
use App\Imports\UsersImport;
use App\Models\EvaluationSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class UserController extends Controller
{
    public function index(Request $request)
    {
        // Cache active settings for 1 hour to prevent constant DB hits during peak traffic
        $activeSetting = Cache::remember('active_evaluation_setting', 3600, function () {
            return EvaluationSetting::find(1) ?? EvaluationSetting::where('is_active', true)->first();
        });

        $academicYear = $request->input('academic_year', $activeSetting?->academic_year ?? '2025-2026');
        $rawSemester = (string) $request->input('semester', $activeSetting?->semester ?? '1st');

        // Normalize semester formats
        $isFirstSem = str_contains($rawSemester, '1');
        $shortSemester = $isFirstSem ? '1st' : '2nd';
        $selectedSemesterUi = str_contains($rawSemester, 'Summer') ? 'Summer' : $shortSemester;

        // Use uniform values matching your DB column type (e.g., ['1st', '1st Semester'] or integers)
        $semesterVariants = $isFirstSem
            ? ['1', '1st', '1st Semester']
            : ['2', '2nd', '2nd Semester'];

        $query = User::query()
            ->select('users.*')
            ->with(['section.course']);

        // Search Filter
        $query->when($request->filled('search'), function ($q) use ($request) {
            $search = $request->input('search');
            $q->where(function ($sub) use ($search) {
                $sub->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        });

        // 1. Count completed evaluations (active teachers only)
        $completedSubquery = DB::table('evaluation_results')
            ->join('teachers', 'teachers.id', '=', 'evaluation_results.teacher_id')
            ->where('teachers.is_active', true)
            ->selectRaw('COUNT(DISTINCT evaluation_results.teacher_id)')
            ->whereColumn('evaluation_results.user_id', 'users.id')
            ->where('evaluation_results.academic_year', (string) $academicYear)
            ->whereIn('evaluation_results.semester', $semesterVariants);

        $query->selectSub($completedSubquery, 'evaluations_completed_count');

        // 2. Count assigned teaching loads (active teachers only)
        $assignedSubquery = DB::table('teaching_loads')
            ->join('teachers', 'teachers.id', '=', 'teaching_loads.teacher_id')
            ->where('teachers.is_active', true)
            ->selectRaw('COUNT(DISTINCT teaching_loads.teacher_id)')
            ->whereColumn('teaching_loads.section_id', 'users.section_id')
            ->where('teaching_loads.academic_year', (string) $academicYear)
            ->whereIn('teaching_loads.semester', $semesterVariants);

        $query->selectSub($assignedSubquery, 'total_teachers_to_evaluate_count');

        // Status Filter
        if ($request->filled('evaluation_status')) {
            $query->where('role', 'student');

            if ($request->evaluation_status === 'completed') {
                $query->havingRaw('total_teachers_to_evaluate_count > 0 AND evaluations_completed_count >= total_teachers_to_evaluate_count');
            } elseif ($request->evaluation_status === 'pending') {
                $query->havingRaw('total_teachers_to_evaluate_count = 0 OR evaluations_completed_count < total_teachers_to_evaluate_count');
            }
        }

        $users = $query->paginate(10)
            ->withQueryString()
            ->through(function ($user) {
                $formattedSection = null;

                if ($user->section) {
                    $courseName = $user->section->course?->name ?? 'Course';
                    $yearLevel = $user->section->year_level;
                    $sectionNumber = $user->section->name;
                    $formattedSection = "{$courseName} {$yearLevel} - {$sectionNumber}";
                }

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'section_name' => $formattedSection,
                    'evaluations_completed_count' => (int) ($user->evaluations_completed_count ?? 0),
                    'total_teachers_to_evaluate_count' => (int) ($user->total_teachers_to_evaluate_count ?? 0),
                ];
            });

        // Cache Academic Years dropdown list
        $academicYears = Cache::remember('academic_years_list', 86400, function () {
            $years = EvaluationSetting::distinct()->pluck('academic_year')->filter()->values()->toArray();

            return ! empty($years) ? $years : ['2025-2026', '2024-2025', '2023-2024', '2022-2023'];
        });

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $request->input('search', ''),
                'evaluation_status' => $request->input('evaluation_status', ''),
                'academic_year' => $academicYear,
                'semester' => $selectedSemesterUi,
            ],
            'academicYears' => $academicYears,
        ]);
    }

    public function create()
    {
        return Inertia::render('Users/Create');
    }

    public function store(Request $request)
    {
        $trashedUser = User::onlyTrashed()->where('email', $request->email)->first();

        if ($trashedUser) {
            if ($request->boolean('confirm_restore')) {
                $validated = $request->validate([
                    'name' => 'required|string|max:255',
                    'email' => 'required|string|email|max:255',
                    'role' => 'required|string|in:student,admin,super-admin',
                    'password' => 'required|string|min:8|max:255',
                ]);

                $trashedUser->restore();
                $trashedUser->update([
                    'name' => $validated['name'],
                    'role' => $validated['role'],
                    'password' => Hash::make($validated['password']),
                ]);

                return redirect()->route('users.index')->with('success', "User account for {$trashedUser->name} restored successfully.");
            }

            return redirect()->back()->with('trashed_user', [
                'id' => $trashedUser->id,
                'name' => $trashedUser->name,
                'email' => $trashedUser->email,
                'deleted_at' => $trashedUser->deleted_at ? $trashedUser->deleted_at->format('M d, Y h:i A') : 'a previous date',
            ])->withInput();
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->whereNull('deleted_at'),
            ],
            'role' => 'required|string|in:student,admin,super-admin',
            'password' => 'required|string|min:8|max:255',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        User::create($validated);

        return redirect()->route('users.index')->with('success', 'User added successfully.');
    }

    public function show(User $user)
    {
        $user->load(['section.course']);

        $activeSetting = Cache::remember('active_evaluation_setting', 3600, function () {
            return EvaluationSetting::find(1) ?? EvaluationSetting::where('is_active', true)->first();
        });

        $completedCount = 0;
        $assignedCount = 0;

        if ($user->role === 'student' && $activeSetting) {
            $completedCount = DB::table('evaluation_results')
                ->join('teachers', 'teachers.id', '=', 'evaluation_results.teacher_id')
                ->where('teachers.is_active', true)
                ->where('evaluation_results.user_id', $user->id)
                ->where('evaluation_results.academic_year', $activeSetting->academic_year)
                ->where('evaluation_results.semester', $activeSetting->semester)
                ->distinct('evaluation_results.teacher_id')
                ->count('evaluation_results.teacher_id');

            if (method_exists($user, 'assignedTeachers')) {
                $assignedCount = $user->assignedTeachers($activeSetting)->where('teachers.is_active', true)->count();
            }
        }

        $formattedSection = null;
        if ($user->section) {
            $courseName = $user->section->course?->name ?? 'Course';
            $yearLevel = $user->section->year_level;
            $sectionNumber = $user->section->name;
            $formattedSection = "{$courseName} {$yearLevel} - {$sectionNumber}";
        }

        $user->section_name = $formattedSection;
        $user->evaluations_completed_count = $completedCount;
        $user->total_teachers_to_evaluate_count = $assignedCount;

        return Inertia::render('Users/Show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user)
    {
        return Inertia::render('Users/Edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id)->whereNull('deleted_at'),
            ],
            'role' => 'required|string|in:student,admin,super-admin',
            'password' => 'nullable|string|min:8|max:255',
        ]);

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ]);

        if ($request->filled('password')) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return redirect()->route('users.index')->with('success', "User details for {$user->name} updated.");
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }

        $userName = $user->name;
        $user->delete();

        return redirect()->back()->with('success', "User '{$userName}' has been removed.");
    }

    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:users,id',
        ]);

        $idsToDelete = array_diff($validated['ids'], [auth()->id()]);

        if (empty($idsToDelete)) {
            return redirect()->back()->with('error', 'No valid users selected for deletion.');
        }

        $count = DB::transaction(function () use ($idsToDelete) {
            return User::whereIn('id', $idsToDelete)->delete();
        });

        $message = "{$count} user(s) removed successfully.";
        if (in_array(auth()->id(), $validated['ids'])) {
            $message .= ' (Your own account was skipped)';
        }

        return redirect()->back()->with('success', $message);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
        ]);

        Excel::import(new UsersImport, $request->file('file'));

        // Clear cached academic year dropdown lists after new users/sections are imported
        Cache::forget('academic_years_list');

        return back()->with('success', 'Users imported successfully.');
    }

    public function export(Request $request)
    {
        $academicYear = $request->query('academic_year');
        $semester = $request->query('semester');

        return Excel::download(
            new UsersExport($academicYear, $semester),
            'student_evaluation_progress.xlsx'
        );
    }
}
