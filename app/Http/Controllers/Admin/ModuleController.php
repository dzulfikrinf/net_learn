<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Lesson;
use App\Models\Module;
use Inertia\Inertia;

class ModuleController extends Controller
{
    // 1. FUNGSI MENAMPILKAN HALAMAN FORM
    public function create($lessonId)
    {
        $lesson = Lesson::findOrFail($lessonId);

        // Cari urutan order terakhir, lalu tambah 1 (biar otomatis urut)
        $nextOrder = Module::where('lesson_id', $lessonId)->max('order') + 1;

        return Inertia::render('Admin/Content/CreateModule', [
            'lesson' => $lesson,
            'nextOrder' => $nextOrder
        ]);
    }

    // 2. FUNGSI MENYIMPAN DATA KE DATABASE
   public function store(Request $request, $lessonId)
    {
        // 1. Validasi Input (PERBAIKI LIST TYPE AGAR SESUAI FRONTEND)
        $request->validate([
            'type'    => 'required|in:text,video,quiz,simulator_cidr,simulator_flsm,simulator_vlsm,code_editor',
            'content' => 'nullable',
            'data'    => 'nullable', // Biarkan nullable, jangan dipaksa array dulu
            'order'   => 'required|integer'
        ]);

        // 2. Logic Penyimpanan Data JSON
        // Jika data dikirim sebagai Object dari frontend, kita encode jadi JSON String untuk database
        // Jika data dikirim sebagai String JSON dari frontend, kita simpan langsung
        $jsonData = $request->data;
        if (is_array($request->data) || is_object($request->data)) {
            $jsonData = json_encode($request->data);
        }

        Module::create([
            'lesson_id' => $lessonId,
            'type'      => $request->type,
            'content'   => $request->content,
            'data'      => $jsonData,
            'order'     => $request->order
        ]);

        // 3. Gunakan BACK() agar tidak terlempar ke dashboard
        return back()->with('message', 'Materi berhasil ditambahkan!');
    }

    // PERBAIKAN FUNGSI UPDATE
    public function update(Request $request, $id)
    {
        $module = Module::findOrFail($id);

        $request->validate([
            'type'    => 'required|in:text,video,quiz,simulator_cidr,simulator_flsm,simulator_vlsm,code_editor',
            'content' => 'nullable',
            'order'   => 'required|integer',
            'data'    => 'nullable'
        ]);

        $jsonData = $request->data;
        if (is_array($request->data) || is_object($request->data)) {
            $jsonData = json_encode($request->data);
        }

        $module->update([
            'type'    => $request->type,
            'content' => $request->content,
            'order'   => $request->order,
            'data'    => $jsonData
        ]);

        return back()->with('message', 'Modul berhasil diperbarui!');
    }

    public function index($lessonId)
    {
        // 1. Cari Lesson beserta Module-nya (urutkan berdasarkan order)
        $lesson = Lesson::with(['modules' => function($query) {
            $query->orderBy('order', 'asc');
        }])->findOrFail($lessonId);

        // 2. Kirim ke React
        return Inertia::render('Admin/Content/ManageModules', [
            'lesson' => $lesson,
            'modules' => $lesson->modules // <--- INI WAJIB ADA
        ]);
    }

    // 2. DESTROY (HAPUS)
    public function destroy($id)
    {
        $module = \App\Models\Module::findOrFail($id);
        $module->delete();

        return back()->with('message', 'Modul berhasil dihapus!');
    }

    // 2. PROSES PENYIMPANAN URUTAN BARU (AJAX)
    public function reorder(Request $request, $lessonId)
    {
        $request->validate([
            'modules' => 'required|array'
        ]);

        // Loop array yang dikirim dari frontend
        // Array index 0 = order 1, index 1 = order 2, dst...
        foreach ($request->modules as $index => $moduleData) {
            Module::where('id', $moduleData['id'])->update([
                'order' => $index + 1
            ]);
        }

        return back()->with('message', 'Urutan berhasil diperbarui!');
    }
}
