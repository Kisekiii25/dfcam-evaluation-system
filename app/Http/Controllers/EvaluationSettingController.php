<?php

namespace App\Http\Controllers;

use App\Models\EvaluationSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

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

        // Check if the setting is active BUT the end_date has already passed
        if ($settings->is_active && $settings->end_date && now()->greaterThan($settings->end_date)) {
            // Automatically mark as inactive or pass an 'is_open' boolean to the UI
            $settings->is_open = false;
        } else {
            $settings->is_open = $settings->is_active;
        }

        // Format start_date and end_date for HTML datetime-local inputs
        if ($settings->start_date) {
            $settings->start_date = Carbon::parse($settings->start_date)->format('Y-m-d\TH:i');
        }
        if ($settings->end_date) {
            $settings->end_date = Carbon::parse($settings->end_date)->format('Y-m-d\TH:i');
        }

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
            'is_active' => ['boolean'],
        ]);

        // Parse dates directly into system timezone to prevent offset jumps
        $validated['start_date'] = Carbon::parse($request->input('start_date'));
        $validated['end_date'] = Carbon::parse($request->input('end_date'));

        // Force boolean conversion even if omitted from payload
        $isActive = $request->boolean('is_active');

        // If activating this setting, turn off all existing settings first
        if ($isActive) {
            EvaluationSetting::query()->update(['is_active' => false]);
        }

        $setting = EvaluationSetting::first() ?? new EvaluationSetting;
        $setting->fill($validated);
        $setting->is_active = $isActive;
        $setting->save();

        // Wipe cache entries immediately across the app
        Cache::forget('active_evaluation_setting');
        Cache::forget('academic_years_list');

        return back()->with('success', 'Evaluation period settings updated successfully.');
    }
}
