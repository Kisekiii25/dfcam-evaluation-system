<?php

namespace App\Http\Controllers;

use App\Models\EvaluationSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class EvaluationSettingController extends Controller
{
    /**
     * Display the evaluation settings page.
     */
    public function index(): Response
    {
        $settings = EvaluationSetting::where('is_active', true)->first()
            ?? EvaluationSetting::first()
            ?? new EvaluationSetting([
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

        // If activating this row, deactivate all other rows first
        if (!empty($validated['is_active'])) {
            EvaluationSetting::where('is_active', true)->update(['is_active' => false]);
        }

        $setting = EvaluationSetting::first() ?? new EvaluationSetting;
        $setting->fill($validated);
        $setting->save();

        // CRITICAL: Clear cache so StudentController picks up the changes immediately
        Cache::forget('active_evaluation_setting');
        Cache::forget('academic_years_list');

        return back()->with('success', 'Evaluation period settings updated successfully.');
    }
}
