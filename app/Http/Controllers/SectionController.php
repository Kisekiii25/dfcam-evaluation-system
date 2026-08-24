<?php

namespace App\Http\Controllers;

use App\Models\Section;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SectionController extends Controller
{
    /**
     * Store a newly created section in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'exists:courses,id'],
            'year_level' => ['required', 'integer', 'min:1', 'max:5'],
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('sections')->where(function ($query) use ($request) {
                    return $query->where('course_id', $request->course_id)
                        ->where('year_level', $request->year_level);
                }),
            ],
        ]);

        $section = Section::create($validated);

        // Eagerly load course relation for user notification display
        $courseAbbr = $section->course?->abbreviation ?? 'Course';

        return back()->with('success', "New section added: {$courseAbbr} {$section->year_level}-{$section->name}");
    }

    /**
     * Update the specified section in storage.
     */
    public function update(Request $request, Section $section): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'exists:courses,id'],
            'year_level' => ['required', 'integer', 'min:1', 'max:5'],
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('sections')->where(function ($query) use ($request) {
                    return $query->where('course_id', $request->course_id)
                        ->where('year_level', $request->year_level);
                })->ignore($section->id),
            ],
        ]);

        $section->update($validated);

        return back()->with('success', 'Section details updated successfully.');
    }

    /**
     * Remove the specified section from storage.
     */
    public function destroy(Section $section): RedirectResponse
    {
        $courseAbbr = $section->course?->abbreviation ?? 'Section';
        $label = "{$courseAbbr} {$section->year_level}-{$section->name}";

        try {
            $section->delete();

            return back()->with('success', "Section {$label} has been deleted.");
        } catch (QueryException $e) {
            return back()->with('error', "Cannot delete {$label} because it is assigned to existing students or class schedules.");
        }
    }
}
