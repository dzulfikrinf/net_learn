<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Week;
use App\Models\Lesson;
use App\Models\Module;

class AddLesson4Seeder extends Seeder
{
    public function run(): void
    {
        // 1. Cari Week 1
        $week = Week::where('week_number', 1)->first();

        if (!$week) {
            $this->command->error('Week 1 tidak ditemukan!');
            return;
        }

        $this->command->info('Menambahkan Lesson 6: Network vs Host...');

        // 2. Buat Lesson 6
        $lesson = Lesson::updateOrCreate(
            ['slug' => 'node-6-net-vs-host'],
            [
                'week_id' => $week->id,
                'title' => 'Network vs Host (Siapa Ketua Geng?)',
                'order' => 6,
                'xp_reward' => 300
            ]
        );

        // 3. Masukkan Modules
        Module::where('lesson_id', $lesson->id)->delete();

        $modulesData = [
            // LAYAR 1: ANALOGI
            [
                'title' => 'Analogi Jalan & Rumah',
                'type' => 'text',
                'content' => <<<'EOT'
### 🚚 Kurir Paket & Alamat

Bayangkan kamu sedang memesan paket secara online. Di label pengiriman, kurir butuh dua info krusial:

1.  **Nama Jalan/Kota:** Memberi tahu di wilayah mana rumahmu berada.
2.  **Nomor Rumah:** Menunjukkan rumah spesifik milikmu.

Di dunia jaringan, IP Address bekerja persis sama.

* **Network ID** = Nama Jalan
* **Host ID** = Nomor Rumah

> 🤝 **Aturan Main:** Agar dua perangkat bisa ngobrol langsung tanpa Router, mereka WAJIB berada di 'Jalan' atau 'Geng' yang sama!
EOT
            ],

            // LAYAR 2: TABEL HTML KEREN (SUDAH DIUPDATE)
            [
                'title' => 'Porsi & Batas Wilayah',
                'type' => 'text',
                'content' => <<<'EOT'
### 🍰 Pembagian Kue Porsi

Karena kebutuhan organisasi beda-beda, 'batas' antara Jalan dan Rumah ini bergeser tergantung Kelas IP-nya. Hafalkan pembagian 'porsi' ini:

<div class="overflow-x-auto my-6 shadow-md rounded-lg">
    <table class="w-full text-sm text-left border border-slate-200 dark:border-slate-700">
        <thead class="text-xs uppercase bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            <tr>
                <th class="px-4 py-3">Kelas</th>
                <th class="px-4 py-3">Porsi Network (Jalan)</th>
                <th class="px-4 py-3">Porsi Host (Rumah)</th>
                <th class="px-4 py-3">Struktur Visual</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <tr class="bg-white dark:bg-slate-800">
                <td class="px-4 py-3 font-bold text-lg">A</td>
                <td class="px-4 py-3 text-blue-600 font-bold">Oktet 1</td>
                <td class="px-4 py-3 text-slate-500">Oktet 2, 3, 4</td>
                <td class="px-4 py-3 font-mono">
                    <span class="bg-blue-100 text-blue-700 px-1 rounded border border-blue-300">NET</span>.<span class="text-green-600">HOST</span>.<span class="text-green-600">HOST</span>.<span class="text-green-600">HOST</span>
                </td>
            </tr>
            <tr class="bg-slate-50 dark:bg-slate-800/50">
                <td class="px-4 py-3 font-bold text-lg">B</td>
                <td class="px-4 py-3 text-blue-600 font-bold">Oktet 1, 2</td>
                <td class="px-4 py-3 text-slate-500">Oktet 3, 4</td>
                <td class="px-4 py-3 font-mono">
                    <span class="bg-blue-100 text-blue-700 px-1 rounded border border-blue-300">NET.NET</span>.<span class="text-green-600">HOST</span>.<span class="text-green-600">HOST</span>
                </td>
            </tr>
            <tr class="bg-white dark:bg-slate-800">
                <td class="px-4 py-3 font-bold text-lg">C</td>
                <td class="px-4 py-3 text-blue-600 font-bold">Oktet 1, 2, 3</td>
                <td class="px-4 py-3 text-slate-500">Oktet 4</td>
                <td class="px-4 py-3 font-mono">
                    <span class="bg-blue-100 text-blue-700 px-1 rounded border border-blue-300">NET.NET.NET</span>.<span class="text-green-600">HOST</span>
                </td>
            </tr>
        </tbody>
    </table>
</div>

**Keterangan Warna:**
* <span class="text-blue-600 font-bold">🔵 Biru (Network ID)</span>: Bagian ini WAJIB SAMA untuk semua komputer.
* <span class="text-green-600 font-bold">🟢 Hijau (Host ID)</span>: Bagian ini HARUS BEDA untuk setiap komputer.
EOT
            ],

            // LAYAR 3: CONTOH KASUS
            [
                'title' => 'Bedah Contoh Nyata',
                'type' => 'text',
                'content' => <<<'EOT'
### 🧐 Mari Kita Bedah!

**Contoh 1 (Kelas C): `192.168.1.50`**
* **Network ID:** `192.168.1` (3 angka depan adalah nama Geng).
* **Host ID:** `50` (Nomor urut anggota).
* *Skenario:* Dia bisa ngobrol langsung dengan `192.168.1.99`, tapi TIDAK bisa dengan `192.168.2.50`.

**Contoh 2 (Kelas B): `172.16.10.5`**
* **Network ID:** `172.16` (2 angka depan adalah Geng).
* **Host ID:** `10.5` (Identitas anggota).

**Contoh 3 (Kelas A): `10.50.1.1`**
* **Network ID:** `10` (Hanya angka depan).
* **Host ID:** `50.1.1` (Ruang anggotanya luas banget!).
EOT
            ],
            // LAYAR 4: GAME CARD SORTER
            [
                'title' => 'Misi: Bedah Anatomi IP',
                'type' => 'game_sorter',
                'content' => json_encode([
                    'instruction' => 'Tentukan mana potongan NETWORK ID (Jalan) dan mana potongan HOST ID (Rumah) berdasarkan Kelasnya!',
                    'categories' => ['Kepingan Network ID', 'Kepingan Host ID'],
                    'items' => [
                        // Kasus Kelas C (192.168.1.10)
                        ['text' => '192.168.1 (C)', 'category' => 'Kepingan Network ID'],
                        ['text' => '.10 (C)', 'category' => 'Kepingan Host ID'],

                        // Kasus Kelas A (10.5.5.5)
                        ['text' => '10 (A)', 'category' => 'Kepingan Network ID'],
                        ['text' => '.5.5.5 (A)', 'category' => 'Kepingan Host ID'],

                        // Kasus Kelas B (172.16.20.1)
                        ['text' => '172.16 (B)', 'category' => 'Kepingan Network ID'],
                        ['text' => '.20.1 (B)', 'category' => 'Kepingan Host ID'],
                    ]
                ])
            ],
            // LAYAR 5: QUIZ
            [
                'title' => 'Uji Pemahaman',
                'type' => 'quiz',
                'content' => json_encode([
                    'question' => 'Jika komputer A punya IP 192.168.1.5 (Kelas C) dan Komputer B punya IP 192.168.2.5. Apakah mereka bisa ping langsung?',
                    'options' => [
                        'A. Bisa, karena nomor belakangnya sama (5)',
                        'B. Bisa, karena sama-sama Kelas C',
                        'C. Tidak, karena Network ID (Nama Jalan) mereka berbeda',
                        'D. Tidak, karena kabelnya putus'
                    ],
                    'correct_answer' => 'C'
                ])
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

        $this->command->info('✅ Lesson 6 berhasil ditambahkan!');
    }
}
