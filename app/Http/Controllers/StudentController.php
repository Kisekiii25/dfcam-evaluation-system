<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\EvaluationResult;
use App\Models\EvaluationSetting;
use App\Models\Teacher;
use App\Models\TeachingLoad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StudentController extends Controller
{
    /**
     * Helper: Fetch active evaluation settings with cache fallback.
     */
    private function getActiveSettings(): ?EvaluationSetting
    {
        return Cache::remember('active_evaluation_setting', 3600, function () {
            return EvaluationSetting::where('is_active', true)->first()
                ?? EvaluationSetting::find(1);
        });
    }

    public function index()
    {
        $settings = $this->getActiveSettings();

        return Inertia::render('Student/Dashboard', [
            'settings' => $settings
        ]);
    }

    public function selectTeacher()
    {
        $settings = $this->getActiveSettings();

        if (!$settings) {
            return Inertia::render('Student/SelectTeacher', [
                'teachers' => [],
                'settings' => null,
                'evaluatedTeacherIds' => [],
                'error' => 'No active evaluation period configured.'
            ]);
        }

        $user = Auth::user();

        if (!$user->section_id) {
            $teachers = [];
        } else {
            $teachers = Teacher::where('is_active', true)
                ->whereHas('teachingLoads', function ($query) use ($user, $settings) {
                    $query->where('section_id', $user->section_id)
                        ->where('academic_year', $settings->academic_year)
                        ->where('semester', $settings->semester);
                })
                ->with(['teachingLoads.section.course'])
                ->orderBy('name', 'asc')
                ->get();
        }

        $evaluatedTeacherIds = EvaluationResult::where('user_id', $user->id)
            ->where('academic_year', $settings->academic_year)
            ->where('semester', $settings->semester)
            ->pluck('teacher_id')
            ->unique()
            ->values()
            ->toArray();

        return Inertia::render('Student/SelectTeacher', [
            'teachers'            => $teachers,
            'settings'            => $settings,
            'evaluatedTeacherIds' => $evaluatedTeacherIds
        ]);
    }

    public function showForm(Request $request, Teacher $teacher)
    {
        if (!$teacher->is_active) {
            return redirect()->route('evaluation.select')
                ->with('error', 'This instructor account is currently inactive.');
        }

        $settings = $this->getActiveSettings();

        if (!$settings || !$settings->isOpen()) {
            return redirect()->route('evaluation.select')
                ->with('error', 'Evaluation portal is currently closed.');
        }

        $user = Auth::user()->load('section.course');

        $isValidLoad = TeachingLoad::where('teacher_id', $teacher->id)
            ->where('section_id', $user->section_id)
            ->where('academic_year', $settings->academic_year)
            ->where('semester', $settings->semester)
            ->exists();

        if (!$isValidLoad) {
            return redirect()->route('evaluation.dashboard')
                ->with('error', 'Access Denied: This instructor is not assigned to your section.');
        }

        $hasEvaluated = EvaluationResult::where('user_id', $user->id)
            ->where('teacher_id', $teacher->id)
            ->where('academic_year', $settings->academic_year)
            ->where('semester', $settings->semester)
            ->exists();

        if ($hasEvaluated) {
            return back()->with('message', 'You have already completed the evaluation for this instructor.');
        }

        $categories = Category::with(['questions' => function ($query) {
            $query->orderBy('order', 'asc');
        }])
            ->orderBy('order', 'asc')
            ->get();

        $userSection = $user->section;
        $selection = [
            'course'  => $userSection?->course?->name ?? '',
            'year'    => $userSection?->year_level ?? '',
            'section' => $userSection?->name ?? '',
        ];

        return Inertia::render('Student/EvaluationForm', [
            'teacher'    => $teacher,
            'categories' => $categories,
            'settings'   => $settings,
            'selection'  => $selection
        ]);
    }

    public function submit(Request $request, Teacher $teacher)
    {
        if (!$teacher->is_active) {
            return redirect()->route('evaluation.select')
                ->with('error', 'Evaluation submission rejected: Instructor account is inactive.');
        }

        $settings = $this->getActiveSettings();

        if (!$settings || !$settings->isOpen()) {
            return redirect()->route('evaluation.select')
                ->with('error', 'Submission rejected: Evaluation period is not active.');
        }

        $user = Auth::user()->load('section.course');

        // FIX: Allow both numeric ratings and string comments/text
        $validated = $request->validate([
            'ratings'   => 'required|array',
            'ratings.*' => 'required', // Removed strict 'numeric' requirement
        ]);

        $isValidLoad = TeachingLoad::where('teacher_id', $teacher->id)
            ->where('section_id', $user->section_id)
            ->where('academic_year', $settings->academic_year)
            ->where('semester', $settings->semester)
            ->exists();

        if (!$isValidLoad) {
            return redirect()->back()
                ->with('error', 'Security Alert: Unauthorized evaluation submission path.');
        }

        $alreadySubmitted = EvaluationResult::where('user_id', $user->id)
            ->where('teacher_id', $teacher->id)
            ->where('academic_year', $settings->academic_year)
            ->where('semester', $settings->semester)
            ->exists();

        if ($alreadySubmitted) {
            return redirect()->back()
                ->with('error', 'You have already evaluated this teacher.');
        }

        $userSection = $user->section;
        $now = now();

        $insertData = [];
        foreach ($validated['ratings'] as $questionId => $answer) {
            // Skip null or empty values if optional text fields were submitted empty
            if ($answer === null || $answer === '') {
                continue;
            }

            $insertData[] = [
                'user_id'          => $user->id,
                'teacher_id'       => $teacher->id,
                'question_id'      => $questionId,
                'answer'           => (string)$answer, // Safely cast to string
                'selected_course'  => $userSection?->course?->name ?? '',
                'selected_year'    => $userSection?->year_level ?? '',
                'selected_section' => $userSection?->name ?? '',
                'academic_year'    => $settings->academic_year,
                'semester'         => $settings->semester,
                'created_at'       => $now,
                'updated_at'       => $now,
            ];
        }

        DB::transaction(function () use ($insertData) {
            EvaluationResult::insert($insertData);
        });

        return redirect()->route('evaluation.select')
            ->with('success', 'Evaluation submitted successfully!');
    }
}
