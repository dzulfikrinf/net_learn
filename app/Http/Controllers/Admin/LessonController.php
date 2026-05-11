<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
// 👇👇 PASTIKAN SEMUA MODEL INI DI-IMPORT 👇👇
use App\Models\Lesson;
use App\Models\Module;
use App\Models\UserProgress; // <-- Tambahan: Hapus progress siswa juga

class LessonController extends Controller
{
    // ... method store dan update biarkan saja ...

    public function store(Request $request, $weekId)
    {
        $request->validate(['title' => 'required']);
        $count = Lesson::where('week_id', $weekId)->count();

        Lesson::create([
            'week_id' => $weekId,
            'title' => $request->title,
            'slug' => Str::slug($request->title) . '-' . Str::random(5),
            'order' => $count + 1,
            'xp_reward' => 100
        ]);

        return back()->with('message', 'Level berhasil ditambahkan!');
    }

    public function update(Request $request, $id)
    {
        $lesson = Lesson::findOrFail($id);
        $request->validate(['title' => 'required']);
        $lesson->update(['title' => $request->title]);
        return back()->with('message', 'Level berhasil diupdate!');
    }

    // 👇👇 UPDATE BAGIAN INI (DESTROY) 👇👇
    public function destroy($id)
    {
        // 1. Cari Levelnya
        $lesson = Lesson::findOrFail($id);

        // 2. Ambil semua ID Module di dalam lesson ini
        $moduleIds = $lesson->modules()->pluck('id');

        // 3. Hapus Data Progress Siswa (UserProgress) yang terkait modul ini
        // (Kalau gak dihapus, database nolak karena ada history nilai siswa)
        UserProgress::whereIn('module_id', $moduleIds)->delete();

        // 4. Hapus Semua Module (Quest) di dalamnya
        $lesson->modules()->delete();

        // 5. Terakhir, Hapus Levelnya
        $lesson->delete();

        return back()->with('message', 'Level berhasil dihapus bersih!');
    }
}
