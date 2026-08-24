<?php

namespace App\Http\Controllers;

use App\Models\EvaluationSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EvaluationSettingController extends Controller
{
    /**
     * Display the evaluation settings page.
     */
    public function index(): Response
    {
        // Fetch existing settings or return a default baseline object to prevent null frontend crashes
        $settings = EvaluationSetting::first() ?? new EvaluationSetting([
            'academic_year' => '',
            'semester' => '',
            'start_date' => null,
            'end_date' => null,
            'is_active' => false,
        ]);

        return Inertia::render('Admin/Settings/Evaluation', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update or create the evaluation settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'academic_year' => ['required', 'string', 'max:20'],
            'semester' => ['required', 'string', 'max:50'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        // Safely update the single setting record or create it if missing
        $setting = EvaluationSetting::first() ?? new EvaluationSetting;
        $setting->fill($validated);
        $setting->save();

        return back()->with('success', 'Evaluation period settings updated successfully.');
    }
}
