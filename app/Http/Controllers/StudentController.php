<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\EvaluationResult;
use App\Models\EvaluationSetting;
use App\Models\Teacher;
use App\Models\TeachingLoad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StudentController extends Controller
{
    /**
     * Helper: Fetch active evaluation setting directly.
     */
    private function getActiveSettings(): ?EvaluationSetting
    {
        return EvaluationSetting::where('is_active', true)->first();
    }

    /**
     * Helper: Normalize semester formats into standard integer values.
     */
    private function getSemesterVariants(string $semester): array
    {
        // Extract numbers from strings like "1st Semester" or "Semester 2"
        preg_match('/\d+/', $semester, $matches);

        // Return an integer matching your PostgreSQL schema
        $semNumber = isset($matches[0]) ? (int) $matches[0] : 1;

        return [$semNumber];
    }

    public function index()
    {
        $user = Auth::user();

        if ($user && in_array($user->role, ['admin', 'super-admin'])) {
            return redirect()->route('dashboard');
        }

        $settings = $this->getActiveSettings();

        return Inertia::render('Student/Dashboard', [
            'settings' => $settings,
        ]);
    }

    public function selectTeacher()
    {
        $user = Auth::user();

        if ($user && in_array($user->role, ['admin', 'super-admin'])) {
            return redirect()->route('dashboard');
        }

        $settings = $this->getActiveSettings();

        if (! $settings) {
            return Inertia::render('Student/SelectTeacher', [
                'teachers' => [],
                'settings' => null,
                'evaluatedTeacherIds' => [],
                'error' => 'No active evaluation period configured.',
            ]);
        }

        $semesterVariants = $this->getSemesterVariants((string) $settings->semester);

        if (! $user->section_id) {
            $teachers = [];
        } else {
            $teachers = Teacher::where('is_active', true)
                ->whereHas('teachingLoads', function ($query) use ($user, $settings, $semesterVariants) {
                    $query->where('section_id', $user->section_id)
                        ->where('academic_year', (string) $settings->academic_year)
                        ->whereIn('semester', $semesterVariants);
                })
                // Constrain teachingLoads AND eager load 'subject'
                ->with(['teachingLoads' => function ($query) use ($user, $settings, $semesterVariants) {
                    $query->where('section_id', $user->section_id)
                        ->where('academic_year', (string) $settings->academic_year)
                        ->whereIn('semester', $semesterVariants)
                        ->with('subject');
                }])
                ->orderBy('name', 'asc')
                ->get();
        }

        $evaluatedTeacherIds = EvaluationResult::where('user_id', $user->id)
            ->where('academic_year', (string) $settings->academic_year)
            ->whereIn('semester', $semesterVariants)
            ->pluck('teacher_id')
            ->unique()
            ->values()
            ->toArray();

        return Inertia::render('Student/SelectTeacher', [
            'teachers' => $teachers,
            'settings' => $settings,
            'evaluatedTeacherIds' => $evaluatedTeacherIds,
        ]);
    }

    public function showForm(Request $request, Teacher $teacher)
    {
        $user = Auth::user();

        if ($user && in_array($user->role, ['admin', 'super-admin'])) {
            return redirect()->route('dashboard');
        }

        if (! $teacher->is_active) {
            return redirect()->route('evaluation.select')
                ->with('error', 'This instructor account is currently inactive.');
        }

        $settings = $this->getActiveSettings();

        if (! $settings || ! $settings->isOpen()) {
            return redirect()->route('evaluation.select')
                ->with('error', 'Evaluation portal is currently closed.');
        }

        $user->load('section.course');
        $semesterVariants = $this->getSemesterVariants((string) $settings->semester);

        $isValidLoad = TeachingLoad::where('teacher_id', $teacher->id)
            ->where('section_id', $user->section_id)
            ->where('academic_year', (string) $settings->academic_year)
            ->whereIn('semester', $semesterVariants)
            ->exists();

        if (! $isValidLoad) {
            return redirect()->route('evaluation.dashboard')
                ->with('error', 'Access Denied: This instructor is not assigned to your section.');
        }

        $hasEvaluated = EvaluationResult::where('user_id', $user->id)
            ->where('teacher_id', $teacher->id)
            ->where('academic_year', (string) $settings->academic_year)
            ->whereIn('semester', $semesterVariants)
            ->exists();

        if ($hasEvaluated) {
            return redirect()->route('evaluation.select')
                ->with('error', 'You have already completed the evaluation for this instructor.');
        }

        $categories = Category::with(['questions' => function ($query) {
            $query->orderBy('order', 'asc');
        }])
            ->orderBy('order', 'asc')
            ->get();

        $userSection = $user->section;
        $selection = [
            'course' => $userSection?->course?->name ?? '',
            'year' => $userSection?->year_level ?? '',
            'section' => $userSection?->name ?? '',
        ];

        return Inertia::render('Student/EvaluationForm', [
            'teacher' => $teacher,
            'categories' => $categories,
            'settings' => $settings,
            'selection' => $selection,
        ]);
    }

    public function submit(Request $request, Teacher $teacher)
    {
        $user = Auth::user();

        if ($user && in_array($user->role, ['admin', 'super-admin'])) {
            return redirect()->route('dashboard');
        }

        if (! $teacher->is_active) {
            return redirect()->route('evaluation.select')
                ->with('error', 'Evaluation submission rejected: Instructor account is inactive.');
        }

        $settings = $this->getActiveSettings();

        if (! $settings || ! $settings->isOpen()) {
            return redirect()->route('evaluation.select')
                ->with('error', 'Submission rejected: Evaluation period is not active.');
        }

        $user->load('section.course');
        $semesterVariants = $this->getSemesterVariants((string) $settings->semester);

        $validated = $request->validate([
            'ratings' => 'required|array',
            'ratings.*' => 'required',
        ]);

        $isValidLoad = TeachingLoad::where('teacher_id', $teacher->id)
            ->where('section_id', $user->section_id)
            ->where('academic_year', (string) $settings->academic_year)
            ->whereIn('semester', $semesterVariants)
            ->exists();

        if (! $isValidLoad) {
            return redirect()->back()
                ->with('error', 'Security Alert: Unauthorized evaluation submission path.');
        }

        $alreadySubmitted = EvaluationResult::where('user_id', $user->id)
            ->where('teacher_id', $teacher->id)
            ->where('academic_year', (string) $settings->academic_year)
            ->whereIn('semester', $semesterVariants)
            ->exists();

        if ($alreadySubmitted) {
            return redirect()->route('evaluation.select')
                ->with('error', 'You have already evaluated this teacher.');
        }

        $userSection = $user->section;
        $now = now();

        // Extract clean semester number (e.g., '1' or '2') for consistent storage
        preg_match('/\d+/', (string) $settings->semester, $semMatch);
        $cleanSemester = $semMatch[0] ?? (string) $settings->semester;

        $insertData = [];
        foreach ($validated['ratings'] as $questionId => $answer) {
            if ($answer === null || $answer === '') {
                continue;
            }

            $insertData[] = [
                'user_id' => $user->id,
                'teacher_id' => $teacher->id,
                'question_id' => $questionId,
                'answer' => (string) $answer,
                'selected_course' => $userSection?->course?->name ?? '',
                'selected_year' => $userSection?->year_level ?? '',
                'selected_section' => $userSection?->name ?? '',
                'academic_year' => (string) $settings->academic_year,
                'semester' => $cleanSemester, // Store normalized semester '1' or '2'
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::transaction(function () use ($insertData) {
            EvaluationResult::insert($insertData);
        });

        return redirect()->route('evaluation.select')
            ->with('success', 'Evaluation submitted successfully!');
    }
}
