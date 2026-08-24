<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Section;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    /**
     * Display a listing of courses and sections.
     */
    public function index(): Response
    {
        // Fetch courses ordered by name, including the count of associated sections
        $courses = Course::withCount('sections')
            ->orderBy('name')
            ->get();

        // Fetch sections with course relation, ordered predictably
        $sections = Section::with('course:id,name,abbreviation')
            ->orderBy('name')
            ->get();

        return Inertia::render('Courses/Index', [
            'courses' => $courses,
            'sections' => $sections,
        ]);
    }

    /**
     * Store a newly created course.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('courses', 'name'),
            ],
            'abbreviation' => [
                'required',
                'string',
                'max:50',
                Rule::unique('courses', 'abbreviation'),
            ],
        ]);

        $newCourse = Course::create($validated);

        return back()->with('success', "{$newCourse->abbreviation} has been added to the catalog.");
    }

    /**
     * Update the specified course.
     */
    public function update(Request $request, Course $course): RedirectResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('courses', 'name')->ignore($course->id),
            ],
            'abbreviation' => [
                'required',
                'string',
                'max:50',
                Rule::unique('courses', 'abbreviation')->ignore($course->id),
            ],
        ]);

        $course->update($validated);

        return back()->with('success', "Updated details for {$course->abbreviation}.");
    }

    /**
     * Remove the specified course.
     */
    public function destroy(Course $course): RedirectResponse
    {
        // Prevent deletion if the course has active sections assigned
        if ($course->sections()->exists()) {
            return back()->with('error', "Cannot delete {$course->abbreviation} because it has active sections assigned to it.");
        }

        $abbreviation = $course->abbreviation;
        $course->delete();

        return back()->with('success', "Course {$abbreviation} deleted successfully.");
    }
}
