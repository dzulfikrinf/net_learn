<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Week;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\UserProgress;
use App\Models\Course;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        // ==========================================
        // 1. BERSIHKAN DATABASE (RESET)
        // ==========================================
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        UserProgress::truncate();
        Module::truncate();
        Lesson::truncate();
        Week::truncate();
        Course::truncate();
        User::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // ==========================================
        // 2. SETUP USER & COURSE UTAMA
        // ==========================================

        // Buat User Guru & Siswa
        User::create([
            'name' => 'Pak Guru',
            'email' => 'guru@netlearn.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'xp' => 9999
        ]);

        User::create([
            'name' => 'Siswa Test',
            'email' => 'admin@netlearn.com',
            'password' => Hash::make('password'),
            'role' => 'student',
            'xp' => 0
        ]);

        // Buat Course Jarkom
        $courseJarkom = Course::create([
            'title' => 'Jaringan Komputer & Subnetting',
            'slug' => 'jarkom',
            'description' => 'Petualangan Menjadi Ahli Jaringan (Zero to Hero).',
            'icon' => 'FaNetworkWired',
            'color_theme' => 'blue'
        ]);

        // Buat Course Coding (Optional, biar gak error kalo dipanggil)
        Course::create([
            'title' => 'Python for Beginners',
            'slug' => 'python',
            'description' => 'Belajar logika pemrograman dasar.',
            'icon' => 'FaCode',
            'color_theme' => 'green'
        ]);

        // ==========================================
        // 3. MASTER PLAN MATERI (ARRAY STRUKTUR)
        // ==========================================
        // Disini kita menyusun materi Level 1 sesuai request fitur baru

        $jarkomStages = [
            // --- STAGE 1 ---
            [
                'title' => 'Stage 1: Fondasi Digital',
                'description' => 'Memahami identitas perangkat dalam jaringan.',
                'lessons' => [
                    // LEVEL 1: APA ITU IP?
                    [
                        'title' => 'Identitas Digital: Apa itu IP?',
                        'modules' => [
                            // Modul 1: Teks Intro (Markdown)
                            [
                                'title' => 'Analogi',
                                'type' => 'text',
                                'content' => <<<'EOT'
### Si Kurir yang Kebingungan

Bayangkan kamu lagi asyik mabar (main bareng) game online. Kamu menekan tombol 'Skill 1' untuk menyerang lawan. Di detik itu juga, perintahmu dikemas menjadi sebuah Paket Data dan dikirim lewat kabel atau sinyal Wi-Fi.

Tapi masalahnya, di luar sana ada jutaan komputer dan HP yang lagi tersambung ke internet. Tanpa ada sistem alamat yang jelas, paket datamu bakal kayak surat tanpa nama jalan: **Bingung mau ke mana dan akhirnya hilang di tengah jalan**.

Inilah gunanya **IP Address (Internet Protocol Address)**. Ia bukan sekadar angka pajangan, tapi 'KTP' atau alamat rumah bagi setiap perangkat agar paket data tahu persis ke mana mereka harus mampir.
EOT
                            ],
                            [
                                'title' => 'Lanjutan Analogi',
                                'type' => 'text',
                                'content' => <<<'EOT'
### Kenapa Harus "Protokol" dan "Unik"?

Mungkin kamu mikir: 'Kenapa nggak pake nama aja, misal HP-Budi-Ganteng?'.

Masalahnya, di dunia ini ada jutaan orang bernama Budi. Kalau Pak Pos Digital (Router) disuruh cari 'HP-Budi', dia bakal pusing tujuh keliling. Makanya, dunia sepakat pakai aturan global yang disebut Protokol.

Aturan mainnya simpel tapi galak: **Setiap perangkat dalam satu jaringan yang sama WAJIB punya IP Address yang berbeda (Unik)**. Kalau ada dua perangkat punya IP yang sama? Bakal terjadi IP Conflict. Ibarat dua rumah punya nomor yang sama di satu gang, kurir bakal bingung dan akhirnya kedua rumah itu nggak bakal pernah dapet kiriman paketnya sama sekali!
EOT
                            ],
                            [
                                'title' => 'Lanjutan Analogi',
                                'type' => 'text',
                                'content' => <<<'EOT'
### Mengenal Wujudnya (IPv4)

Alamat yang paling sering kita pakai sekarang disebut IPv4. Wujudnya terdiri dari 4 kelompok angka yang dipisahkan oleh titik, contohnya: 192.168.1.1.

Setiap kelompok angka ini punya batasan (nanti kita bahas di node selanjutnya), tapi yang penting kamu tahu dulu bahwa setiap angka ini mewakili lokasi perangkatmu di dalam peta jaringan yang luas.
EOT
                            ],
                            // Modul 2: Card Sorter (Fitur Baru!)
                            [
                                'title' => 'Misi: Kenali Format IP',
                                'type' => 'game_sorter',
                                'content' => json_encode([
                                    'instruction' => 'Bantu admin memisahkan mana format IP Address (v4) dan mana yang bukan!',
                                    'categories' => ['✅ Ini IP Address', '❌ Bukan IP Address'],
                                    'items' => [
                                        // IP Address (Format x.x.x.x)
                                        ['text' => '192.168.1.1', 'category' => '✅ Ini IP Address'],
                                        ['text' => '10.0.0.1', 'category' => '✅ Ini IP Address'],
                                        ['text' => '8.8.8.8', 'category' => '✅ Ini IP Address'],

                                        // JEBAKAN (Identitas Lain)
                                        ['text' => 'admin@sekolah.sch.id', 'category' => '❌ Bukan IP Address'], // Email
                                        ['text' => '00:1B:44:11:3A:B7', 'category' => '❌ Bukan IP Address'], // MAC Addr
                                        ['text' => 'www.google.com', 'category' => '❌ Bukan IP Address'], // Domain
                                        ['text' => '0812-3456-7890', 'category' => '❌ Bukan IP Address'], // No HP
                                    ]
                                ])
                            ],
                            // Modul 3: Kuis
                            [
                                'title' => 'Validasi Pemahaman',
                                'type' => 'quiz',
                                'content' => json_encode([
                                    'question' => 'Mengapa dua komputer dalam satu jaringan lokal TIDAK BOLEH punya IP yang sama?',
                                    'options' => [
                                        'A. Karena akan menyebabkan konflik (tabrakan) data',
                                        'B. Karena komputer akan meledak',
                                        'C. Boleh saja asalkan mereknya sama',
                                        'D. Supaya hemat listrik'
                                    ],
                                    'correct_answer' => 'A'
                                ])
                            ]
                        ]
                    ],

                    // LEVEL 2: MATEMATIKA BINER (Contoh Level Selanjutnya)
                    [
                        'title' => 'Bahasa Mesin: Biner & Bit',
                        'modules' => [
                            // LAYAR 1
                            [
                                'title' => 'Komputer Itu "Buta"',
                                'type' => 'text',
                                'content' => <<<'EOT'
### Komputer Tidak Tahu Angka 9

Pernah nggak kamu kepikiran, gimana caranya kabel atau Wi-Fi ngirim angka `192`? Apakah kabelnya jadi berbentuk angka dua? Tentu nggak.

Komputer itu sebenarnya **'buta'** terhadap angka desimal (0-9). Di dalam prosesor, cuma ada satu hal yang dimengerti: **Listrik**.

Cuma ada dua kondisi:
* ⚡ **ON** (Ada tegangan) = **1**
* 🌑 **OFF** (Mati) = **0**

Inilah **Bilangan Biner**. Satu kotak ON/OFF ini disebut **1 bit**. Jadi, waktu kamu ngetik IP Address, kamu sebenernya lagi nyusun pola sakelar listrik yang sangat panjang!
EOT
                            ],
                            // LAYAR 2
                            [
                                'title' => 'Kekuatan 8 Bit (Oktet)',
                                'type' => 'text',
                                'content' => <<<'EOT'
### Kenapa Harus 8?

Kalau cuma satu bit (0 atau 1), kita cuma bisa kirim dua pesan: Ya atau Tidak. Biar bisa kirim pesan rumit, komputer menggabungkan bit-bit ini.

Dalam jaringan, satu kelompok standar terdiri dari **8 bit**. Kelompok ini disebut **Byte** atau **Oktet**.

Kenapa 8? Karena dengan 8 sakelar, kita bisa bikin **256 kombinasi** angka (0 sampai 255).

> Itulah alasan kenapa IP Address dibagi jadi 4 kelompok. Setiap kelompok itu isinya 8 bit biner yang bersembunyi di balik angka desimal.
EOT
                            ],
                            // LAYAR 3 (MENJELASKAN RUMUS SEBELUM GAME)
                            [
                                'title' => 'Rahasia Nilai Sakelar',
                                'type' => 'text',
                                'content' => <<<'EOT'
###  Rumus Ajaib

Gimana cara ngubah sakelar ON/OFF jadi angka `192`? Setiap sakelar punya **'bobot'** sendiri dari kanan ke kiri:

`128 | 64 | 32 | 16 | 8 | 4 | 2 | 1`

Kalau kamu menyalakan lampu paling kiri (128) dan lampu kedua (64), tinggal dijumlahkan:
**128 + 64 = 192**.

Gampang, kan? Angka desimal itu cuma 'total belanjaan' dari lampu yang kamu nyalakan. Sekarang, coba sendiri!
EOT
                            ],
                            // LAYAR 4 (GAME TOGGLER)
                            [
                                'title' => 'Simulasi: Nyalakan Bit!',
                                'type' => 'game_toggler',
                                'content' => json_encode([
                                    'target' => 192, // Target angka yang harus dicapai
                                ])
                            ],
                            // LAYAR 5 (PENUTUP)
                            [
                                'title' => 'Rangkuman',
                                'type' => 'text',
                                'content' => <<<'EOT'
### Kamu Baru Saja Berbicara Bahasa Mesin!

Selamat! Kamu baru saja menerjemahkan listrik menjadi angka.

* `11000000` dalam bahasa mesin.
* `192` dalam bahasa manusia.

Ingat pola **128, 64, 32...** ini baik-baik, karena ini adalah kunci utama untuk menghitung Subnetting nanti.
EOT
                            ]
                        ]
                    ],
                    // level 3: STRUKTUR OKTET & KONVERSI
                    [
                        'title' => 'Struktur Oktet: 4 Kotak Ajaib',
                        'modules' => [
                            // LAYAR 1 (Intro - Tetap)
                            [
                                'title' => 'Manusia vs Komputer',
                                'type' => 'text',
                                'content' => <<<'EOT'
### 🤯 Pusing Lihat Angka Biner?
Komputer berkomunikasi pakai biner:
`11000000101010000000000100000001`

Kita manusia susah bacanya. Makanya, para ahli sepakat memotong deretan **32 bit** itu menjadi **4 bagian (Oktet)**.
EOT
                            ],
                            // LAYAR 2 (Format Titik - Tetap)
                            [
                                'title' => 'The Dotted Decimal',
                                'type' => 'text',
                                'content' => <<<'EOT'
### ⚫ Titik Pemisah

Setiap bagian (Oktet) berisi **8 bit**. Biar gampang dibaca, setiap oktet dipisahkan oleh **Titik (.)**.
Setiap oktet kemudian dikonversi menjadi angka Desimal (0-255).

Format: `[Oktet 1] . [Oktet 2] . [Oktet 3] . [Oktet 4]`

Sebagai siswa SMK TKJ, kamu wajib bisa menerjemahkan biner ini menjadi desimal agar bisa melakukan konfigurasi jaringan!
EOT
                            ],
                            // LAYAR 3 (Alasan - Tetap)
                            [
                                'title' => 'Kenapa Harus 4?',
                                'type' => 'text',
                                'content' => <<<'EOT'
### 🏠 Network & Host

Pembagian 4 oktet ini memudahkan kita memisahkan **Network ID** (Alamat Jalan) dan **Host ID** (Nomor Rumah).

Tanpa ini, router bakal bingung. Sekarang, mari kita buktikan skill hitunganmu!
EOT
                            ],
                            // LAYAR 4 (GAME: HITUNG MANUAL DENGAN BANTUAN)
                            [
                                'title' => 'Challenge: Konversi IP',
                                'type' => 'smart_form',
                                'content' => json_encode([
                                    'instruction' => 'Hitung biner di bawah ini menjadi IP Address desimal!',

                                    // Kita kasih RUMUSNYA saja, bukan jawabannya.
                                    'problem' => "Soal: 11000000 . 10101000 . 00000001 . 00000010\n\nRumus Bantu (Urutan Bit):\n[128 - 64 - 32 - 16 - 8 - 4 - 2 - 1]\n\nContoh Oktet 1 (11000000):\nBit 1 (128) + Bit 2 (64) = 192.\nSekarang hitung sisanya!",

                                    'fields' => [
                                        // Oktet 1 (Contoh sudah dikasih, biar mereka paham cara mainnya)
                                        ['id' => 'oct1', 'answer' => '192'],

                                        // Oktet 2: 10101000 -> 128 + 32 + 8 = 168 (Mereka harus hitung)
                                        ['id' => 'oct2', 'answer' => '168'],

                                        // Oktet 3: 00000001 -> 1 (Mudah)
                                        ['id' => 'oct3', 'answer' => '1'],

                                        // Oktet 4: 00000010 -> 2 (Mudah)
                                        ['id' => 'oct4', 'answer' => '2'],
                                    ]
                                ])
                            ],
                            // LAYAR 5 (Penutup)
                            [
                                'title' => 'Level Up!',
                                'type' => 'text',
                                'content' => <<<'EOT'
### 🎉 Skill Unlocked: Binary Conversion

Mantap! IP Address-nya adalah: **192.168.1.2**

Kalau kamu bisa menghitung tadi tanpa kalkulator, berarti kamu sudah siap untuk materi **Subnetting**.

Ingat, di dunia kerja nanti, kamu sering ketemu situasi di mana kamu harus menghitung prefix `/24`, `/27`, atau `/30` secara cepat. Latihan tadi adalah pemanasan yang bagus!
EOT
                            ]
                        ]
                    ],
                    // LEVEL 4: PENGENALAN SUBNETTING (TEKS SAJA)
                    [
                        'title' => 'Batas Angka: Kenapa Maksimal 255?',
                        'modules' => [
                            // LAYAR 1
                            [
                                'title' => 'Filosofi Galon Air',
                                'type' => 'text',
                                'content' => <<<'EOT'
### 💧 Galon vs Botol Kecil

Pernah nggak kamu mencoba memasukkan air satu galon ke dalam botol minum kecil? Pasti tumpah, kan?

Sama halnya dengan IP Address.

Di Node 2, kita belajar kalau satu oktet itu isinya **8 bit** (8 sakelar). Komputer punya aturan matematika yang kaku: kamu cuma punya **8 tempat** untuk meletakkan angka biner.

> ⚠️ Kamu tidak bisa menambah tempat ke-9 atau ke-10. Karena keterbatasan inilah, muncul sebuah **batas angka maksimal**.
EOT
                            ],
                            // LAYAR 2
                            [
                                'title' => 'Matematika "Lampu Disko"',
                                'type' => 'text',
                                'content' => <<<'EOT'
### 🧮 Mari Kita Hitung!

Kalau semua 8 sakelar kita matikan (`00000000`), nilainya adalah **0**.

Tapi, kalau semua 8 sakelar kita nyalakan (`11111111`), mari jumlahkan bobotnya:

`128 + 64 + 32 + 16 + 8 + 4 + 2 + 1` = **255**

Hasilnya adalah **255**. Tidak ada cara lain secara matematika biner 8-bit untuk menghasilkan angka 256, 300, apalagi 500.

> Jadi, kalau kamu melihat angka di atas 255 dalam sebuah oktet, itu artinya sakelarnya 'jebol' atau formatnya salah!
EOT
                            ],
                            // LAYAR 3 (GAME: SORTIR VALID vs INVALID)
                            [
                                'title' => 'Misi: Quality Control',
                                'type' => 'game_sorter',
                                'content' => json_encode([
                                    'instruction' => 'Sebagai Network Engineer, sortir mana IP yang VALID (0-255) dan mana yang ILEGAL (>255)!',

                                    'categories' => ['✅ IP Valid (Aman)', '⛔ IP Ilegal (Jebol)'],

                                    'items' => [
                                        // VALID (Aman)
                                        ['text' => '192.168.100.1', 'category' => '✅ IP Valid (Aman)'],
                                        ['text' => '10.255.255.0', 'category' => '✅ IP Valid (Aman)'], // Batas Maksimal
                                        ['text' => '172.16.0.254', 'category' => '✅ IP Valid (Aman)'],
                                        ['text' => '8.8.8.8', 'category' => '✅ IP Valid (Aman)'],

                                        // INVALID (Jebol)
                                        ['text' => '192.168.1.256', 'category' => '⛔ IP Ilegal (Jebol)'], // Tipis banget salahnya
                                        ['text' => '300.1.1.1', 'category' => '⛔ IP Ilegal (Jebol)'], // Jelas salah
                                        ['text' => '10.10.500.1', 'category' => '⛔ IP Ilegal (Jebol)'], // Ngawur
                                        ['text' => '257.0.0.1', 'category' => '⛔ IP Ilegal (Jebol)'],
                                    ]
                                ])
                            ],
                            // LAYAR 4 (PENUTUP)
                            [
                                'title' => 'Waspada IP Palsu',
                                'type' => 'text',
                                'content' => <<<'EOT'
### 🕵️‍♂️ Mata Elang Network Engineer

Keren! Kamu berhasil membuang IP-IP ilegal tadi.

Di dunia nyata, seringkali jaringan mati total cuma gara-gara salah ketik satu angka (Typo). Misalnya mau ngetik `192.168.1.25` eh malah ketekan angka 5 dua kali jadi `192.168.1.2555`.

Ingat aturan emasnya:
**Rentang angka tiap oktet MUTLAK antara 0 sampai 255.**

Jangan buang waktu mencoba ping ke IP `192.168.1.300`, karena perangkat secanggih apapun tidak akan mengenalinya.
EOT
                            ]
                        ]
                    ],
                    // =======================================
                    // LEVEL 5: IDENTITAS KELAS (A, B, C)
                    // =======================================
                    [
                        'title' => 'Identitas Kelas (A, B, dan C)',
                        'modules' => [
                            // MODUL 1: ANALOGI
                            [
                                'title' => 'Ukuran yang Berbeda',
                                'type' => 'text',
                                'content' => <<<'EOT'
### 🏙️ Arsitek Kota Jaringan

Bayangkan kamu adalah seorang arsitek. Kamu diminta membangun sistem alamat untuk tiga jenis tempat:

1.  **Gedung Pencakar Langit** (Butuh jutaan ruangan).
2.  **Kampus Universitas** (Butuh ribuan ruangan).
3.  **Rumah Pribadi** (Cuma butuh sedikit ruangan).

Kalau kamu memberikan sistem alamat 'Gedung Pencakar Langit' untuk sebuah 'Rumah Pribadi', itu namanya **pemborosan besar**!

Begitu juga di jaringan. Para ahli menciptakan **Sistem Kelas** agar kita bisa memilih 'ukuran' jaringan yang paling pas dengan kebutuhan.
EOT
                            ],
                            // MODUL 2: TEORI OKTET PERTAMA
                            [
                                'title' => 'Rahasia Oktet Pertama',
                                'type' => 'text',
                                'content' => <<<'EOT'
### 🔍 Cukup Lihat Depannya Saja

Gimana cara tahu sebuah IP itu kelas apa? Rahasianya ada pada **Oktet Pertama** (angka paling kiri).

Router tidak melihat seluruh angka IP untuk menentukan kelasnya, ia cukup melihat angka pertamanya saja.

Ibarat **Plat Nomor Kendaraan** (misal `B` untuk Jakarta, `D` untuk Bandung), angka depan IP Address langsung memberi tahu kita identitas kelasnya.
EOT
                            ],
                            // MODUL 3: ATURAN RANGE
                            [
                                'title' => 'Si Besar, Sedang, & Kecil',
                                'type' => 'text',
                                'content' => <<<'EOT'
### 📏 Aturan Main 3 Kelas Utama

Hafalkan "Range Angka Depan" ini baik-baik:

* **Kelas A (Si Raksasa): `1 – 126`**
    Untuk organisasi super besar (ISP/Global). Satu jaringan bisa menampung 16 juta perangkat!

* **Kelas B (Si Menengah): `128 – 191`**
    Cocok untuk kampus atau perusahaan menengah (65.000 perangkat).

* **Kelas C (Si Kecil): `192 – 223`**
    Paling sering kamu temui di WiFi rumah atau Lab sekolah. Kapasitas maksimal cuma 254 perangkat.

> *Catatan: Angka 127 tidak dipakai karena khusus untuk 'Loopback' (localhost).*
EOT
                            ],
                            // MODUL 4: GAME CARD SORTER
                            [
                                'title' => 'Misi: Sortir Kelas IP',
                                'type' => 'game_sorter',
                                'content' => json_encode([
                                    'instruction' => 'Lihat Angka Depannya (Oktet 1), lalu masukkan ke Kelas yang sesuai!',

                                    'categories' => ['Kelas A (1-126)', 'Kelas B (128-191)', 'Kelas C (192-223)'],

                                    'items' => [
                                        // Soal Kelas A
                                        ['text' => '10.1.1.1', 'category' => 'Kelas A (1-126)'],
                                        ['text' => '8.8.8.8 (Google)', 'category' => 'Kelas A (1-126)'],
                                        ['text' => '115.0.0.1', 'category' => 'Kelas A (1-126)'],

                                        // Soal Kelas B
                                        ['text' => '172.16.0.1', 'category' => 'Kelas B (128-191)'],
                                        ['text' => '128.10.10.10', 'category' => 'Kelas B (128-191)'],
                                        ['text' => '191.255.0.1', 'category' => 'Kelas B (128-191)'],

                                        // Soal Kelas C
                                        ['text' => '192.168.1.1', 'category' => 'Kelas C (192-223)'],
                                        ['text' => '202.134.0.155', 'category' => 'Kelas C (192-223)'],
                                        ['text' => '223.0.0.1', 'category' => 'Kelas C (192-223)'],
                                    ]
                                ])
                            ],
                            // MODUL 5: PENUTUP
                            [
                                'title' => 'Level Up!',
                                'type' => 'text',
                                'content' => <<<'EOT'
### 🎉 Kamu Sudah Bisa Membaca Identitas!

Sekarang, setiap kali kamu melihat IP Address, matamu akan otomatis mendeteksi kelasnya.

* Lihat `192...` -> "Ah, ini pasti jaringan kecil (Kelas C)."
* Lihat `10...` -> "Wow, ini jaringan besar (Kelas A)."

Kemampuan ini adalah **pondasi wajib** sebelum kita masuk ke materi yang lebih menantang: **Subnetting (Memecah Kelas)**.

Siap lanjut?
EOT
                            ]
                        ]
                    ],
                    // =======================================
                    // LESSON 6: NETWORK vs HOST
                    // =======================================
                    [
                        'title' => 'Network vs Host (Siapa Ketua Geng?)',
                        'modules' => [
                            // MODUL 1: ANALOGI
                            [
                                'title' => 'Analogi Jalan & Rumah',
                                'type' => 'text',
                                'content' => <<<'EOT'
### Kurir Paket & Alamat

Bayangkan kamu sedang memesan paket secara online. Di label pengiriman, kurir butuh dua info krusial:

1.  **Nama Jalan/Kota:** Memberi tahu di wilayah mana rumahmu berada.
2.  **Nomor Rumah:** Menunjukkan rumah spesifik milikmu.

Di dunia jaringan, IP Address bekerja persis sama.

* **Network ID** = Nama Jalan
* **Host ID** = Nomor Rumah

> **Aturan Main:** Agar dua perangkat bisa ngobrol langsung tanpa Router, mereka WAJIB berada di 'Jalan' atau 'Geng' yang sama!
EOT
                            ],

                            // MODUL 2: TABEL PORSI (HTML)
                            [
                                'title' => 'Porsi & Batas Wilayah',
                                'type' => 'text',
                                'content' => <<<'EOT'
### Pembagian Kue Porsi

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

                            // MODUL 3: CONTOH KASUS
                            [
                                'title' => 'Bedah Contoh Nyata',
                                'type' => 'text',
                                'content' => <<<'EOT'
### Mari Kita Bedah!

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

                            // MODUL 4: GAME CARD SORTER
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

                            // MODUL 5: QUIZ
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
                        ]
                    ],
                ]
            ],

            // ==========================================
            // STAGE 2: KEKUATAN MASKING & PREFIX
            // ==========================================
            [
                'title' => 'Stage 2: Kekuatan Masking & Prefix',
                'description' => 'Fokus: Memahami bagaimana jaringan dibatasi dan dibagi.',
                'lessons' => [

                    // ---------------------------------------
                    // LESSON 7: SUBNET MASK (SANG PENUTUP)
                    // ---------------------------------------
                    [
                        'title' => 'Sang Penutup (Subnet Mask)',
                        'modules' => [
                            // MODUL 1: ANALOGI
                            [
                                'title' => 'Si Satpam Jaringan',
                                'type' => 'text',
                                'content' => <<<'EOT'
### Satpam yang Selalu Mendampingi

Pernahkah kamu memperhatikan saat mengatur IP Address di Windows atau Linux? Begitu kamu mengetik `192.168.1.1`, kolom di bawahnya biasanya otomatis terisi angka `255.255.255.0`.

Itulah **Subnet Mask**.

Bayangkan Subnet Mask sebagai seorang **Satpam** yang memegang sebuah cetakan (stensil) atau 'topeng'.

Tugasnya cuma satu: **Menutup bagian Network ID** dan membiarkan bagian Host ID terbuka.

Tanpa Subnet Mask, komputer tidak tahu dia ada di Geng mana. Subnet Mask-lah yang berteriak: *"Heh komputer, tiga kotak pertama ini adalah nama jalanmu, jangan diubah-ubah!"*
EOT
                            ],

                            // MODUL 2: LOGIKA BINER (HTML VISUAL)
                            [
                                'title' => 'Di Balik Topeng',
                                'type' => 'text',
                                'content' => <<<'EOT'
###  Logika Biner Topeng

Kenapa angkanya harus `255`? Mari kita intip bahasa binernya.

<div class="my-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
    <div class="grid grid-cols-2 gap-4 text-center">
        <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <div class="text-2xl font-bold text-red-600">1 (ON)</div>
            <div class="text-sm text-slate-600 dark:text-slate-400">Artinya: <br><strong>"TUTUP! Ini Wilayah Network"</strong></div>
        </div>
        <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <div class="text-2xl font-bold text-green-600">0 (OFF)</div>
            <div class="text-sm text-slate-600 dark:text-slate-400">Artinya: <br><strong>"BUKA! Ini Wilayah Host"</strong></div>
        </div>
    </div>
</div>

Jadi, saat kamu melihat angka **255** (Binernya `11111111`), itu artinya satu oktet itu dikunci rapat-rapat sebagai identitas jalan.
EOT
                            ],

                            // MODUL 3: STANDAR SERAGAM (HTML TABLE)
                            [
                                'title' => 'Seragam Tiap Kelas',
                                'type' => 'text',
                                'content' => <<<'EOT'
### 👔 Standar Seragam (Default Mask)

Setiap Kelas IP punya "pasangan sejati"-nya masing-masing. Jangan sampai salah pasang!

<div class="overflow-x-auto my-4">
    <table class="w-full text-sm text-left border">
        <thead class="bg-slate-200 dark:bg-slate-700 font-bold">
            <tr>
                <th class="p-2">Kelas</th>
                <th class="p-2">Default Subnet Mask</th>
                <th class="p-2">Artinya</th>
            </tr>
        </thead>
        <tbody class="divide-y">
            <tr>
                <td class="p-2 font-bold">A</td>
                <td class="p-2 font-mono text-red-600 font-bold">255.0.0.0</td>
                <td class="p-2">Oktet 1 dikunci</td>
            </tr>
            <tr>
                <td class="p-2 font-bold">B</td>
                <td class="p-2 font-mono text-red-600 font-bold">255.255.0.0</td>
                <td class="p-2">Oktet 1 & 2 dikunci</td>
            </tr>
            <tr>
                <td class="p-2 font-bold">C</td>
                <td class="p-2 font-mono text-red-600 font-bold">255.255.255.0</td>
                <td class="p-2">Oktet 1, 2, & 3 dikunci</td>
            </tr>
        </tbody>
    </table>
</div>

> ⚠️ **Bahaya:** Kalau kamu pakai IP Kelas C tapi maskernya Kelas A, jaringanmu bakal kacau karena datamu akan tersesat menganggap 'nama jalan' nya terlalu pendek.
EOT
                            ],
                            // MODUL 4: GAME SMART FORM (KASUS KELAS C)
                            [
                                'title' => 'Challenge 1: Kasus Kelas C',
                                'type' => 'smart_form',
                                'content' => json_encode([
                                    'instruction' => 'Tentukan Subnet Mask untuk IP di bawah ini!',

                                    // DISINI KITA TAMPILKAN IP-NYA
                                    'problem' => "TARGET IP:\n👉 **192.168.100.1**\n",

                                    'fields' => [
                                        ['id' => 'm1', 'answer' => '255'],
                                        ['id' => 'm2', 'answer' => '255'],
                                        ['id' => 'm3', 'answer' => '255'],
                                        ['id' => 'm4', 'answer' => '0'],
                                    ]
                                ])
                            ],

                            // MODUL 5: GAME SMART FORM (KASUS KELAS A)
                            [
                                'title' => 'Challenge 2: Kasus Kelas A',
                                'type' => 'smart_form',
                                'content' => json_encode([
                                    'instruction' => 'Hati-hati! Tentukan Subnet Mask untuk IP Besar ini!',

                                    // DISINI KITA TAMPILKAN IP-NYA
                                    'problem' => "TARGET IP:\n👉 **10.5.5.5**\n",

                                    'fields' => [
                                        ['id' => 'm1', 'answer' => '255'],
                                        ['id' => 'm2', 'answer' => '0'],
                                        ['id' => 'm3', 'answer' => '0'],
                                        ['id' => 'm4', 'answer' => '0'],
                                    ]
                                ])
                            ],

                            // MODUL 5: PENUTUP
                            [
                                'title' => 'Fondasi Selesai',
                                'type' => 'text',
                                'content' => <<<'EOT'
### 🏁 Level 1 Selesai!

Selamat! Kamu baru saja menyelesaikan dasar-dasar IPv4.

Kamu sekarang tahu bahwa **IP Address** butuh pasangan hidup bernama **Subnet Mask** untuk bekerja.

Di pelajaran berikutnya, kita akan belajar teknik "memotong-motong" masker ini (Subnetting) agar jaringan lebih efisien. Siapkan kalkulatormu!
EOT
                            ]
                        ]
                    ],

                    // =======================================
                    // LESSON 8: PREFIX (SI PENDEK /24)
                    // =======================================
                    [
                        'title' => 'Si Pendek /24 (Mengenal Prefix)',
                        'modules' => [
                            // MODUL 1: ANALOGI SINGKATAN
                            [
                                'title' => 'Menulis Alamat dengan Cepat',
                                'type' => 'text',
                                'content' => "### ✍️ Singkatan Para Admin\n\nBayangkan kamu harus mencatat ribuan IP Address. Menulis `255.255.255.0` berulang kali pasti bikin tangan keriting.\n\nPara ahli menciptakan sistem singkatan bernama **Prefix** atau **CIDR** (Classless Inter-Domain Routing). Caranya gampang: cukup tulis garis miring `/` diikuti angka.\n\nContoh: `/24`\n\nAngka ini bukan sembarang angka, tapi 'kunci jawaban' seberapa kuat topeng jaringanmu!"
                            ],

                            // MODUL 2: LOGIKA MENGHITUNG BIT (VISUAL)
                            [
                                'title' => 'Menghitung Jumlah Angka Satu',
                                'type' => 'text',
                                'content' => "### 🧮 Kenapa Angkanya 24?\n\nMasih ingat biner? Angka Prefix itu sebenarnya cuma menghitung: **'Ada berapa banyak angka 1 yang berderet di Subnet Mask?'**\n\n<div class='my-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-mono overflow-x-auto'>\n  <div class='mb-2'><strong>255.0.0.0 (Kelas A)</strong></div>\n  <div class='text-green-600'>11111111.00000000.00000000.00000000</div>\n  <div class='text-slate-500'>Jumlah angka '1' = 8 👉 <strong>Ditulis /8</strong></div>\n  <hr class='my-3 border-slate-300'>\n  <div class='mb-2'><strong>255.255.0.0 (Kelas B)</strong></div>\n  <div class='text-green-600'>11111111.11111111.00000000.00000000</div>\n  <div class='text-slate-500'>Jumlah angka '1' = 16 👉 <strong>Ditulis /16</strong></div>\n  <hr class='my-3 border-slate-300'>\n  <div class='mb-2'><strong>255.255.255.0 (Kelas C)</strong></div>\n  <div class='text-green-600'>11111111.11111111.11111111.00000000</div>\n  <div class='text-slate-500'>Jumlah angka '1' = 24 👉 <strong>Ditulis /24</strong></div>\n</div>\n\nJadi, `/24` artinya 24 bit pertama sudah dikunci sebagai Network ID."
                            ],

                            // MODUL 3: LOGIKA TERBALIK (VISUAL BAR)
                            [
                                'title' => 'Semakin Besar, Semakin Sempit',
                                'type' => 'text',
                                'content' => "### 🤏 Logika Unik Prefix\n\nIngat aturan ini: **Semakin BESAR angka prefix-nya, semakin SEDIKIT perangkat (host) yang bisa ditampung.**\n\nKenapa? Karena semakin banyak wilayah yang 'dikunci' (Network), sisa ruang untuk 'tamu' (Host) makin sempit.\n\n<div class='space-y-4 my-6'>\n  <div>\n    <div class='flex justify-between text-xs mb-1'><span>Prefix /8 (Kelas A)</span> <span>Luas Banget (16 Juta Host)</span></div>\n    <div class='w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700'>\n      <div class='bg-blue-600 h-4 rounded-full' style='width: 10%'></div>\n    </div>\n    <div class='text-xs text-blue-600 mt-1'>🟦 Network (Dikit) ⬜ Host (Luas)</div>\n  </div>\n\n  <div>\n    <div class='flex justify-between text-xs mb-1'><span>Prefix /24 (Kelas C)</span> <span>Sedang (254 Host)</span></div>\n    <div class='w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700'>\n      <div class='bg-blue-600 h-4 rounded-full' style='width: 75%'></div>\n    </div>\n  </div>\n\n  <div>\n    <div class='flex justify-between text-xs mb-1'><span>Prefix /30 (Subnetting)</span> <span>Sempit (2 Host)</span></div>\n    <div class='w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700'>\n      <div class='bg-blue-600 h-4 rounded-full' style='width: 95%'></div>\n    </div>\n  </div>\n</div>"
                            ],

                            // MODUL 4: GAME MATCHING (PASANGKAN)
                            [
                                'title' => 'Misi: Jodohkan Topeng & Prefix',
                                'type' => 'game_matching', // Asumsi ada tipe game matching, kalau tidak bisa pakai sorter
                                'content' => json_encode([
                                    'instruction' => 'Pasangkan Subnet Mask dengan kode Prefix (CIDR) yang tepat!',
                                    'pairs' => [
                                        ['question' => '255.0.0.0', 'answer' => '/8'],
                                        ['question' => '255.255.0.0', 'answer' => '/16'],
                                        ['question' => '255.255.255.0', 'answer' => '/24'],
                                        ['question' => '255.255.255.255', 'answer' => '/32'], // Bonus (Host Route)
                                    ]
                                ])
                            ],

                            // MODUL 5: QUIZ
                            [
                                'title' => 'Uji Logika',
                                'type' => 'quiz',
                                'content' => json_encode([
                                    'question' => 'Manakah jaringan yang bisa menampung LEBIH BANYAK komputer (Host)?',
                                    'options' => [
                                        'A. /24 (Karena angkanya lebih besar)',
                                        'B. /8 (Karena angkanya lebih kecil, ruang host lebih luas)',
                                        'C. /30 (Karena spesifik)',
                                        'D. Sama saja'
                                    ],
                                    'correct_answer' => 'B'
                                ])
                            ]
                        ]
                    ],
                    //lesson 9
                    // =======================================
                    // LESSON 9: LOGIKA AND (ROUTER THINKING)
                    // =======================================
                    [
                        'title' => 'Logika AND (Cara Router Berpikir)',
                        'modules' => [
                            // MODUL 1: ANALOGI DETEKTIF
                            [
                                'title' => 'Sang Penyaring Data',
                                'type' => 'text',
                                'content' => "### 🕵️‍♂️ Router Itu Detektif\n\nPernah terpikir nggak, gimana caranya Router tahu kalau paket data dari internet itu harus dikirim ke Laptopmu, bukan ke HP kakakmu?\n\nRouter nggak pakai perasaan, dia pakai **Logika AND**.\n\nBayangkan Logika AND itu seperti sebuah **Penyaring (Filter)**. Router akan menaruh IP Address di atas penyaring, lalu 'menekannya' menggunakan Subnet Mask sebagai cetakannya.\n\nHasil yang keluar dari bawah penyaring itulah yang disebut **Network ID** (Alamat Asli Jaringan)."
                            ],

                            // MODUL 2: TABEL KEBENARAN (HTML)
                            [
                                'title' => "Aturan Main '1 dan 0'",
                                'type' => 'text',
                                'content' => "### ⚖️ Operasi yang Galak\n\nOperasi AND itu sangat adil, tapi galak. Aturannya cuma satu: **Hasilnya akan bernilai 1 HANYA JIKA kedua belah pihak bernilai 1.**\n\nIbarat syarat masuk Tim Elit:\n* Punya Skill (1) **DAN** Punya Sertifikat (1) 👉 **Lolos (1)**.\n* Punya Skill (1) **TAPI** Nggak punya sertifikat (0) 👉 **Gagal (0)**.\n\n<div class='overflow-x-auto my-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700'><table class='w-full text-center text-sm'><thead class='bg-blue-100 dark:bg-blue-900 font-bold'><tr><th class='p-2'>Input A (IP)</th><th class='p-2'>Input B (Mask)</th><th class='p-2'>Hasil AND</th></tr></thead><tbody class='divide-y text-lg font-mono'><tr><td>1</td><td>1</td><td class='text-green-600 font-bold'>1 ✅</td></tr><tr><td>1</td><td>0</td><td class='text-red-500 font-bold'>0 ❌</td></tr><tr><td>0</td><td>1</td><td class='text-red-500 font-bold'>0 ❌</td></tr><tr><td>0</td><td>0</td><td class='text-red-500 font-bold'>0 ❌</td></tr></tbody></table></div>"
                            ],

                            // MODUL 3: GAME SMART FORM (TRUTH TABLE)
                            [
                                'title' => 'Challenge: Tes Logika Router',
                                'type' => 'smart_form',
                                'content' => json_encode([
                                    'instruction' => 'Bantu Router menghitung! Ingat: Hasilnya 1 cuma kalau DUA-DUANYA 1.',
                                    'problem' => "Lengkapi Tabel Kebenaran di bawah ini (Isi 1 atau 0):\n\nRumus: A AND B = Hasil",
                                    'fields' => [
                                        ['id' => 'q1', 'answer' => '1'], // 1 AND 1
                                        ['id' => 'q2', 'answer' => '0'], // 1 AND 0
                                        ['id' => 'q3', 'answer' => '0'], // 0 AND 1
                                        ['id' => 'q4', 'answer' => '0'], // 0 AND 0
                                    ]
                                ])
                            ],

                            // MODUL 4: VISUALISASI MEMBONGKAR ALAMAT
                            [
                                'title' => 'Membongkar Alamat Network',
                                'type' => 'text',
                                'content' => "### 🔓 Membuka Brankas\n\nKenapa ini penting? Karena dengan 'men-AND-kan' IP dan Masker, bagian Host ID akan otomatis terhapus menjadi nol semua, sementara bagian Network ID akan tetap utuh.\n\n**Contoh Kasus:**\nKita punya IP `192` (Biner: `11000000`) dan Mask `255` (Biner: `11111111`).\n\n<div class='font-mono text-sm bg-slate-900 text-white p-4 rounded-lg my-4'><div>11000000 (IP 192)</div><div>11111111 (Mask 255)</div><div class='border-b border-gray-500 my-1'></div><div class='text-green-400 font-bold'>11000000 (Hasil: Tetap 192)</div></div>\n\nTapi kalau Mask-nya `0` (Biner `00000000`), hasilnya pasti `0`. Inilah cara Router 'mematikan' identitas individu (Host)."
                            ],

                            // MODUL 5: QUIZ
                            [
                                'title' => 'Uji Pemahaman',
                                'type' => 'quiz',
                                'content' => json_encode([
                                    'question' => 'Jika Router melakukan operasi 1 AND 0, berapakah hasilnya?',
                                    'options' => [
                                        'A. 1 (Karena ada angka satunya)',
                                        'B. 0 (Karena syarat tidak terpenuhi)',
                                        'C. 10 (Digabung)',
                                        'D. Error'
                                    ],
                                    'correct_answer' => 'B'
                                ])
                            ]
                        ]
                    ],
                    // =======================================
                    // LESSON 10: EKSPLORASI CIDR (SLIDER)
                    // =======================================
                    [
                        'title' => 'Eksplorasi CIDR (Mainkan Slider-mu!)',
                        'modules' => [
                            // MODUL 1: ANALOGI BAJU
                            [
                                'title' => 'Selamat Tinggal "Ukuran Standar"',
                                'type' => 'text',
                                'content' => "### 👕 Baju 'All Size' vs 'Custom Fit'\n\nPernah nggak kamu beli baju ukuran Medium (M) tapi kerasa kegedean, pas mau beli Small (S) malah kekecilan? Pasti kamu berharap ada ukuran **'M-tengah-S'** yang pas di badanmu.\n\nDunia jaringan dulu juga kaku seperti itu dengan sistem Kelas A, B, dan C.\n\nTapi sejak ada **CIDR (Classless Inter-Domain Routing)**, kita nggak perlu lagi terikat ukuran standar. Kita bisa memotong jaringan di bit mana pun yang kita mau.\n\nCIDR adalah **'kain elastis'** yang membuat jaringan bisa kita desain se-efisien mungkin!"
                            ],

                            // MODUL 2: PRINSIP TARIK ULUR
                            [
                                'title' => 'Tarik-Ulur Batas Jaringan',
                                'type' => 'text',
                                'content' => "### 🎣 Prinsip Tarik-Ulur\n\nPrinsip CIDR itu simpel: **Tarik-Ulur.**\n\n1. **Geser ke Kanan (Menambah Angka Prefix):**\n   Misal dari `/24` ke `/26`. Kamu sedang memperluas wilayah Network dan mempersempit wilayah Host.\n   👉 *Hasilnya? Jaringanmu jadi kecil-kecil tapi banyak.*\n\n2. **Geser ke Kiri (Mengurangi Angka Prefix):**\n   Misal dari `/24` ke `/20`. Kamu memperluas wilayah Host.\n   👉 *Hasilnya? Satu jaringanmu bisa menampung ribuan perangkat sekaligus.*\n\nDi sini, kuncinya adalah **Keseimbangan**. Admin yang jago adalah yang bisa menentukan prefix yang pas: **tidak kurang** (biar nggak rebutan IP), tapi juga **tidak lebih** (biar nggak boros IP)."
                            ],

                            // MODUL 3: RUMUS MATEMATIKA
                            [
                                'title' => 'Menghitung Kapasitas Secara Instan',
                                'type' => 'text',
                                //ini harusnya gini **$n$**
                                'content' => "### 🧮 Rumus di Balik Layar\n\nSaat kamu menggeser prefix, ada rumus matematika yang bekerja di belakang layar:\n\n## $ 2^n - 2 $\n\n* **n$** adalah jumlah bit Host yang tersisa (yang belum 'dikunci' oleh prefix).\n* **Kenapa harus dikurangi 2?** Karena alamat pertama dan terakhir dalam satu blok tidak boleh dipakai oleh komputer (nanti kita bahas di node selanjutnya!).\n\n**Contoh Perhitungan:**\n* Kalau prefixnya **/24**, bit host-nya sisa 8. Berarti $2^8 - 2 = 254$ perangkat.\n* Kalau prefixnya **/25**, bit host-nya sisa 7. Berarti $2^7 - 2 = 126$ perangkat.\n\nNggak perlu pusing ngitung manual, biarkan slider-mu yang bekerja di layar selanjutnya!"
                            ],

                            // MODUL 4: SIMULASI CIDR VISUALIZER
                            [
                                'title' => 'Simulasi CIDR',
                                'type' => 'cidr_visualizer', // Pastikan sudah didaftarkan di ModuleRenderer.jsx
                                'content' => json_encode([
                                    'instruction' => 'Geser Slider Prefix di bawah untuk melihat perubahan Network & Host secara real-time!',
                                    'default_ip' => '192.168.10.1',
                                    'default_prefix' => 24
                                ])
                            ]
                        ]
                    ],
                    // =======================================
                    // LESSON 11: MENENTUKAN NETWORK ID
                    // =======================================
                    [
                        'title' => 'Menentukan Alamat Network (Si Nomor Urut Nol)',
                        'modules' => [
                            [
                                'title' => 'Gerbang Depan Komplek',
                                'type' => 'text',
                                'content' => "### ⛩️ Gerbang Depan 'Perumahan Merdeka'\n\nBayangkan kamu sedang membangun sebuah komplek perumahan. Sebelum ada rumah nomor 1, nomor 2, dan seterusnya, komplek itu harus punya nama resmi di gerbang depannya.\n\nDalam dunia IP Address, **Alamat Network (Network ID)** adalah gerbang depan tersebut. Ia adalah alamat **pertama** dalam sebuah blok jaringan.\n\nUniknya, alamat ini **TIDAK BOLEH** dipasang di komputer atau HP mana pun. Kenapa? Karena alamat ini bertugas sebagai identitas kelompok."
                            ],
                            [
                                'title' => 'Syarat Menjadi Network ID',
                                'type' => 'text',
                                'content' => "### 0️⃣ Syarat Mutlak: Nol Semua\n\nGimana cara kita tahu sebuah IP itu adalah Alamat Network? Komputer punya aturan biner yang sangat sederhana:\n\n> **Alamat Network adalah saat SEMUA bit di bagian Host bernilai 0.**\n\nContoh di IP Kelas C (`192.168.1.0/24`), oktet terakhir adalah wilayah Host. Jika oktet terakhir itu isinya `00000000`, jadilah ia `192.168.1.0`.\n\nItulah titik nol kita. Alamat ini yang paling sering ditanya oleh Router: *'Hei, kamu mau ke jaringan nomor berapa?'*"
                            ],
                            [
                                'title' => 'Contoh Perubahan Batas',
                                'type' => 'text',
                                'content' => "### 🚧 Titik Nol Bisa Bergeser\n\nHati-hati, titik nol tidak selalu berakhir dengan angka `.0`. Itu hanya berlaku jika prefixnya standar `/24`. Kalau prefixnya berubah, titik nolnya bisa bergeser.\n\n**Contoh Kasus Prefix /26:**\n1. Blok 1 mulai: `192.168.1.0`\n2. Blok 2 mulai: `192.168.1.64`\n3. Blok 3 mulai: `192.168.1.128`\n\nAngka **0, 64, dan 128** di atas semuanya adalah Alamat Network ('Kepala Suku')."
                            ],
                            [
                                'title' => 'Misi: Cari Gerbang Depan',
                                'type' => 'smart_form',
                                'content' => json_encode([
                                    'instruction' => 'Tentukan Network ID untuk IP: 192.168.100.55/24',
                                    'problem' => "Tips: Untuk /24, cukup NOL-kan angka terakhir (Host)!",
                                    'fields' => [
                                        ['id' => 'o1', 'answer' => '192'],
                                        ['id' => 'o2', 'answer' => '168'],
                                        ['id' => 'o3', 'answer' => '100'],
                                        ['id' => 'o4', 'answer' => '0']
                                    ]
                                ])
                            ],
                            [
                                'title' => 'Uji Pemahaman',
                                'type' => 'quiz',
                                'content' => json_encode([
                                    'question' => 'Mengapa IP 192.168.1.0 (pada /24) tidak boleh dipakai di Laptop?',
                                    'options' => ['A. Angka keramat', 'B. Itu Alamat Network', 'C. Boleh saja', 'D. Rusak'],
                                    'correct_answer' => 'B'
                                ])
                            ]
                        ]
                    ],
                    //lesson 12
                    // =======================================
                    // LESSON 12: BROADCAST ADDRESS
                    // =======================================
                    [
                        'title' => 'Si Tukang Teriak (Broadcast Address)',
                        'modules' => [
                            [
                                'title' => 'Megafon di Tengah Lapangan',
                                'type' => 'text',
                                'content' => "### 📢 Megafon Digital\n\nBayangkan kamu berada di stadion penuh orang dan ingin mengumumkan pertandingan selesai. Apakah kamu akan mendatangi penonton satu per satu? Tentu tidak!\n\nKamu akan mengambil **Megafon**, lalu berteriak sekeras mungkin agar **SEMUA** orang mendengar.\n\nDi jaringan, alamat khusus untuk 'berteriak' ini disebut **Broadcast Address**. Sekali kirim, semua perangkat di jaringan yang sama akan menerima paketnya."
                            ],
                            [
                                'title' => 'Aturan "Semua Nyala"',
                                'type' => 'text',
                                'content' => "### 🔥 Syarat Mutlak: Satu Semua (Full ON)\n\nAturan Broadcast adalah kebalikan dari Network ID:\n\n> **Alamat Broadcast adalah saat SEMUA bit di bagian Host bernilai 1.**\n\nJika 8 bit (satu oktet) dinyalakan semua (`11111111`), nilainya adalah **255**.\n\nContoh: `192.168.1.255`.\nSama seperti Network ID, alamat ini **TERLARANG** dipasang di komputer atau HP."
                            ],
                            [
                                'title' => 'Kapan Kita Pakai Broadcast?',
                                'type' => 'text',
                                'content' => "### 🗣️ Kapan Komputer Perlu Teriak?\n\n1. **Saat Baru Nyala (DHCP):** Komputer berteriak: *'Halo! Siapa pun yang punya alamat IP nganggur, tolong kasih aku satu dong!'*\n2. **Mencari Alamat (ARP):** Saat mau nge-print, komputer berteriak: *'Woi, ada yang tahu di mana alamat si Printer?'*\n\nTanpa Broadcast, jaringan akan sunyi senyap."
                            ],
                            [
                                'title' => 'Misi: Cari Alamat Teriak',
                                'type' => 'smart_form',
                                'content' => json_encode([
                                    'instruction' => 'Tentukan Broadcast Address untuk jaringan: 192.168.50.0/24',
                                    'problem' => "Tips: Bagian Host (angka terakhir) harus FULL 1 (255)!",
                                    'fields' => [
                                        ['id' => 'b1', 'answer' => '192'],
                                        ['id' => 'b2', 'answer' => '168'],
                                        ['id' => 'b3', 'answer' => '50'],
                                        ['id' => 'b4', 'answer' => '255']
                                    ]
                                ])
                            ],
                            [
                                'title' => 'Uji Pemahaman',
                                'type' => 'quiz',
                                'content' => json_encode([
                                    'question' => 'Apa fungsi utama Broadcast Address?',
                                    'options' => [
                                        'A. Mengirim pesan rahasia',
                                        'B. Mengirim pesan ke SATU orang saja',
                                        'C. Mengirim pesan ke SEMUA orang di jaringan',
                                        'D. Menghapus data jaringan'
                                    ],
                                    'correct_answer' => 'C'
                                ])
                            ]
                        ]
                    ],
                    //lesson 13
                ]
            ],
            // =======================================
            // STAGE 3: SUBNETTING FUNDAMENTALS
            // =======================================
            [
                'title' => 'Subnetting Fundamentals',
                'slug' => 'stage-3-subnetting-fundamentals',
                'description' => 'Mengapa dan bagaimana kita meminjam bit.',
                'lessons' => [
                    // LESSON 13: KONSEP DASAR MEMINJAM BIT
                    [
                        'title' => 'Seni Meminjam Bit (Konsep Dasar)',
                        'modules' => [
                            [
                                'title' => 'Menggeser Pagar Jaringan',
                                'type' => 'text',
                                'content' => "### 🏡 Menggeser Pagar Rumah\n\nBayangkan **IP Address** seperti tanah luas. Awalnya ada pagar pemisah antara **Network** dan **Host**.\n\n**Subnetting** adalah seni menggeser pagar tersebut ke arah wilayah rumah. Kamu mengambil jatah tanah rumah untuk dijadikan jalan tambahan. Di biner, ini disebut **Borrowing Bits**."
                            ],
                            [
                                'title' => "Dari '0' Menjadi '1'",
                                'type' => 'text',
                                'content' => "### 🏗️ Cara Teknis\n\nCukup ubah angka `0` (Host) menjadi `1` (Network).\n\n* **0** = Host (Bebas)\n* **1** = Network (Dikunci)\n\nSaat kamu mengubah `0` jadi `1`, kamu memperluas **Subnet Mask**. Pagar bergeser, identitas kelompok jadi lebih spesifik."
                            ],
                            [
                                'title' => 'Hukum Alam Subnetting',
                                'type' => 'text',
                                'content' => "### ⚖️ Pengorbanan\n\nSaat meminjam bit Host:\n1. **Subnet Bertambah 📈** (Lebih banyak jalan).\n2. **Host Berkurang 📉** (Lebih sedikit nomor rumah).\n\nKamu mengorbankan kapasitas per jaringan demi mendapatkan lebih banyak jaringan."
                            ],
                            [
                                'title' => 'Uji Konsep',
                                'type' => 'quiz',
                                'content' => json_encode([
                                    'question' => 'Apa efek "meminjam bit" host?',
                                    'options' => ['A. Host nambah', 'B. Subnet nambah, Host kurang', 'C. Internet cepat', 'D. Rusak'],
                                    'correct_answer' => 'B'
                                ])
                            ]
                        ]
                    ],
                    // =======================================
                    // LESSON 14: MANFAAT SUBNETTING
                    // =======================================
                    [
                        'title' => 'Kenapa Harus Dipecah? (Mencegah Chaos)',
                        'modules' => [
                            // MODUL 1: MASALAH BROADCAST STORM
                            [
                                'title' => 'Masalah "Aula Raksasa"',
                                'type' => 'text',
                                'content' => "### 📢 Masalah Aula Raksasa\n\nMungkin kamu bertanya: *'Ribet amat harus geser-geser bit, emang kenapa kalau jaringannya dibiarkan satu raksasa aja?'*\n\nBayangkan satu sekolah punya 1.000 siswa dan semuanya dimasukkan ke dalam satu aula raksasa tanpa sekat ruangan. Begitu ada satu siswa berteriak: *'Woi, ada yang lihat pulpenku?'*, 1.000 orang lainnya terpaksa mendengar, padahal mereka tidak peduli.\n\nDi jaringan, ini disebut **Broadcast Storm**. Kalau terlalu banyak perangkat 'teriak' (mengirim sinyal broadcast) di satu tempat, koneksi internet bakal macet parah."
                            ],

                            // MODUL 2: KEAMANAN
                            [
                                'title' => 'Sekat untuk Keamanan',
                                'type' => 'text',
                                'content' => "### 🛡️ Sekat untuk Keamanan\n\nSelain supaya tidak 'berisik', subnetting itu soal **Keamanan**.\n\nTanpa sekat (subnet), siswa di lab komputer bisa dengan mudah 'ngintip' data rahasia di komputer ruang Guru atau bagian Keuangan karena mereka berada di satu 'jalan' yang sama.\n\nDengan subnetting, kita membuat ruangan-ruangan digital:\n* **Subnet A** untuk Siswa.\n* **Subnet B** untuk Guru.\n* **Subnet C** untuk Server Keuangan.\n\nMereka tetap satu sekolah, tapi punya jalur dan privasi masing-masing."
                            ],

                            // MODUL 3: SIMULATOR BROADCAST
                            [
                                'title' => 'Simulasi: Chaos vs Order',
                                'type' => 'broadcast_simulator', // Pastikan tipe ini sudah ada di ModuleRenderer
                                'content' => json_encode([
                                    'instruction' => 'Tekan tombol "Kirim Broadcast" dan lihat perbedaan antara Jaringan Raksasa (Flat) vs Subnetting!',
                                ])
                            ],

                            // MODUL 4: QUIZ EFISIENSI
                            [
                                'title' => 'Efisiensi dan Manajemen',
                                'type' => 'quiz',
                                'content' => json_encode([
                                    'question' => 'Apa keuntungan utama memecah jaringan besar menjadi subnet kecil saat terjadi kerusakan kabel?',
                                    'options' => [
                                        'A. Kita harus mengecek seluruh gedung',
                                        'B. Masalah terisolasi di satu subnet saja, lebih mudah dicari',
                                        'C. Kabel akan menyambung sendiri',
                                        'D. Tidak ada pengaruhnya'
                                    ],
                                    'correct_answer' => 'B'
                                ])
                            ]
                        ]
                    ],
                    // =======================================
                    // LESSON 15: RUMUS JUMLAH SUBNET
                    // =======================================
                    [
                        'title' => 'Rumus 2^n (Menghitung Jumlah Subnet)',
                        'modules' => [
                            [
                                'title' => 'Matematika Sang Arsitek',
                                'type' => 'text',
                                'content' => "### 📐 Rumus Pasti Network Engineer\n\nAda rumus pasti untuk menghitung berapa banyak subnet yang tercipta dari bit yang kamu pinjam:\n\n# $$ 2^n $$\n\n*(di mana **n** adalah jumlah bit yang dipinjam)*.\nRumus ini adalah kunci utama membedah blok jaringan."
                            ],
                            [
                                'title' => 'Kekuatan Eksponensial',
                                'type' => 'text',
                                'content' => "### 🚀 Ledakan Kombinasi\n\nSetiap 1 bit pinjaman menggandakan jumlah subnet:\n\n* Pinjam **1 bit** ($2^1$) = **2 Subnet**\n* Pinjam **2 bit** ($2^2$) = **4 Subnet**\n* Pinjam **3 bit** ($2^3$) = **8 Subnet**\n* Pinjam **4 bit** ($2^4$) = **16 Subnet**\n\nSemakin banyak bit dipinjam, jumlah subnet meledak cepat!"
                            ],
                            [
                                'title' => "Menghitung 'n' dari Prefix",
                                'type' => 'text',
                                'content' => "### 🧮 Mencari Nilai 'n'\n\nCaranya: **Prefix Baru - Prefix Asli**.\n\n**Contoh:** Ubah `/24` jadi `/27`.\n1. Selisih: $27 - 24 = 3$ (n=3).\n2. Rumus: $2^3 = 8$.\n\nJadi, kamu mendapatkan **8 Subnet** baru."
                            ],
                            [
                                'title' => 'Uji Hitungan',
                                'type' => 'quiz',
                                'content' => json_encode([
                                    'question' => 'Ubah /24 jadi /26. Berapa subnet yang terbentuk?',
                                    'options' => ['A. 2', 'B. 4 (2^2)', 'C. 8', 'D. 16'],
                                    'correct_answer' => 'B'
                                ])
                            ]
                        ]
                    ],
                    // =======================================
                    // LESSON 16: RUMUS JUMLAH HOST
                    // =======================================
                    [
                        'title' => 'Rumus 2^h - 2 (Menghitung Jumlah Host)',
                        'modules' => [
                            [
                                'title' => 'Sisa Tanah untuk Rumah',
                                'type' => 'text',
                                'content' => "### 🏠 Sisa Tanah (Host Bits)\n\nDalam IPv4, total bit selalu **32**. Sisanya milik Host (**h**).\n\n**Contoh Prefix /24:**\n$32 - 24 = 8$ bit.\nDelapan bit inilah yang akan kita hitung kapasitasnya."
                            ],
                            [
                                'title' => 'Kenapa Harus Dikurangi 2?',
                                'type' => 'text',
                                'content' => "### ⚠️ Aturan Keramat: Minus Dua\n\nRumus lengkapnya:\n# $$ 2^h - 2 $$\n\n**Kenapa dikurangi 2?**\n1. **Network ID** (Alamat Pertama)\n2. **Broadcast Address** (Alamat Terakhir)\n\nKedua alamat ini haram dipakai di perangkat."
                            ],
                            [
                                'title' => 'Cara Cepat Menghitung Kapasitas',
                                'type' => 'text',
                                'content' => "### 🧮 Praktik Hitungan Prefix /26\n\n1. **Cari h:** $32 - 26 = 6$ bit.\n2. **Hitung Pangkat:** $2^6 = 64$.\n3. **Kurangi Cadangan:** $64 - 2 = 62$.\n\nJadi, subnet /26 bisa menampung maksimal **62 perangkat**."
                            ],
                            [
                                'title' => 'Tantangan Kapasitas',
                                'type' => 'quiz',
                                'content' => json_encode([
                                    'question' => 'Hitung Usable Host untuk /27! (Hint: 32-27=5)',
                                    'options' => ['A. 32', 'B. 30 (2^5 - 2)', 'C. 27', 'D. 14'],
                                    'correct_answer' => 'B'
                                ])
                            ]
                        ]
                    ],
                ]
            ],
            // =======================================
            // STAGE 4: FLSM (FIXED LENGTH)
            // =======================================
            [
                'title' => 'Stage 4: FLSM - Fixed Length Subnet Mask',
                'slug' => 'stage-4-flsm',
                'description' => 'Membagi jaringan menjadi blok-blok yang ukurannya identik.',
                'lessons' => [
                    // LESSON 17: PENGENALAN FLSM
                    [
                        'title' => 'Analogi Pizza (Mengenal FLSM)',
                        'modules' => [
                            [
                                'title' => 'Potongan yang Sama Rata',
                                'type' => 'text',
                                'content' => "### 🍕 Satu Loyang Bagi Empat\n\nBayangkan kamu memotong Pizza menjadi **4 bagian yang sama besar**.\n\nDalam dunia jaringan, inilah **FLSM (Fixed Length Subnet Mask)**. Kamu membagi satu blok IP besar menjadi beberapa blok kecil dengan ukuran (Subnet Mask) yang **sama semua**."
                            ],
                            [
                                'title' => 'Satu Masker untuk Semua',
                                'type' => 'text',
                                'content' => "### 🎭 Topeng yang Seragam\n\nJika kamu pakai prefix `/26`, maka semua subnet pakai `/26`. Contoh:\n\n1. `192.168.1.0 /26`\n2. `192.168.1.64 /26`\n3. `192.168.1.128 /26`\n\nSemua punya kapasitas identik (62 host)."
                            ],
                            [
                                'title' => 'Kelebihan dan Kekurangannya',
                                'type' => 'text',
                                'content' => "### ⚖️ Untung Rugi FLSM\n\n**✅ Kelebihan:** Mudah dikelola & dihitung.\n\n**❌ Kekurangan:** **Pemborosan IP**. Jika Subnet B cuma butuh 2 IP tapi dikasih jatah 62 IP, sisanya terbuang sia-sia."
                            ],
                            [
                                'title' => 'Uji Konsep FLSM',
                                'type' => 'quiz',
                                'content' => json_encode([
                                    'question' => 'Apa kelemahan utama FLSM?',
                                    'options' => ['A. Rumit', 'B. Pemborosan IP', 'C. Tidak aman', 'D. Lambat'],
                                    'correct_answer' => 'B'
                                ])
                            ]
                        ]
                    ],
                    // =======================================
                    // LESSON 18: MAGIC NUMBER
                    // =======================================
                    [
                        'title' => 'Angka Keramat (Magic Number)',
                        'modules' => [
                            [
                                'title' => 'Jarak Antar Blok',
                                'type' => 'text',
                                'content' => "### 🏢 Analogi Anak Tangga\n\nJika satu lantai punya 16 anak tangga, kamu tahu lantai berikutnya ada di tangga ke-16, 32, dst.\n\nDalam subnetting, **Magic Number** adalah 'jumlah anak tangga' tersebut. Ini adalah **interval** atau jarak dari satu Network ID ke Network ID berikutnya."
                            ],
                            [
                                'title' => 'Rumus "256"',
                                'type' => 'text',
                                'content' => "### 🪄 Rumus Angka Keramat\n\nCukup kurangi **256** dengan nilai desimal masker.\n\n$$ Magic = 256 - Mask $$\n\n**Contoh /26:**\nMasker akhirnya adalah **192**.\n$256 - 192 = 64$.\n\nAngka keramatmu adalah **64**!"
                            ],
                            [
                                'title' => 'Melompati Blok',
                                'type' => 'text',
                                'content' => "### 🐇 Lompatan Kelipatan\n\nDengan Magic Number **64**, kita bisa menyusun Network ID secepat kilat (mulai dari 0):\n\n1. `192.168.1.0`\n2. `192.168.1.64`\n3. `192.168.1.128`\n4. `192.168.1.192`\n\nBerhenti sebelum 256. Tanpa kalkulator, tanpa biner!"
                            ],
                            [
                                'title' => 'Latihan: Cari Angka Ajaib',
                                'type' => 'smart_form',
                                'content' => json_encode([
                                    'instruction' => 'Hitung Magic Number untuk Prefix /27 (Mask 224)',
                                    'problem' => "Rumus: 256 - 224 = ...",
                                    'fields' => [
                                        ['id' => 'ans', 'answer' => '32']
                                    ]
                                ])
                            ]
                        ]
                    ],
                    // =======================================
                    // LESSON 19: MENENTUKAN HOST RANGE
                    // =======================================
                    [
                        'title' => 'Menentukan Rentang Host (Isi Penghuni Blok)',
                        'modules' => [
                            [
                                'title' => 'Alamat Awal dan Alamat Akhir',
                                'type' => 'text',
                                'content' => "### 🏠 Mengisi Rumah Kosong\n\nDalam satu blok subnet, ada dua alamat khusus:\n1. **Network ID** (Sampul Depan)\n2. **Broadcast Address** (Sampul Belakang)\n\nPerangkatmu (Host) tinggal di antara kedua alamat tersebut."
                            ],
                            [
                                'title' => 'Mencari Si Tukang Teriak (Broadcast)',
                                'type' => 'text',
                                'content' => "### 📢 Batas Akhir Wilayah\n\nCara cari Broadcast: **Network Berikutnya dikurangi 1**.\n\n**Contoh (Magic Number 64):**\n* Subnet 1: `.0`\n* Subnet 2: `.64`\n\nMaka Broadcast Subnet 1 adalah **.63** ($64 - 1$)."
                            ],
                            [
                                'title' => 'Menentukan IP Awal dan IP Akhir',
                                'type' => 'text',
                                'content' => "### 📍 Siapa Saja yang Boleh Masuk?\n\n1. **IP Awal (First Host):** Network ID + 1.\n   *(Network .0 -> Host .1)*\n\n2. **IP Akhir (Last Host):** Broadcast - 1.\n   *(Broadcast .63 -> Host .62)*\n\nRange: **.1 sampai .62** (Total 62 Host)."
                            ],
                            [
                                'title' => 'Latihan: Tentukan Penghuni',
                                'type' => 'smart_form',
                                'content' => json_encode([
                                    'instruction' => 'Tentukan Range Host untuk Network 192.168.1.0 dengan Magic Number 64',
                                    'problem' => "Tips:\nIP Awal = Network + 1\nIP Akhir = (Next Network - 1) - 1",
                                    'fields' => [
                                        ['id' => 'first', 'answer' => '1'],
                                        ['id' => 'last', 'answer' => '62']
                                    ]
                                ])
                            ]
                        ]
                    ],
                    // =======================================
                    // LESSON 20: LAB FLSM MANUAL (PROJECT SMK)
                    // =======================================
                    [
                        'title' => 'NODE KHUSUS - Lab FLSM Manual',
                        'modules' => [
                            // MODUL 1: SCENARIO
                            [
                                'title' => 'Project - Jaringan SMK Baru',
                                'type' => 'text',
                                'content' => "### 🏫 Project: Membangun Jaringan Sekolah\n\nOke, sekarang kita buang kertas coret-coretanmu dan beralih ke layar simulasi.\n\nBayangkan kamu adalah **Kepala IT** di sebuah SMK yang baru dibangun. Sekolah ini punya 4 Lab Komputer:\n1. Lab RPL\n2. Lab TKJ\n3. Lab Multimedia\n4. Lab Perkantoran\n\nPihak ISP memberikan blok IP **192.168.10.0/24**. Tugasmu adalah membagi IP ini secara adil menggunakan prefix **/26**."
                            ],

                            // MODUL 2: STRATEGI
                            [
                                'title' => 'Strategi Perhitungan Interval',
                                'type' => 'text',
                                'content' => "### ⚔️ Strategi Perang\n\nSebelum mengisi tabel konfigurasi, mari review strateginya:\n\n1. **Cek Interval:** Prefix **/26** (Mask 192) berarti intervalnya $256 - 192 = 64$.\n2. **Tentukan Network ID:** Lompat sesuai interval (.0, .64, dst).\n3. **Cari Batas Aman:** Tentukan Broadcast Address (Network berikutnya - 1).\n4. **Siapkan IP Host:** Pastikan PC di setiap lab berada di antara Network ID dan Broadcast."
                            ],

                            // MODUL 3: LAB MANUAL (INTERAKTIF)
                            [
                                'title' => 'Lab Simulasi FLSM',
                                'type' => 'flsm_lab', // Tipe khusus mode manual
                                'content' => json_encode([
                                    'instruction' => 'Klik "Mulai Hitung" dan selesaikan perhitungan untuk 4 Lab (RPL, TKJ, MM, OTKP)!',
                                    'default_network' => '192.168.10.0/24',
                                    'target_subnets' => 4,
                                    // Label khusus agar sesuai cerita
                                    'custom_labels' => ['Lab RPL', 'Lab TKJ', 'Lab Multimedia', 'Lab Perkantoran']
                                ])
                            ],

                            // MODUL 4: CLOSING
                            [
                                'title' => 'Menjaga Kerapian Alamat',
                                'type' => 'text',
                                'content' => "### 🧹 Kebersihan Pangkal Koneksi\n\nDi lab manual ini, ketelitian adalah kunci. Jangan sampai salah hitung agar tidak terjadi bentrok IP (IP Conflict).\n\n**Ingat urutannya:**\n* Subnet 1: Lab RPL\n* Subnet 2: Lab TKJ\n* Subnet 3: Lab Multimedia\n* Subnet 4: Lab Perkantoran\n\nSemua harus seragam menggunakan prefix **/26**."
                            ]
                        ]
                    ],
                    // =======================================
                    // LESSON 21: LAB FLSM OTOMATIS
                    // =======================================
                    [
                        'title' => 'NODE KHUSUS - Lab FLSM Otomatis',
                        'modules' => [
                            // MODUL 1: INTRO
                            [
                                'title' => 'Kecepatan dan Ketepatan',
                                'type' => 'text',
                                'content' => "### ⚡ Dari Manual ke Otomatis\n\nSetelah berlelah-lelah menghitung manual, kamu pasti menyadari bahwa manusia bisa lelah dan salah hitung.\n\nDi dunia kerja nyata, teknisi sering menggunakan **Kalkulator Subnet** untuk mempercepat pekerjaan. Kalkulator ini bekerja menggunakan algoritma yang sama: mencari Interval Blok dan menentukan rentang IP secara instan."
                            ],

                            // MODUL 2: INPUT DATA
                            [
                                'title' => 'Input yang Dibutuhkan',
                                'type' => 'text',
                                'content' => "### 📥 Cukup Dua Data\n\nMesin otomatis hanya butuh: **IP Address** dan **Prefix (CIDR)**.\n\nSistem akan otomatis menghitung:\n1. **Jumlah Subnet:** Rumus $2^n$.\n2. **Jumlah Host:** Rumus $2^h - 2$.\n3. **Daftar Alamat:** Menampilkan seluruh blok dari awal sampai akhir."
                            ],

                            // MODUL 3: LAB OTOMATIS
                            [
                                'title' => 'Kalkulator FLSM Otomatis',
                                'type' => 'flsm_visualizer', // Tipe ini memicu Mode Auto di ModuleRenderer
                                'content' => json_encode([
                                    'instruction' => 'Masukkan IP Network dan pilih jumlah subnet. Lihat betapa cepatnya sistem membuat topologi!',
                                    'default_network' => '192.168.100.0/24',
                                    'target_subnets' => 4
                                ])
                            ],

                            // MODUL 4: CLOSING
                            [
                                'title' => 'Validasi Hasil Sistem',
                                'type' => 'text',
                                'content' => "### 🕵️‍♂️ Trust, but Verify\n\nOtomatisasi bukan berarti kita lepas tangan. Sebagai Admin, tugasmu adalah melakukan **Validasi**.\n\nKalkulator subnet terkadang memberikan daftar blok yang sangat banyak. Kamu harus bisa memilih blok mana yang akan digunakan agar dokumentasi jaringan tetap rapi."
                            ]
                        ]
                    ]
                ]
            ],
            // =======================================
            // STAGE 5: VLSM (VARIABLE LENGTH)
            // =======================================
            [
                'title' => 'Stage 5: VLSM - Variable Length Subnet Mask (Potongan Kustom)',
                'slug' => 'stage-5-vlsm',
                'description' => 'Efisiensi pengalamatan berdasarkan kebutuhan riil.',
                'lessons' => [
                    // LESSON 22: MASALAH PEMBOROSAN
                    [
                        'title' => 'Masalah Pemborosan FLSM',
                        'modules' => [
                            [
                                'title' => 'Si Rakus IP',
                                'type' => 'text',
                                'content' => "### 📉 Dilema Dua Departemen\n\nJika Produksi butuh **100 PC** dan Admin butuh **2 PC**, FLSM memaksa kita memberi ukuran sama (misal /25 untuk 126 host).\n\nAkibatnya: Admin membuang **124 IP** yang tidak terpakai. Sayang banget!"
                            ],
                            [
                                'title' => 'Analogi Baju "All Size"',
                                'type' => 'text',
                                'content' => "### 👕 Baju Kebesaran\n\nFLSM ibarat toko baju 'All Size'. Si badan kecil (Admin) akan tenggelam dalam baju XL.\n\nDalam internet, IP Address sangat berharga. Membiarkan IP menganggur adalah **pemborosan besar**."
                            ],
                            [
                                'title' => 'Solusi "Potongan Kustom"',
                                'type' => 'text',
                                'content' => "### ✂️ Penjahit Kustom (VLSM)\n\n**VLSM (Variable Length Subnet Mask)** memungkinkan panjang masker berubah-ubah.\n\n* Blok 1: Prefix **/25** (100 orang)\n* Blok 2: Prefix **/30** (2 orang)\n\nSetiap departemen dapat porsi yang pas."
                            ],
                            [
                                'title' => 'Uji Konsep',
                                'type' => 'quiz',
                                'content' => json_encode([
                                    'question' => 'Apa masalah utama FLSM pada kebutuhan host yang berbeda jauh?',
                                    'options' => ['A. Error', 'B. Pemborosan IP', 'C. Lambat', 'D. Mahal'],
                                    'correct_answer' => 'B'
                                ])
                            ]
                        ]
                    ],
                    // =======================================
                    // LESSON 23: PENGENALAN VLSM
                    // =======================================
                    [
                        'title' => 'Sang Penjahit Jaringan (Mengenal VLSM)',
                        'modules' => [
                            // MODUL 1: KONSEP DASAR
                            [
                                'title' => 'Subnet di Dalam Subnet',
                                'type' => 'text',
                                'content' => "### 🍰 Memotong Remahan Kue\n\nSecara teknis, **VLSM** adalah proses membagi sebuah subnet menjadi subnet-subnet yang lebih kecil lagi.\n\nIbaratnya, kamu punya satu kue besar, kamu potong jadi dua. Potongan yang satu kamu biarkan besar, tapi potongan yang satunya lagi kamu potong-potong lagi jadi remahan kecil.\n\nInilah kehebatan VLSM. Kita tidak lagi terikat pada satu Interval Blok yang kaku."
                            ],

                            // MODUL 2: PRASYARAT
                            [
                                'title' => 'Syarat Menjadi Ahli VLSM',
                                'type' => 'text',
                                'content' => "### 🛠️ Skill Wajib Admin Jaringan\n\nUntuk menguasai VLSM, kamu harus sudah lancar dua hal:\n\n1. **Prefix yang Pas:** Tahu cara menentukan Prefix untuk jumlah host tertentu.\n2. **Hitung Cepat:** Bisa menghitung Interval Blok (Magic Number) dengan cepat.\n\nKuncinya adalah **Fleksibilitas**. Di VLSM, satu kabel bisa punya 'pintu gerbang' yang berbeda-beda ukurannya."
                            ],

                            // MODUL 3: KELEBIHAN
                            [
                                'title' => 'Kelebihan VLSM',
                                'type' => 'text',
                                'content' => "### 🏆 Kenapa Harus VLSM?\n\n1. **Efisiensi Maksimal:** IP yang terpakai hampir 100% pas dengan kebutuhan.\n2. **Hierarki Rapi:** Jaringan jadi lebih terstruktur dan mudah diamankan.\n3. **Standar Industri:** Di perusahaan besar, hampir tidak ada yang pakai FLSM lagi. Semua sudah beralih ke VLSM."
                            ],

                            // MODUL 4: GAME CARD SORTER
                            [
                                'title' => 'Mini Game: Kaku vs Fleksibel',
                                'type' => 'game_sorter',
                                'content' => json_encode([
                                    'instruction' => 'Kelompokkan kartu berikut ke dalam kategori FLSM atau VLSM!',
                                    'categories' => [
                                        ['id' => 'flsm', 'title' => 'FLSM (Fixed/Kaku)'],
                                        ['id' => 'vlsm', 'title' => 'VLSM (Variable/Fleksibel)']
                                    ],
                                    'items' => [
                                        ['id' => 1, 'text' => 'Ukuran subnet sama semua', 'categoryId' => 'flsm'],
                                        ['id' => 2, 'text' => 'Subnet di dalam subnet', 'categoryId' => 'vlsm'],
                                        ['id' => 3, 'text' => 'Boros IP (Banyak sisa)', 'categoryId' => 'flsm'],
                                        ['id' => 4, 'text' => 'Sangat Hemat IP', 'categoryId' => 'vlsm'],
                                        ['id' => 5, 'text' => 'Analogi Baju "All Size"', 'categoryId' => 'flsm'],
                                        ['id' => 6, 'text' => 'Standar Industri Modern', 'categoryId' => 'vlsm']
                                    ]
                                ])
                            ]
                        ]
                    ],
                    // =======================================
                    // LESSON 24: ATURAN SI PALING BESAR
                    // =======================================
                    [
                        'title' => "Aturan 'Si Paling Besar'",
                        'modules' => [
                            [
                                'title' => 'Menata Isi Lemari',
                                'type' => 'text',
                                'content' => "### 🧳 Aturan Packing\n\nDalam VLSM, **prioritaskan kebutuhan terbesar dulu**. \n\nKita harus melihat daftar departemen dan mengurutkannya dari yang butuh IP paling banyak. Blok besar butuh 'ruang kosong' yang lebih luas di awal, sama seperti memasukkan barang besar ke koper duluan."
                            ],
                            [
                                'title' => 'Menghindari Tabrakan (Overlap)',
                                'type' => 'text',
                                'content' => "### 🚌 Analogi Parkir\n\nJika bus besar parkir duluan, motor kecil bisa nyempil. Jika motor parkir menyebar duluan, bus tidak muat.\n\nDalam jaringan, jika urutan salah (kecil dulu), alamat IP akan **Overlap** (tumpang tindih) dan merusak blok besar."
                            ],
                            [
                                'title' => 'Strategi 3 Langkah VLSM',
                                'type' => 'text',
                                'content' => "### 📝 SOP Pengerjaan\n\n1. **List & Sort:** Urutkan kebutuhan (Besar -> Kecil).\n2. **Tentukan Prefix:** Cari ukuran baju yang pas.\n3. **Plotting:** Isi Network ID berurutan dari atas.\n\nIkuti aturan ini agar jaringan rapi dan anti-bentrok!"
                            ],
                            [
                                'title' => 'Mini Game: Urutkan Prioritas',
                                'type' => 'game_sorter',
                                'content' => json_encode([
                                    'instruction' => 'Mana yang harus dikerjakan DULUAN vs BELAKANGAN?',
                                    'categories' => [
                                        ['id' => 'first', 'title' => 'Kerjakan DULUAN (Besar)'],
                                        ['id' => 'last', 'title' => 'Kerjakan BELAKANGAN (Kecil)']
                                    ],
                                    'items' => [
                                        ['id' => 1, 'text' => 'Gedung A (200 Host)', 'categoryId' => 'first'],
                                        ['id' => 2, 'text' => 'Link P2P (2 Host)', 'categoryId' => 'last'],
                                        ['id' => 3, 'text' => 'Lab Komputer (60 Host)', 'categoryId' => 'first'],
                                        ['id' => 4, 'text' => 'Ruang Staff (10 Host)', 'categoryId' => 'last']
                                    ]
                                ])
                            ]
                        ]
                    ],
                    // =======================================
                    // LESSON 25: MENGHITUNG PREFIX VLSM (DENGAN TABEL HTML)
                    // =======================================
                    [
                        'title' => 'Menghitung Prefix yang Pas (Cari Ukuran Hemat)',
                        'modules' => [
                            // MODUL 1: ANALOGI
                            [
                                'title' => 'Mencari Wadah yang Presisi',
                                'type' => 'text',
                                'content' => "### 📦 Memilih Kotak yang Pas\n\nDalam VLSM, kita ingin wadah yang **tidak terlalu sempit** (biar muat) tapi **tidak terlalu longgar** (biar hemat).\n\n**Analogi Kelereng:**\nKamu punya 20 kelereng. Pilihan kotakmu:\n1. **Kotak 16:** Tidak muat. ❌\n2. **Kotak 64:** Muat, tapi terlalu banyak ruang kosong. ⚠️\n3. **Kotak 32:** Pas! Masih ada sisa sedikit untuk cadangan. ✅"
                            ],

                            // MODUL 2: RUMUS
                            [
                                'title' => 'Rumus Cepat Menentukan Prefix',
                                'type' => 'text',
                                'content' => "### ⚡ Rumus Kilat\n\nIngat deret angka pangkat dua: **2, 4, 8, 16, 32, 64, 128, 256**.\n\n**Contoh Kasus:** Butuh **50 Host**.\n1. Angka > 50 adalah **64**.\n2. Kapasitas 64 = **6 bit** ($2^6$).\n3. Prefix = $32 - 6 = \\mathbf{/26}$."
                            ],

                            // MODUL 3: TABEL REFERENSI (HTML)
                            [
                                'title' => 'Tabel Referensi Cepat',
                                'type' => 'text',
                                'content' => '### 📋 Sontekan Prefix VLSM

Agar kerjamu secepat kilat, hafalkan pola ini!

<div class="overflow-x-auto my-6 rounded-lg border border-slate-200 shadow-sm">
    <table class="w-full text-sm text-left text-slate-500 dark:text-slate-400">
        <thead class="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-200">
            <tr>
                <th scope="col" class="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Kebutuhan Host</th>
                <th scope="col" class="px-4 py-3 border-r border-slate-200 dark:border-slate-600 text-center">Pakai Prefix</th>
                <th scope="col" class="px-4 py-3 text-center">Kapasitas Maks<br><span class="text-[10px] lowercase">(2^h - 2)</span></th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr class="bg-white dark:bg-slate-800">
                <td class="px-4 py-3 font-medium text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-600">1 - 2 Host</td>
                <td class="px-4 py-3 text-center font-bold text-blue-600 border-r border-slate-200 dark:border-slate-600">/30</td>
                <td class="px-4 py-3 text-center">2</td>
            </tr>
            <tr class="bg-slate-50 dark:bg-slate-900/50">
                <td class="px-4 py-3 font-medium text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-600">3 - 6 Host</td>
                <td class="px-4 py-3 text-center font-bold text-blue-600 border-r border-slate-200 dark:border-slate-600">/29</td>
                <td class="px-4 py-3 text-center">6</td>
            </tr>
            <tr class="bg-white dark:bg-slate-800">
                <td class="px-4 py-3 font-medium text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-600">7 - 14 Host</td>
                <td class="px-4 py-3 text-center font-bold text-blue-600 border-r border-slate-200 dark:border-slate-600">/28</td>
                <td class="px-4 py-3 text-center">14</td>
            </tr>
            <tr class="bg-slate-50 dark:bg-slate-900/50">
                <td class="px-4 py-3 font-medium text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-600">15 - 30 Host</td>
                <td class="px-4 py-3 text-center font-bold text-blue-600 border-r border-slate-200 dark:border-slate-600">/27</td>
                <td class="px-4 py-3 text-center">30</td>
            </tr>
            <tr class="bg-white dark:bg-slate-800">
                <td class="px-4 py-3 font-medium text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-600">31 - 62 Host</td>
                <td class="px-4 py-3 text-center font-bold text-blue-600 border-r border-slate-200 dark:border-slate-600">/26</td>
                <td class="px-4 py-3 text-center">62</td>
            </tr>
             <tr class="bg-slate-50 dark:bg-slate-900/50">
                <td class="px-4 py-3 font-medium text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-600">63 - 126 Host</td>
                <td class="px-4 py-3 text-center font-bold text-blue-600 border-r border-slate-200 dark:border-slate-600">/25</td>
                <td class="px-4 py-3 text-center">126</td>
            </tr>
        </tbody>
    </table>
</div>'
                            ],

                            // MODUL 4: QUIZ
                            [
                                'title' => 'Uji Efisiensi',
                                'type' => 'quiz',
                                'content' => json_encode([
                                    'question' => 'Sebuah Lab Komputer membutuhkan 25 PC. Prefix mana yang paling PAS dan EFISIEN?',
                                    'options' => [
                                        'A. /26 (Kapasitas 62 Host)',
                                        'B. /27 (Kapasitas 30 Host)',
                                        'C. /28 (Kapasitas 14 Host)',
                                        'D. /24 (Kapasitas 254 Host)'
                                    ],
                                    'correct_answer' => 'B'
                                ])
                            ]
                        ]
                    ],
                    // =======================================
                    // LESSON 26: LAB VLSM MANUAL (FINAL PROJECT)
                    // =======================================
                    [
                        'title' => 'NODE KHUSUS - Lab VLSM Manual',
                        'modules' => [
                            // MODUL 1: SCENARIO
                            [
                                'title' => 'Project - Jaringan Kantor Startup',
                                'type' => 'text',
                                'content' => "### 🏢 Misi Terakhir: Startup Network\n\nIni adalah ujian terakhirmu di Level Subnetting! Kamu diminta merancang jaringan untuk sebuah kantor **Startup Teknologi**.\n\nISP memberikan blok IP **192.168.1.0/24**. Kantor ini memiliki 3 tim:\n1. **Tim IT:** 50 Host (Server Testing).\n2. **Tim Marketing:** 20 Host.\n3. **Tim Finance:** 5 Host.\n\nTugasmu adalah membagi IP ini agar cukup untuk semua tim **tanpa ada IP yang terbuang percuma** (VLSM)."
                            ],

                            // MODUL 2: STRATEGI
                            [
                                'title' => 'Blueprint Perencanaan',
                                'type' => 'text',
                                'content' => "### 🗺️ Strategi Pengerjaan\n\n\n\nSebelum mengisi tabel, mari kita susun strateginya:\n\n1. **Urutan Kerja:** Mulai dari Tim IT (50), lalu Marketing (20), terakhir Finance (5).\n2. **Menentukan Ukuran:**\n   * **50 Host:** Butuh wadah 64 $\\rightarrow$ Prefix **/26**.\n   * **20 Host:** Butuh wadah 32 $\\rightarrow$ Prefix **/27**.\n   * **5 Host:** Butuh wadah 8 $\\rightarrow$ Prefix **/29**.\n\nJangan sampai salah urutan! Jika Tim Finance ditaruh di awal, perhitungan interval tim besar akan berantakan."
                            ],

                            // MODUL 3: TIPS OVERLAP
                            [
                                'title' => 'Menghindari Tabrakan (Overlap)',
                                'type' => 'text',
                                'content' => "### 🚆 Menyambung Gerbong\n\nKunci sukses VLSM adalah **melanjutkan alamat**.\n\n1. Gunakan blok pertama untuk **Tim IT** mulai dari `.0`.\n2. Lihat di mana alamat Broadcast-nya berakhir.\n3. Berikan alamat **satu angka setelahnya** sebagai Network ID untuk tim berikutnya.\n\nIbarat menyambung gerbong kereta, pastikan tidak ada celah kosong dan tidak saling menabrak."
                            ],

                            // MODUL 4: LAB MANUAL
                            [
                                'title' => 'Lab VLSM Manual',
                                'type' => 'vlsm_lab', // Mengaktifkan VlsmVisualizer Mode Manual
                                'content' => json_encode([
                                    'instruction' => 'Urutkan prioritas dan alokasikan IP untuk Startup ini (IT -> Marketing -> Finance)!',
                                    'default_network' => '192.168.1.0/24',
                                    // Config khusus untuk soal cerita ini
                                    'requirements' => [
                                        ['name' => 'Tim IT', 'hosts' => 50],
                                        ['name' => 'Marketing', 'hosts' => 20],
                                        ['name' => 'Finance', 'hosts' => 5]
                                    ]
                                ])
                            ]
                        ]
                    ],
                    // =======================================
                    // LESSON 27: LAB VLSM OTOMATIS
                    // =======================================
                    [
                        'title' => 'NODE KHUSUS - Lab VLSM Otomatis',
                        'modules' => [
                            // MODUL 1: INTRO
                            [
                                'title' => 'Menangani Jaringan Skala Besar',
                                'type' => 'text',
                                'content' => "### 🏙️ Tantangan Skala Besar\n\nMenghitung VLSM manual untuk 50 departemen itu mustahil dilakukan dengan cepat dan akurat.\n\nDi sinilah **Kalkulator VLSM** berperan. Tugasmu berubah dari 'menghitung' menjadi 'memberikan input yang tepat'. Mesin yang akan melakukan kerja kerasnya."
                            ],
                            // MODUL 2: ALGORITMA
                            [
                                'title' => 'Algoritma "Si Paling Besar"',
                                'type' => 'text',
                                'content' => "### 🤖 Mesin Pintar\n\nSistem otomatis akan melakukan:\n1. **Auto-Sort:** Mengurutkan kebutuhan (Besar -> Kecil).\n2. **Auto-Prefix:** Mencari ukuran wadah paling pas.\n3. **Auto-Plot:** Menyusun IP agar rapat tanpa bentrok.\n\nKamu bisa input data secara acak, mesin yang akan merapikannya."
                            ],
                            // MODUL 3: LAB AUTO
                            [
                                'title' => 'Kalkulator VLSM Otomatis',
                                'type' => 'vlsm_visualizer', // Memicu Mode Auto
                                'content' => json_encode([
                                    'instruction' => 'Input kebutuhan host secara acak. Lihat bagaimana sistem menyusun topologinya!',
                                    'default_network' => '192.168.100.0/24',
                                    'requirements' => []
                                ])
                            ],
                            // MODUL 4: CLOSING
                            [
                                'title' => 'Membaca Peta Topologi',
                                'type' => 'text',
                                'content' => "### 🗺️ Visualisasi Pohon\n\nSistem menghasilkan **Topologi Tree**. Kamu bisa melihat bagaimana blok besar dipecah menjadi cabang-cabang kecil.\n\nJika grafiknya rapat dan terstruktur, artinya efisiensi jaringanmu sangat tinggi. Visualisasi ini standar dokumentasi modern."
                            ]
                        ]
                    ],
                ]
            ],

        ];

        // ==========================================
        // 4. EKSEKUSI LOOPING (OTOMATIS INPUT KE DB)
        // ==========================================

        foreach ($jarkomStages as $wIndex => $weekData) {
            // 1. Buat Week
            $week = Week::create([
                'course_id' => $courseJarkom->id,
                'title' => $weekData['title'],
                'description' => $weekData['description'],
                'week_number' => $wIndex + 1,
                'order' => $wIndex + 1,
                'slug' => Str::slug($weekData['title']),
                'is_active' => true
            ]);

            foreach ($weekData['lessons'] as $lIndex => $lessonData) {
                // 2. Buat Lesson
                $lesson = Lesson::create([
                    'week_id' => $week->id,
                    'title' => $lessonData['title'],
                    'slug' => Str::slug($lessonData['title']) . '-' . Str::random(5),
                    'order' => $lIndex + 1,
                    'xp_reward' => 100 + ($lIndex * 50) // XP nambah tiap level
                ]);

                // 3. Buat Modules
                if (isset($lessonData['modules'])) {
                    foreach ($lessonData['modules'] as $mIndex => $moduleData) {
                        Module::create([
                            'lesson_id' => $lesson->id,
                            'title' => $moduleData['title'],
                            'type' => $moduleData['type'],
                            'content' => $moduleData['content'],
                            'order' => $mIndex + 1,
                            'is_active' => true
                        ]);
                    }
                }
            }
        }
    }
}
