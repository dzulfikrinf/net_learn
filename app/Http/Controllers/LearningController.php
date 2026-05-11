<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Lesson;
use App\Models\Module;

class LearningController extends Controller
{
    public function show($slug)
    {
        // 1. Cari Level berdasarkan slug
        // Kita perlu load 'week.course' agar tahu lesson ini milik Course apa (Jarkom/Algo)
        $lesson = Lesson::where('slug', $slug)
            ->with([
                'week.course', // <--- TAMBAHKAN INI (Eager Loading)
                'modules' => function($query) {
                    $query->orderBy('order', 'asc');
                }
            ])
            ->firstOrFail();

        // 2. Cari Level Selanjutnya (Logic: Cari order lebih besar di course yang sama)
        // Kita cari lesson berikutnya secara global urut order
        $nextLesson = Lesson::where('order', '>', $lesson->order)
            ->orderBy('order', 'asc')
            ->first();

        // Validasi tambahan: Pastikan next lesson masih satu course (Opsional, tapi aman)
        // Jika next lesson ternyata milik course lain (misal pindah dari Jarkom ke Algo), kita stop.
        if ($nextLesson && $nextLesson->week->course_id !== $lesson->week->course_id) {
            $nextLesson = null;
        }

        // 3. Tentukan URL Tujuan jika selesai
        // Ambil slug course dari relasi: Lesson -> Week -> Course
        $courseSlug = $lesson->week->course->slug;
        $backToCourseUrl = route('course.map', $courseSlug);

        // 4. Kirim ke React
        return Inertia::render('Learning/Show', [
            'lesson' => $lesson,
            'next_lesson_url' => $nextLesson
                ? route('learning.show', $nextLesson->slug)
                : $backToCourseUrl, // <--- GANTI JADI INI
        ]);
    }
}
