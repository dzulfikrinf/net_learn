<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\Week;
use App\Models\Lesson;
use App\Models\Module;

class AddStage5Seeder extends Seeder
{
    public function run(): void
    {
        // 1. Cari Course
        $course = Course::where('slug', 'jarkom')->first();
        if (!$course) { $this->command->error('Course tidak ditemukan!'); return; }

        // 2. Pastikan Stage 5 Ada
        $week = Week::firstOrCreate(
            ['week_number' => 5, 'course_id' => $course->id],
            [
                'title' => 'Stage 5: VLSM - Variable Length Subnet Mask (Potongan Kustom)',
                'slug' => 'stage-5-vlsm',
                'description' => 'Efisiensi pengalamatan berdasarkan kebutuhan riil.',
                'order' => 5,
                'is_active' => true
            ]
        );

        // 3. Buat LESSON 27
        $lesson = Lesson::updateOrCreate(
            ['slug' => 'node-27-lab-vlsm-auto'],
            [
                'week_id' => $week->id,
                'title' => 'NODE KHUSUS - Lab VLSM Otomatis',
                'order' => 6, // Urutan ke-6 di Stage 5
                'xp_reward' => 800
            ]
        );

        // 4. Reset Modules
        Module::where('lesson_id', $lesson->id)->delete();

        // 5. Data Modul Lesson 27
        $modulesData = [
            // LAYAR 1: INTRO
            [
                'title' => 'Menangani Jaringan Skala Besar',
                'type' => 'text',
                'content' => <<<'EOT'
### 🏙️ Tantangan Skala Besar

Bayangkan kamu bekerja di sebuah gedung pencakar langit dengan 50 departemen yang berbeda.

Menghitung VLSM secara manual untuk 50 baris tentu akan memakan waktu berjam-jam dan berisiko tinggi terjadi salah ketik.

Di sinilah **Kalkulator VLSM** menjadi sahabat terbaikmu. Alat ini mampu menyusun potongan-potongan IP yang berbeda ukuran tadi secara otomatis hanya dalam hitungan detik.

Tugasmu bukan lagi menghitung satu per satu, melainkan memberikan input yang tepat agar mesin bisa bekerja dengan maksimal.
EOT
            ],

            // LAYAR 2: ALGORITMA SORTING
            [
                'title' => 'Algoritma "Si Paling Besar"',
                'type' => 'text',
                'content' => <<<'EOT'
### 🤖 Mesin Pintar Pengurut Otomatis

Kalkulator VLSM otomatis ini sudah ditanamkan logika yang kita pelajari di Node 24.

Begitu kamu memasukkan daftar kebutuhan host (walaupun urutannya acak), sistem akan secara otomatis:

1.  **Mengurutkan** kebutuhan dari yang terbesar ke terkecil.
2.  **Mencocokkan** dengan Prefix yang paling efisien.
3.  **Menghitung** Interval Blok masing-masing.
4.  **Menyusun** alamat agar rapat (tidak ada celah IP terbuang) dan tidak bentrok.

Meski mesin yang bekerja, kamu tetap harus paham bahwa jika input salah, maka seluruh topologi jaringan akan berantakan.
EOT
            ],

            // LAYAR 3: SIMULATOR VLSM OTOMATIS
            [
                'title' => 'Kalkulator VLSM Otomatis',
                'type' => 'vlsm_visualizer', // Tipe Baru: Mode Auto
                'content' => json_encode([
                    'instruction' => 'Coba tambah kebutuhan host secara ACAK (misal: kecil dulu, baru besar). Lihat bagaimana sistem merapikannya!',
                    'default_network' => '192.168.100.0/24',
                    // Kita kosongkan requirements agar user input sendiri
                    'requirements' => []
                ])
            ],

            // LAYAR 4: MEMBACA TOPOLOGI
            [
                'title' => 'Membaca Peta Topologi',
                'type' => 'text',
                'content' => <<<'EOT'
### 🗺️ Visualisasi Pohon Jaringan

Berbeda dengan cara manual yang menghasilkan tabel baris demi baris, sistem otomatis ini menghasilkan **Topologi Tree (Pohon)**.

Di visualisasi tadi, kamu bisa melihat bagaimana blok besar (Parent) dipecah menjadi cabang-cabang kecil (Child) sesuai kebutuhan.

**Validasi Efisiensi:**
Jika kamu melihat grafik tersebut tersusun rapat tanpa ada blok "Unused" yang terlalu besar di tengah-tengah, artinya rancangan jaringannya sudah sangat efisien. Di dunia kerja, visualisasi seperti ini sangat membantu untuk presentasi ke atasan atau klien!
EOT
            ]
        ];

        foreach ($modulesData as $index => $mod) {
            Module::create([
                'lesson_id' => $lesson->id,
                'title' => $mod['title'],
                'type' => $mod['type'],
                'content' => $mod['content'],
                'order' => $index + 1,
                'is_active' => true
            ]);
        }

        $this->command->info('✅ Lesson 27 (Lab VLSM Otomatis) berhasil ditambahkan!');
    }
}
