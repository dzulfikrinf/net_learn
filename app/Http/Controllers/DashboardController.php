<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Week;
use App\Models\Course;
use App\Models\UserProgress; // Pastikan ini ter-import
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index($slug = null)
    {
        $user = Auth::user();
        $userId = $user->id; // Kunci Anti-Cache Hosting
        $today = now()->toDateString();

        if (!$slug) {
             $slug = 'jarkom';
        }

        $course = Course::where('slug', $slug)->firstOrFail();

        // 1. KODE ASLIMU YANG SANGAT AMAN
        $weeks = Week::where('course_id', $course->id)
            ->orderBy('order', 'asc')
            ->with(['lessons' => function($query) use ($userId) {
                $query->orderBy('order', 'asc');
                $query->with(['user_progress' => function($q) use ($userId) {
                    $q->where('user_id', $userId);
                }]);
            }])
            ->get();

        // 2. SISTEM SATPAM KETAT + PENYESUAIAN REACT
        $isFirstNode = true;
        $isPreviousCompleted = true; // Modal awal agar Node 1 terbuka

        foreach ($weeks as $week) {
            foreach ($week->lessons as $lesson) {
                // Tarik data mentah dari database
                $progressData = $lesson->user_progress;
                $progress = is_iterable($progressData) ? collect($progressData)->first() : $progressData;

                $dbStatus = $progress ? $progress->status : 'locked';
                $finalStatus = 'locked';

                if ($isFirstNode) {
                    // Node 1: Selalu terbuka di awal
                    $finalStatus = ($dbStatus === 'completed') ? 'completed' : 'unlocked';
                    $isFirstNode = false;
                } else {
                    // Node selanjutnya wajib mematuhi Satpam (Apakah atasnya hijau?)
                    if ($isPreviousCompleted) {
                        $finalStatus = ($dbStatus === 'completed') ? 'completed' : 'unlocked';
                    } else {
                        $finalStatus = 'locked';
                    }
                }

                // Update variabel Satpam untuk dicek oleh materi di bawahnya
                $isPreviousCompleted = ($finalStatus === 'completed');

                // =======================================================
                // 🌟 KUNCI PERBAIKAN REACT ADA DI SINI 🌟
                // =======================================================
                if ($finalStatus === 'locked') {
                    // KOSONGKAN ARRAY! Agar komponen React merender Gembok Abu-abu
                    $lesson->setRelation('user_progress', collect([]));
                } else {
                    // ISI ARRAY! Agar komponen React merender Tombol Start/Ceklis Hijau
                    $fakeProgress = new UserProgress(['status' => $finalStatus]);
                    $lesson->setRelation('user_progress', collect([$fakeProgress]));
                }

                $lesson->setAttribute('status_user', $finalStatus);
            }
        }

        // 3. RENDER KE INERTIA
        return Inertia::render('Dashboard', [
            'auth' => ['user' => $user],
            'course' => $course,
            'weeks' => $weeks,
            'user' => $user,
            'gamification' => [
                'xp' => $user->xp,
                'rank' => $user->rank ?? 'Novice',
                'stars' => $user->stars,
                'quests' => [
                    'login' => $user->last_login_date === $today,
                    'lesson' => $user->last_lesson_completed_date === $today,
                ]
            ]
        ]);
    }
}
