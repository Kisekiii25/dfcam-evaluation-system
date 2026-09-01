<?php

namespace App\Http\Controllers;

use App\Exports\TeacherResultsExport;
use App\Models\Category;
use App\Models\EvaluationResult;
use App\Models\EvaluationSetting;
use App\Models\Section;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeachingLoad;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class TeacherController extends Controller
{
    /**
     * Display a listing of the resource with calculated overall ratings.
     */
    public function index()
    {
        // 1. Retrieve active evaluation settings (cached)
        $settings = Cache::remember('active_evaluation_setting', 3600, function () {
            return EvaluationSetting::find(1) ?? EvaluationSetting::where('is_active', true)->first();
        });

        $academicYear = (string) ($settings->academic_year ?? '');
        $semester = (string) ($settings->semester ?? '');

        // Subquery to calculate average rating per teacher in 1 query (with PostgreSQL type cast)
        $avgSubquery = EvaluationResult::join('questions', 'questions.id', '=', 'evaluation_results.question_id')
            ->whereColumn('evaluation_results.teacher_id', 'teachers.id')
            ->where('evaluation_results.academic_year', $academicYear)
            ->where('evaluation_results.semester', $semester)
            ->where('questions.type', 'rating')
            ->selectRaw('ROUND(AVG(CAST(evaluation_results.answer AS INTEGER)), 2)');

        // 2. Load teachers with computed rating in a single SQL operation
        $teachers = Teacher::select('teachers.*')
            ->selectSub($avgSubquery, 'computed_rating')
            ->latest()
            ->get()
            ->map(function ($teacher) {
                $teacher->rating = $teacher->computed_rating ? number_format($teacher->computed_rating, 2) : 'N/A';

                return $teacher;
            });

        return Inertia::render('Teachers/Index', [
            'teachers' => $teachers,
        ]);
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'employee_id' => 'required|string|unique:teachers,employee_id',
        ]);

        Teacher::create($validated);

        return back()->with('success', 'Teacher added successfully.');
    }

    public function show(Teacher $teacher)
    {
        return Inertia::render('Teachers/Show', [
            'teacher' => $teacher->load('teachingLoads.subject', 'teachingLoads.section.course'),
            'subjects' => Subject::all(),
            'sections' => Section::with('course')->get(),
        ]);
    }

    public function assignLoad(Request $request)
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'subject_id' => 'required|exists:subjects,id',
            'section_id' => [
                'required',
                'exists:sections,id',
                Rule::unique('teaching_loads')->where(function ($query) use ($request) {
                    return $query->where('teacher_id', $request->teacher_id)
                        ->where('subject_id', $request->subject_id)
                        ->where('academic_year', $request->academic_year)
                        ->where('semester', $request->semester);
                }),
            ],
            'academic_year' => 'required|string',
            'semester' => 'required',
        ]);

        TeachingLoad::create($validated);
        $teacher = Teacher::find($validated['teacher_id']);

        return to_route('teachers.show', $teacher->id)
            ->with('success', "Subject assigned to {$teacher->name}.");
    }

    public function updateLoad(Request $request, TeachingLoad $teachingLoad)
    {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'section_id' => 'required|exists:sections,id',
            'academic_year' => 'required|string',
            'semester' => 'required',
        ]);

        $teachingLoad->update($validated);

        return back()->with('success', 'Teaching load updated successfully.');
    }

    public function destroyLoad(TeachingLoad $teachingLoad)
    {
        $teachingLoad->delete();

        return back()->with('success', 'Teaching load removed successfully.');
    }

    public function bulkDestroyLoads(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:teaching_loads,id',
        ]);

        TeachingLoad::whereIn('id', $validated['ids'])->delete();

        return back()->with('success', count($validated['ids']) . ' teaching loads deleted successfully.');
    }

    public function toggleStatus(Teacher $teacher)
    {
        $teacher->update([
            'is_active' => ! $teacher->is_active,
        ]);

        if ($teacher->is_active) {
            return back()->with('success', 'Teacher account has been activated.');
        }

        return back()->with('info', 'Teacher account has been deactivated.');
    }

    public function bulkToggleStatus(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:teachers,id',
            'is_active' => 'required|boolean',
        ]);

        Teacher::whereIn('id', $validated['ids'])
            ->update(['is_active' => $validated['is_active']]);

        $status = $validated['is_active'] ? 'activated' : 'deactivated';

        return back()->with('success', "Selected teacher account(s) have been {$status}.");
    }

    public function edit(Teacher $teacher)
    {
        //
    }

    public function update(Request $request, Teacher $teacher)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'employee_id' => [
                'required',
                'string',
                Rule::unique('teachers')->ignore($teacher->id),
            ],
        ]);

        $teacher->update($validated);

        return back()->with('success', 'Teacher updated successfully.');
    }

    public function destroy(Teacher $teacher)
    {
        $name = $teacher->name;
        $teacher->delete();

        return back()->with('success', "Teacher '{$name}' has been removed from the system.");
    }

    public function destroyMultiple(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:teachers,id',
        ]);

        Teacher::destroy($validated['ids']);

        return back()->with('success', 'Selected teacher records deleted successfully.');
    }

    /**
     * Display evaluation metrics, category breakdowns, and qualitative feedback for a teacher.
     */
    public function analytics(Teacher $teacher)
    {
        $settings = Cache::remember('active_evaluation_setting', 3600, function () {
            return EvaluationSetting::find(1) ?? EvaluationSetting::where('is_active', true)->first();
        });

        $academicYear = (string) ($settings->academic_year ?? '');
        $semester = (string) ($settings->semester ?? '');

        // 1. Single query to fetch ALL question averages for this teacher (with PostgreSQL type cast)
        $questionAverages = EvaluationResult::join('questions', 'questions.id', '=', 'evaluation_results.question_id')
            ->where('evaluation_results.teacher_id', $teacher->id)
            ->where('evaluation_results.academic_year', $academicYear)
            ->where('evaluation_results.semester', $semester)
            ->where('questions.type', 'rating')
            ->groupBy('evaluation_results.question_id', 'questions.category_id')
            ->select(
                'evaluation_results.question_id',
                'questions.category_id',
                DB::raw('AVG(CAST(evaluation_results.answer AS INTEGER)) as avg_score')
            )
            ->get();

        // ... rest of analytics method remains unchanged

        $questionAvgMap = $questionAverages->pluck('avg_score', 'question_id');
        $overallAverage = $questionAverages->avg('avg_score');

        // 2. Build Category & Question Breakdown in RAM without hitting the DB repeatedly
        $categories = Category::with(['questions' => function ($query) {
            $query->where('type', 'rating')->orderBy('order', 'asc');
        }])->orderBy('order', 'asc')->get();

        $categoryBreakdown = $categories->map(function ($category) use ($questionAvgMap) {
            $catScores = [];

            $questions = $category->questions->map(function ($question) use ($questionAvgMap, &$catScores) {
                $qAvg = $questionAvgMap->get($question->id);
                if ($qAvg !== null) {
                    $catScores[] = (float) $qAvg;
                }

                return [
                    'id' => $question->id,
                    'question_text' => $question->question_text,
                    'average' => $qAvg !== null ? round((float) $qAvg, 2) : null,
                ];
            });

            $catAvg = ! empty($catScores) ? array_sum($catScores) / count($catScores) : null;

            return [
                'id' => $category->id,
                'name' => $category->name,
                'average' => $catAvg !== null ? round($catAvg, 2) : null,
                'questions' => $questions,
            ];
        });

        // 3. Fetch Qualitative Comments in 1 combined query
        $allComments = EvaluationResult::join('questions', 'questions.id', '=', 'evaluation_results.question_id')
            ->where('evaluation_results.teacher_id', $teacher->id)
            ->where('evaluation_results.academic_year', $academicYear)
            ->where('evaluation_results.semester', $semester)
            ->where('questions.type', 'comment')
            ->select('questions.category_id', 'evaluation_results.answer as text', 'evaluation_results.created_at')
            ->orderBy('evaluation_results.created_at', 'desc')
            ->get()
            ->groupBy('category_id');

        $categoryComments = $categories->map(function ($category) use ($allComments) {
            return [
                'category_id' => $category->id,
                'category_name' => $category->name,
                'comments' => $allComments->get($category->id, collect())->values(),
            ];
        });

        return Inertia::render('Teachers/Analytics', [
            'teacher' => $teacher,
            'metrics' => [
                'overall_average' => $overallAverage !== null ? round((float) $overallAverage, 2) : 'N/A',
                'category_breakdown' => $categoryBreakdown,
                'category_comments' => $categoryComments,
            ],
            'settings' => $settings,
        ]);
    }

    public function studentSections()
    {
        $students = User::where('role', 'student')
            ->with('section.course')
            ->orderBy('name', 'asc')
            ->get();

        $sections = Section::with('course')->orderBy('name', 'asc')->get();

        return Inertia::render('Users/StudentSections', [
            'students' => $students,
            'sections' => $sections,
        ]);
    }

    public function updateStudentSection(Request $request, User $student)
    {
        $validated = $request->validate([
            'section_id' => 'nullable|exists:sections,id',
        ]);

        $student->update([
            'section_id' => $validated['section_id'],
        ]);

        return back()->with('success', "Assigned {$student->name} to their section successfully.");
    }

    public function bulkUpdateStudentSections(Request $request)
    {
        $validated = $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:users,id',
            'section_id' => 'nullable|exists:sections,id',
        ]);

        User::whereIn('id', $validated['student_ids'])
            ->where('role', 'student')
            ->update(['section_id' => $validated['section_id']]);

        return back()->with('success', 'Selected student alignments updated successfully.');
    }

    public function export(Request $request)
    {
        $timestamp = now()->format('Y-m-d_h-ia');

        $settings = Cache::remember('active_evaluation_setting', 3600, function () {
            return EvaluationSetting::find(1) ?? EvaluationSetting::where('is_active', true)->first();
        });

        $academicYear = $request->query('academic_year') ?? ($settings->academic_year ?? '');
        $semester = $request->query('semester') ?? ($settings->semester ?? '');

        return Excel::download(
            new TeacherResultsExport($academicYear, $semester),
            "Teacher_Evaluation_Results_{$timestamp}.xlsx"
        );
    }
}
