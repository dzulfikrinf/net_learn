<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use App\Models\Course;
use App\Models\Week;

class CourseController extends Controller
{
    /**
     * Menampilkan Halaman Peta Dunia (World Map Editor).
     * Route: GET /admin/content
     */
    public function index()
    {
        // ... (kode atas biarkan sama) ...
        $course = Course::first();

        if (!$course) {
             // ... (fallback create course biarkan sama) ...
        }

        // Ambil data Stages (Weeks)
        $weeks = Week::with(['lessons' => function($query) {
            $query->orderBy('order', 'asc'); // Lesson juga harus order by 'order'
        }])
        ->where('course_id', $course->id)

        // 👇 PERBAIKAN DISINI: Ganti 'week_number' jadi 'order'
        ->orderBy('order', 'asc')
        ->get();

        return Inertia::render('Admin/Content/CourseManager', [
            'course' => $course,
            'weeks' => $weeks
        ]);
    }

    /**
     * Membuat Course Baru (Opsional, jika ingin multi-world).
     * Route: POST /admin/course
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Course::create([
            'title' => $request->title,
            'slug' => Str::slug($request->title),
            'description' => $request->description,
        ]);

        return back()->with('message', 'World baru berhasil diciptakan!');
    }

    // ==========================================
    // MANAJEMEN STAGE (WEEK)
    // ==========================================

    /**
     * Menambah Stage (Week) Baru.
     * Route: POST /admin/course/{courseId}/week
     */
    public function storeWeek(Request $request, $courseId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $maxOrder = Week::where('course_id', $courseId)->max('order');
        $newOrder = $maxOrder ? $maxOrder + 1 : 1;

        Week::create([
            'course_id' => $courseId,
            'title' => $request->title,
            'description' => $request->description,
            'week_number' => $newOrder, // Biar konsisten
            'order' => $newOrder,       // <--- PENTING: Isi kolom order juga
            'is_active' => true,
        ]);

        return back()->with('message', 'Stage baru berhasil dibuka!');
    }

    /**
     * Mengupdate Nama/Deskripsi Stage.
     * Route: PUT /admin/week/{id}
     */
    public function updateWeek(Request $request, $id)
    {
        $week = Week::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $week->update([
            'title' => $request->title,
            'description' => $request->description,
        ]);

        return back()->with('message', 'Informasi Stage berhasil diperbarui!');
    }

    // SIMPAN URUTAN STAGE (DRAG & DROP)
    public function reorderWeeks(Request $request, $courseId)
    {
        // 1. Validasi: Pastikan 'weeks' adalah array berisi angka (ID)
        $request->validate([
            'weeks'   => 'required|array',
            'weeks.*' => 'required|integer|exists:weeks,id',
        ]);

        // 2. Loop array ID tersebut
        // Index 0 = Urutan 1
        // Index 1 = Urutan 2, dst...
        foreach ($request->weeks as $index => $weekId) {
            Week::where('id', $weekId)->update([
                'order' => $index + 1
            ]);
        }

        return back()->with('success', 'Urutan stage berhasil diperbarui!');
    }

    /**
     * Menghapus Stage.
     * Route: DELETE /admin/week/{id}
     */
    public function destroyWeek($id)
    {
        $week = Week::findOrFail($id);

        // Hapus Stage (Laravel otomatis menghapus anak-anaknya jika di migration pakai onDelete cascade)
        // Jika tidak cascade, manual: $week->lessons()->delete();
        $week->delete();

        return back()->with('message', 'Stage telah dihancurkan!');
    }
}
