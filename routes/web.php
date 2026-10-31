<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;

// Controllers - Student Area
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController; // Controller Lama (Peta + Leaderboard)
use App\Http\Controllers\CourseUserController; // Dashboard Awal (Pilih Course)
use App\Http\Controllers\LearningController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\ChatbotController;

// Controllers - Admin Area
use App\Http\Controllers\AdminController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\LessonController;
use App\Http\Controllers\Admin\ModuleController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Redirect Halaman Depan ke Login
Route::get('/', function () {
    return redirect()->route('login');
});

// ==================================================================================
// 1. AREA SISWA (STUDENT)
// ==================================================================================
Route::middleware('auth')->group(function () {

    // A. Dashboard Utama (Halaman Pilih Mata Pelajaran)
    Route::get('/dashboard', [CourseUserController::class, 'index'])->name('dashboard');

    // B. Peta Belajar (World Map)
    // PENTING: Menggunakan DashboardController (Versi Lama) agar Leaderboard & Badge muncul
    Route::get('/course/{slug}', [DashboardController::class, 'index'])->name('course.map');

    // C. Ruang Belajar (Gameplay)
    Route::prefix('belajar')->group(function () {
        // Tampilan Materi
        Route::get('/{slug}', [LearningController::class, 'show'])->name('learning.show');

        // Logika Progress & Timer
        Route::post('/{id}/start', [ProgressController::class, 'start'])->name('learning.start');
        Route::post('/{id}/fail', [ProgressController::class, 'recordFailure'])->name('learning.fail');
        Route::post('/{id}/complete', [ProgressController::class, 'complete'])->name('learning.complete');
    });

    // D. Fitur Tambahan
    Route::get('/leaderboard', [LeaderboardController::class, 'index'])->name('leaderboard');
    Route::post('/chatbot/ask', [ChatbotController::class, 'ask'])->name('chatbot.ask');
    Route::post('/chatbot/ask-stage', [ChatbotController::class, 'askStage'])->name('chatbot.askStage');
    Route::get('/about', function () {
        return Inertia::render('About');
    })->name('about');

    // E. Profil User
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


// ==================================================================================
// 2. AREA GURU / ADMIN
// ==================================================================================
Route::middleware(['auth', 'verified', 'admin'])->group(function () {

    // A. Dashboard Guru & Manajemen Siswa
    Route::prefix('teacher')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'index'])->name('admin.dashboard');

        // Detail Siswa & Laporan AI
        Route::get('/student/{id}', [AdminController::class, 'show'])->name('admin.student_detail');
        Route::post('/student/{id}/analyze', [AdminController::class, 'generateAndSaveAIReport'])->name('admin.student_analyze');
        Route::post('/student/{id}/refresh-ai', [AdminController::class, 'forceRegenerateReport'])->name('admin.student_refresh_ai');
        Route::post('/reset-password/{id}', [AdminController::class, 'resetPassword'])->name('admin.reset_password');
        Route::post('/chatbot/ask-admin', [ChatbotController::class, 'askAdmin'])->name('chatbot.ask_admin');
    });

    // B. Manajemen Course (Mata Pelajaran)
    Route::prefix('admin')->group(function () {
        Route::get('/content', [CourseController::class, 'index'])->name('admin.content.index');
        Route::post('/course', [CourseController::class, 'store'])->name('admin.course.store');

        // --- Manajemen Week (Stage) ---
        Route::post('/course/{courseId}/week', [CourseController::class, 'storeWeek'])->name('admin.week.store');
        Route::post('/course/{courseId}/reorder-weeks', [CourseController::class, 'reorderWeeks'])->name('admin.weeks.reorder');
        Route::put('/week/{id}', [CourseController::class, 'updateWeek'])->name('admin.week.update');
        Route::delete('/week/{id}', [CourseController::class, 'destroyWeek'])->name('admin.week.destroy');

        // --- Manajemen Lesson (Level) ---
        Route::post('/week/{weekId}/lesson', [LessonController::class, 'store'])->name('admin.lesson.store');
        Route::post('/week/{weekId}/reorder-lessons', [LessonController::class, 'reorder'])->name('admin.lessons.reorder');
        Route::put('/lesson/{id}', [LessonController::class, 'update'])->name('admin.lesson.update');
        Route::delete('/lesson/{id}', [LessonController::class, 'destroy'])->name('admin.lesson.destroy');

        // --- Manajemen Module (Quest / Konten Drag & Drop) ---
        // List Modul
        Route::get('/lesson/{lessonId}/modules', [ModuleController::class, 'index'])->name('admin.lesson.modules');

        // CRUD Modul
        Route::post('/lesson/{lessonId}/modules', [ModuleController::class, 'store'])->name('admin.module.store');
        Route::put('/module/{id}', [ModuleController::class, 'update'])->name('admin.module.update');
        Route::delete('/module/{id}', [ModuleController::class, 'destroy'])->name('admin.module.destroy');

        // Reorder Modul
        Route::post('/lesson/{id}/reorder', [ModuleController::class, 'reorder'])->name('admin.modules.reorder');

        // Route untuk melihat hasil rekap ujian (1 dan 0)
        Route::get('/admin/exam-report/{lesson_id}', [\App\Http\Controllers\AdminController::class, 'showExamReport'])->name('admin.exam.report');
        // Tambahkan ini di dalam grup Route Admin kamu
        Route::post('/admin/lessons/{id}/toggle-lock', [\App\Http\Controllers\AdminController::class, 'toggleLessonLock'])->name('admin.lessons.toggle-lock');
    });
});

require __DIR__.'/auth.php';
