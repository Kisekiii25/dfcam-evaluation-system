<?php

namespace App\Http\Controllers;

use App\Models\EvaluationResult;
use App\Models\EvaluationSetting;
use App\Models\Section;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    /**
     * Handle the incoming request to display admin dashboard analytics.
     */
    public function index(Request $request): Response
    {
        // 1. Fetch Global Active Settings with null safety fallback
        $settings = EvaluationSetting::first();

        // 2. Determine requested filter context
        $academicYear = $request->input('academic_year', $settings?->academic_year ?? '');
        $semester = $request->input('semester', $settings?->semester ?? '');

        // 3. Fetch available terms for dropdown filtering
        $availableTerms = EvaluationResult::query()
            ->select('academic_year', 'semester')
            ->distinct()
            ->orderBy('academic_year', 'desc')
            ->orderBy('semester', 'desc')
            ->get();

        // 4. Summary Stats
        $stats = [
            'total_students' => User::where('role', 'student')->count(),
            'active_teachers' => Teacher::where('is_active', true)->count(),
            'deactivated_teachers' => Teacher::where('is_active', false)->count(),
            'total_sections' => Section::count(),
            'total_completed_evals' => EvaluationResult::query()
                ->where('academic_year', $academicYear)
                ->where('semester', $semester)
                ->distinct('user_id')
                ->count('user_id'),
        ];

        // 5. Get participated student IDs for selected term
        $completedUserIds = EvaluationResult::query()
            ->where('academic_year', $academicYear)
            ->where('semester', $semester)
            ->pluck('user_id')
            ->unique()
            ->flip();

        // Fetch sections with parent course relationship
        $sections = Section::with('course:id,name,abbreviation')->get();

        // Fetch active students grouped by section_id
        $studentsBySection = User::query()
            ->where('role', 'student')
            ->select('id', 'name', 'email', 'section_id')
            ->get()
            ->groupBy('section_id');

        // Build section progress with embedded student status
        $sectionProgress = $sections->map(function ($section) use ($studentsBySection, $completedUserIds) {
            $students = $studentsBySection->get($section->id, collect());

            $studentList = $students->map(function ($student) use ($completedUserIds) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'has_participated' => $completedUserIds->has($student->id),
                ];
            });

            $participatedCount = $studentList->where('has_participated', true)->count();

            return [
                'id' => $section->id,
                'course' => $section->course?->name ?? 'N/A',
                'course_abbr' => $section->course?->abbreviation ?? 'N/A',
                'year' => $section->year_level,
                'section' => $section->name,
                'students_participated' => $participatedCount,
                'total_students' => $studentList->count(),
                'students' => $studentList->values()->all(),
            ];
        });

        // 6. Return Inertia response
        return Inertia::render('dashboard', [
            'stats' => $stats,
            'sectionProgress' => $sectionProgress,
            'settings' => $settings,
            'availableTerms' => $availableTerms,
            'currentFilters' => [
                'academic_year' => $academicYear,
                'semester' => $semester,
            ],
        ]);
    }
}
