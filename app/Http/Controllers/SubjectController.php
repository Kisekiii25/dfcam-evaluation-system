<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index()
    {
        return Inertia::render('Subjects/Index', [
            'subjects' => Subject::orderBy('code', 'asc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:subjects,code',
            'description' => 'nullable|string'
        ]);

        Subject::create($validated);

        return back()->with('success', 'New subject added.');
    }

    public function show(Subject $subject)
    {
        return Inertia::render('Subjects/Show', [
            'subject' => $subject
        ]);
    }

    // Unnecessary if deleting Subjects/Edit.tsx, but retained to avoid broken web.php route calls
    public function edit(Subject $subject)
    {
        return redirect()->route('subjects.index');
    }

    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('subjects')->ignore($subject->id),
            ],
            'description' => 'nullable|string'
        ]);

        $subject->update($validated);

        return back()->with('info', 'Changes have been saved.');
    }

    public function destroy(Subject $subject)
    {
        $code = $subject->code;
        $subject->delete();

        return back()->with('error', "Subject [{$code}] has been removed.");
    }

    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:subjects,id',
        ]);

        $count = DB::transaction(function () use ($validated) {
            return Subject::whereIn('id', $validated['ids'])->delete();
        });

        return redirect()->back()->with('success', "{$count} selected subject(s) deleted successfully.");
    }
}
