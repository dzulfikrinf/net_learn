<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\Week; // <--- WAJIB IMPORT INI
use App\Models\UserProgress;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class CourseUserController extends Controller
{
    // 1. INDEX: Untuk Halaman Pilih Course (Sudah Benar)
    public function index()
    {
        // ... (Biarkan kode index kamu yang lama, tidak perlu diubah) ...
        $user = Auth::user();
        $courses = Course::withCount('lessons')->get()->map(function ($course) use ($user) {
             // ... logika hitung progress ...
             $completedCount = UserProgress::where('user_id', $user->id)
                ->where('status', 'completed')
                ->whereHas('lesson.week', function ($query) use ($course) {
                    $query->where('course_id', $course->id);
                })
                ->count();

            $percent = $course->lessons_count > 0 ? round(($completedCount / $course->lessons_count) * 100) : 0;

            return [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'description' => $course->description,
                'icon' => $course->icon,
                'theme' => $course->color_theme,
                'progress' => $percent,
                'total_lessons' => $course->lessons_count,
                'completed_lessons' => $completedCount
            ];
        });

        return Inertia::render('CourseSelection', [
            'courses' => $courses,
            'user' => $user
        ]);
    }

    // 2. SHOW: Untuk Halaman Peta/Map (INI YANG HARUS DITAMBAHKAN)
    // Fungsi ini menangani route: /course/{slug}
    public function show($slug)
    {
        $user = Auth::user();

        // Cari Course berdasarkan slug
        $course = Course::where('slug', $slug)->firstOrFail();

        // AMBIL DATA WEEKS (STAGE)
        // Disinilah KUNCI perbaikan urutannya!
        $weeks = Week::where('course_id', $course->id)
            ->with(['lessons' => function($query) use ($user) {
                // Load lesson urut berdasarkan order
                $query->orderBy('order', 'asc')
                      // Load progress user di setiap lesson agar tahu mana yg terkunci/terbuka
                      ->with(['user_progress' => function($q) use ($user) {
                          $q->where('user_id', $user->id);
                      }]);
            }])
            ->orderBy('week_number', 'asc') // <--- WAJIB: Urutkan Sesuai Drag & Drop Admin
            ->get();

        return Inertia::render('Student/Course/Show', [ // Sesuaikan nama file React kamu
            'course' => $course,
            'weeks' => $weeks,
            'user' => $user
        ]);
    }
}
