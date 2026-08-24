<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\Auth\ForcePasswordChangeController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public & Auth Redirect Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    if (Auth::check()) {
        if (Auth::user()->must_change_password) {
            return redirect()->route('password.force-change');
        }

        return Auth::user()->role === 'admin' || Auth::user()->role === 'super-admin'
            ? redirect()->route('dashboard')
            : redirect()->route('evaluation.dashboard');
    }

    return redirect()->route('login');
})->name('home');

/*
|--------------------------------------------------------------------------
| Force Password Change Routes
| (Must be excluded from 'force_password_change' middleware to prevent infinite loop)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    Route::get('/password/force-change', [ForcePasswordChangeController::class, 'show'])
        ->name('password.force-change');

    Route::post('/password/force-change', [ForcePasswordChangeController::class, 'update'])
        ->name('password.force-change.update');
});

/*
|--------------------------------------------------------------------------
| Admin Protected Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'force_password_change', 'admin'])->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Users Management
    Route::post('/users/bulk-destroy', [UserController::class, 'bulkDestroy'])->name('users.bulk-destroy');
    Route::post('/users/import', [UserController::class, 'import'])->name('users.import');
    Route::get('/users/export', [UserController::class, 'export'])->name('users.export');
    Route::resource('users', UserController::class);

    // Subjects Management
    Route::delete('/subjects/bulk-destroy', [SubjectController::class, 'bulkDestroy'])->name('subjects.bulk-destroy');
    Route::resource('subjects', SubjectController::class);

    // Courses & Sections
    Route::resource('courses', CourseController::class);
    Route::resource('sections', SectionController::class);

    // Teacher Management
    // Change Route::post to Route::delete
    Route::delete('/teachers/destroy-multiple', [TeacherController::class, 'destroyMultiple'])->name('teachers.destroy-multiple');
    Route::post('/teachers/bulk-toggle', [TeacherController::class, 'bulkToggleStatus'])->name('teachers.bulk-toggle');
    Route::get('/teachers/export', [TeacherController::class, 'export'])->name('teachers.export');
    Route::patch('/teachers/{teacher}/toggle', [TeacherController::class, 'toggleStatus'])->name('teachers.toggle');
    Route::get('/teachers/{teacher}/analytics', [TeacherController::class, 'analytics'])->name('teachers.analytics');
    Route::resource('teachers', TeacherController::class);

    // Teaching Loads Management
    Route::post('/teaching-loads', [TeacherController::class, 'assignLoad'])->name('teaching-loads.store');
    Route::delete('/teaching-loads/bulk-destroy', [TeacherController::class, 'bulkDestroyLoads'])->name('teaching-loads.bulk-destroy');
    Route::put('/teaching-loads/{teachingLoad}', [TeacherController::class, 'updateLoad'])->name('teaching-loads.update');
    Route::delete('/teaching-loads/{teachingLoad}', [TeacherController::class, 'destroyLoad'])->name('teaching-loads.destroy');

    // Student Alignment Management
    Route::get('/admin/students/sections', [TeacherController::class, 'studentSections'])->name('admin.students.sections');
    Route::patch('/admin/students/{student}/section', [TeacherController::class, 'updateStudentSection'])->name('admin.students.section.update');
    Route::post('/admin/students/sections/bulk', [TeacherController::class, 'bulkUpdateStudentSections'])->name('admin.students.sections.bulk-update');

    // Category Management
    Route::post('/categories', [QuestionController::class, 'storeCategory'])->name('categories.store');
    Route::patch('/categories/reorder', [QuestionController::class, 'reorderCategories'])->name('categories.reorder');
    Route::put('/categories/{category}', [QuestionController::class, 'updateCategory'])->name('categories.update');
    Route::delete('/categories/{category}', [QuestionController::class, 'destroyCategory'])->name('categories.destroy');

    // Question Management
    Route::patch('/questions/reorder', [QuestionController::class, 'reorder'])->name('questions.reorder');
    Route::post('/questions/bulk-destroy', [QuestionController::class, 'bulkDestroy'])->name('questions.bulk-destroy');
    Route::post('/questions', [QuestionController::class, 'storeQuestion'])->name('questions.store');
    Route::put('/questions/{question}', [QuestionController::class, 'updateQuestion'])->name('questions.update');
    Route::resource('questions', QuestionController::class)->except(['store', 'update']);

    // Evaluation Settings
    Route::post('/admin/settings/evaluation', [QuestionController::class, 'updateSettings'])->name('settings.evaluation.update');

    // Settings Sub-routes
    require __DIR__.'/settings.php';
});

/*
|--------------------------------------------------------------------------
| Student Evaluation Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'force_password_change'])->group(function () {
    // Public within student auth: Viewable even when evaluation period is closed
    Route::get('/evaluation-closed', function () {
        return Inertia::render('Student/Closed');
    })->name('evaluation.closed');

    // Active Evaluation Period Routes
    Route::middleware(['evaluation_open'])->group(function () {
        Route::get('/evaluation/dashboard', [StudentController::class, 'index'])->name('evaluation.dashboard');
        Route::get('/evaluation/select', [StudentController::class, 'selectTeacher'])->name('evaluation.select');
        Route::get('/evaluation/form/{teacher}', [StudentController::class, 'showForm'])->name('evaluation.form');
        Route::post('/evaluation/submit/{teacher}', [StudentController::class, 'submit'])->name('evaluation.submit');
    });
});

require __DIR__.'/auth.php';
