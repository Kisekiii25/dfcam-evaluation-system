<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\EvaluationSetting;
use App\Models\Question;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class QuestionController extends Controller
{
    /**
     * Display the Questionnaire Builder page.
     */
    public function index()
    {
        $settings = Cache::remember('active_evaluation_setting', 3600, function () {
            return EvaluationSetting::find(1) ?? EvaluationSetting::where('is_active', true)->first();
        });

        // Format dates into standard ISO datetime-local format (YYYY-MM-DDTHH:MM) for HTML inputs
        if ($settings) {
            $settings->start_date = $settings->start_date ? \Carbon\Carbon::parse($settings->start_date)->format('Y-m-d\TH:i') : null;
            $settings->end_date = $settings->end_date ? \Carbon\Carbon::parse($settings->end_date)->format('Y-m-d\TH:i') : null;
        }

        return Inertia::render('Questions/Index', [
            'questions' => Question::with('category')->orderBy('order', 'asc')->get(),
            'categories' => Category::orderBy('order', 'asc')->get(),
            'settings' => $settings,
        ]);
    }

    public function updateSettings(Request $request)
    {
        Cache::forget('active_evaluation_setting');

        $validated = $request->validate([
            'academic_year' => 'required|string|max:50',
            'semester'      => 'required|string|max:50',
            'start_date'    => 'required|date',
            'end_date'      => 'required|date|after:start_date',
        ]);

        // Parse explicitly without forcing endOfDay()
        $validated['start_date'] = Carbon::parse($request->input('start_date'))->timezone('Asia/Manila');
        $validated['end_date']   = Carbon::parse($request->input('end_date'))->timezone('Asia/Manila');

        EvaluationSetting::updateOrCreate(
            ['id' => 1],
            $validated
        );

        Cache::forget('active_evaluation_setting');

        return back()->with('success', 'Evaluation settings and active term updated successfully.');
    }

    /**
     * Store a new Category.
     */
    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:categories,name',
        ]);

        // Automatically assign the next incremented order position
        $maxOrder = Category::max('order') ?? 0;
        $validated['order'] = $maxOrder + 1;

        $category = Category::create($validated);

        return back()->with('success', "Category '{$category->name}' added successfully.");
    }

    /**
     * Store a new Question.
     */
    public function storeQuestion(Request $request)
    {
        $validated = $request->validate([
            'question_text' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'type' => 'required|in:rating,comment',
        ]);

        // Automatically assign the next order position across questions
        $maxOrder = Question::max('order') ?? 0;
        $validated['order'] = $maxOrder + 1;

        Question::create($validated);

        return back()->with('success', 'New evaluation question added.');
    }

    /**
     * Update the 'order' position for multiple questions during drag-and-drop.
     *
     * NOTE FOR FUTURE UPDATES:
     * Wrapping batch updates in DB::transaction ensures that if the request breaks mid-sequence,
     * the order indices revert safely rather than leaving questions with corrupted ordering.
     */
    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:questions,id',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['ids'] as $index => $id) {
                Question::where('id', $id)->update(['order' => $index]);
            }
        });

        return back()->with('success', 'Question ordering updated successfully.');
    }

    /**
     * Update the 'order' position for multiple categories during drag-and-drop.
     */
    public function reorderCategories(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:categories,id',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['ids'] as $index => $id) {
                Category::where('id', $id)->update(['order' => $index]);
            }
        });

        return back()->with('success', 'Category ordering updated successfully.');
    }

    /**
     * Update an existing category.
     */
    public function updateCategory(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('categories', 'name')->ignore($category->id),
            ],
        ]);

        $category->update($validated);

        return back()->with('success', 'Category updated successfully.');
    }

    /**
     * Update an existing question.
     */
    public function updateQuestion(Request $request, Question $question)
    {
        $validated = $request->validate([
            'question_text' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'type' => 'required|in:rating,comment',
        ]);

        $question->update($validated);

        return back()->with('success', 'Question updated successfully.');
    }

    /**
     * Delete a single question.
     */
    public function destroy(Question $question)
    {
        $question->delete();

        return back()->with('success', 'Question removed successfully.');
    }

    /**
     * Delete a single category.
     *
     * NOTE FOR FUTURE UPDATES:
     * Ensure your categories table migration includes soft deletes or cascade rules on questions
     * if you do not want child questions orphaned when deleting a category.
     */
    public function destroyCategory(Category $category)
    {
        $categoryName = $category->name;
        $category->delete();

        return back()->with('success', "Category '{$categoryName}' and related structures removed.");
    }

    /**
     * Bulk delete selected questions.
     */
    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:questions,id',
        ]);

        $count = DB::transaction(function () use ($validated) {
            return Question::whereIn('id', $validated['ids'])->delete();
        });

        return back()->with('success', "{$count} selected question(s) removed successfully.");
    }
}
