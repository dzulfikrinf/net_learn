<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Module;

class ExamSeeder extends Seeder
{
    public function run()
    {
        // ID Lesson untuk Post-Test (Di database-mu ID-nya 31)
        $lessonId = 31;

        // Daftar 30 Soal Post-Test Valid beserta Kunci Jawabannya
        $daftarSoal = [
            [
                'question' => 'Sistem hanya akan mengenali sebuah alamat IPv4 jika memenuhi syarat penulisan standar. Manakah di antara kriteria berikut yang menjadi syarat mutlak validitas sebuah alamat IPv4?',
                'image' => null,
                'options' => [
                    'A. Terdiri dari 128 bit biner yang dipisahkan oleh simbol titik dua (:).',
                    'B. Terdiri dari 4 oktet desimal di mana setiap oktet tidak boleh melebihi angka 255.',
                    'C. Menggunakan kombinasi angka dan huruf heksadesimal dari A sampai F.',
                    'D. Memiliki total 48 bit biner yang merepresentasikan identitas pabrikan',
                    'E. Harus menggunakan angka Romawi untuk memisahkan setiap segmen jaringan.'
                ],
                'correct_answer' => 'B'
            ],
            [
                'question' => 'Dalam sebuah konfigurasi jaringan lokal (LAN), hanya rentang alamat tertentu yang diizinkan untuk digunakan sebagai IP Private. Manakah di antara pilihan berikut yang merupakan contoh alamat IP Private yang valid?',
                'image' => null,
                'options' => [
                    'A. 8.8.8.8',
                    'B. 192.168.1.10',
                    'C. 202.152.0.1',
                    'D. 117.0.0.1',
                    'E. 172.32.0.1'
                ],
                'correct_answer' => 'B'
            ],
            [
                'question' => 'Sebuah jaringan memiliki Network ID 192.168.10.0/24. Manakah di antara alamat berikut yang memenuhi syarat sebagai alamat host yang valid dan bisa dipasang pada komputer klien?',
                'image' => null,
                'options' => [
                    'A. 192.168.10.0',
                    'B. 192.168.10.255',
                    'C. 192.168.10.1',
                    'D. 192.168.10.256',
                    'E. 192.168.11.1'
                ],
                'correct_answer' => 'C'
            ],
            [
                'question' => 'Perbedaan utama antara IP Public dan IP Private terletak pada ruang lingkup aksesibilitasnya. Manakah pernyataan yang paling akurat mengenai karakteristik IP Public?',
                'image' => null,
                'options' => [
                    'A. Hanya dapat digunakan di dalam jaringan lokal dan tidak bisa terlihat dari internet.',
                    'B. Memiliki sifat unik secara global dan dapat diakses langsung melalui jaringan internet.',
                    'C. Tidak memerlukan Subnet Mask dalam proses konfigurasinya di komputer.',
                    'D. Selalu menggunakan angka nol pada setiap oktet penyusunnya.',
                    'E. Hanya dapat dikonfigurasi pada perangkat yang tidak memiliki kabel (wireless).'
                ],
                'correct_answer' => 'B'
            ],
            [
                'question' => 'Dalam struktur internalnya, alamat IPv4 merupakan sebuah deretan angka biner yang memiliki panjang bit tertentu. Berapakah total bit yang membentuk struktur utuh sebuah alamat IPv4?',
                'image' => null,
                'options' => [
                    'A. 16 bit',
                    'B. 32 bit',
                    'C. 48 bit',
                    'D. 64 bit',
                    'E. 128 bit'
                ],
                'correct_answer' => 'B'
            ],
            [
                'question' => 'Manakah di bawah ini yang merupakan contoh IP Public?',
                'image' => null,
                'options' => [
                    'A. 10.0.0.1',
                    'B. 172.16.0.1',
                    'C. 192.168.0.1',
                    'D. 202.152.5.1',
                    'E. 169.254.1.1'
                ],
                'correct_answer' => 'D'
            ],
            [
                'question' => 'Dalam manajemen pesan, terdapat alamat khusus yang digunakan untuk mengirimkan data ke seluruh perangkat yang berada dalam satu segmen jaringan yang sama. Alamat ini dikenal dengan istilah...',
                'image' => null,
                'options' => [
                    'A. Alamat Unicast',
                    'B. Alamat Broadcast',
                    'C. Alamat Loopback',
                    'D. Alamat Static',
                    'E. Alamat Private'
                ],
                'correct_answer' => 'B'
            ],
            [
                'question' => 'Perangkat yang berfungsi sebagai pintu keluar bagi host untuk berkomunikasi dengan jaringan yang berbeda subnet disebut...',
                'image' => null,
                'options' => [
                    'A. Hub',
                    'B. Switch',
                    'C. Default Gateway (Router)',
                    'D. IP Public',
                    'E. Modem Wi-Fi'
                ],
                'correct_answer' => 'C'
            ],
            [
                'question' => 'Mengapa alamat pertama dan terakhir dalam sebuah blok subnet tidak bisa dipakai untuk komputer (host)?',
                'image' => null,
                'options' => [
                    'A. Karena dialokasikan sebagai cadangan keamanan.',
                    'B. Karena digunakan untuk Network ID dan Broadcast Address.',
                    'C. Karena alamat tersebut memiliki kecepatan akses yang lambat.',
                    'D. Karena aturan tersebut hanya berlaku untuk IP Kelas A.',
                    'E. Karena IP tersebut milik ISP.'
                ],
                'correct_answer' => 'B'
            ],
            [
                'question' => 'Berapa jumlah host valid yang tersedia pada subnet dengan prefix /26?',
                'image' => null,
                'options' => [
                    'A. 30',
                    'B. 62',
                    'C. 126',
                    'D. 254',
                    'E. 128'
                ],
                'correct_answer' => 'B'
            ],
            [
                'question' => 'Tentukan bentuk biner dari subnet mask 255.255.255.192!',
                'image' => null,
                'options' => [
                    'A. 11111111.11111111.11111111.00000000',
                    'B. 11111111.11111111.11111111.10000000',
                    'C. 11111111.11111111.11111111.11000000',
                    'D. 11111111.11111111.11111111.11110000',
                    'E. 11111111.11111111.11111111.11111111'
                ],
                'correct_answer' => 'C'
            ],
            [
                'question' => 'Tentukan interval blok subnet untuk mask 255.255.255.224!',
                'image' => null,
                'options' => [
                    'A. 16',
                    'B. 32',
                    'C. 64',
                    'D. 128',
                    'E. 8'
                ],
                'correct_answer' => 'B'
            ],
            [
                'question' => 'Manakah alamat IP berikut yang merupakan Host Terakhir yang valid pada subnet 192.168.1.0/24?',
                'image' => null,
                'options' => [
                    'A. 192.168.1.1',
                    'B. 192.168.1.254',
                    'C. 192.168.1.255',
                    'D. 192.168.1.0',
                    'E. 192.168.1.253'
                ],
                'correct_answer' => 'B'
            ],
            [
                'question' => 'Dalam teknik FLSM, semua subnet yang dihasilkan memiliki karakteristik...',
                'image' => null,
                'options' => [
                    'A. Jumlah host yang berbeda-beda.',
                    'B. Panjang prefix (mask) yang sama besar.',
                    'C. Menggunakan kelas IP yang berbeda di tiap subnet.',
                    'D. Tidak membutuhkan alamat broadcast.',
                    'E. Menggunakan IP Public di tiap host.'
                ],
                'correct_answer' => 'B'
            ],
            [
                'question' => 'Sebuah gedung sekolah memiliki 4 ruangan, masing-masing ruangan berisi 50 unit komputer. Jika administrator ingin membagi jaringan menggunakan teknik FLSM dari satu blok Kelas C, prefix manakah yang paling tepat agar seluruh komputer mendapatkan IP?',
                'image' => null,
                'options' => [
                    'A. /25',
                    'B. /26',
                    'C. /27',
                    'D. /28',
                    'E. /30'
                ],
                'correct_answer' => 'B'
            ],
            [
                'question' => 'Bagaimana cara menentukan nilai prefix (CIDR) berdasarkan bit biner?',
                'image' => null,
                'options' => [
                    'A. Menghitung jumlah angka \'0\' dalam subnet mask.',
                    'B. Menghitung jumlah angka \'1\' dalam subnet mask.',
                    'C. Menjumlahkan semua angka desimal dalam alamat IP.',
                    'D. Mengalikan jumlah oktet dengan angka 8.',
                    'E. Membagi 256 dengan jumlah host.'
                ],
                'correct_answer' => 'B'
            ],
            [
                'question' => 'Apa dampak utama dari pembagian jaringan (subnetting) terhadap lalu lintas broadcast?',
                'image' => null,
                'options' => [
                    'A. Memperluas jangkauan broadcast ke seluruh internet.',
                    'B. Membatasi lalu lintas broadcast agar hanya berputar di dalam sub-jaringan tersebut.',
                    'C. Menghilangkan kebutuhan akan alamat IP pada perangkat.',
                    'D. Mengubah kabel LAN menjadi nirkabel secara logis.',
                    'E. Menambah kapasitas bandwidth secara fisik.'
                ],
                'correct_answer' => 'B'
            ],
            [
                'question' => 'Manakah di antara subnet mask berikut yang TIDAK valid untuk subnetting IPv4?',
                'image' => null,
                'options' => [
                    'A. 255.255.255.192',
                    'B. 255.255.255.250',
                    'C. 255.255.255.252',
                    'D. 255.255.255.248',
                    'E. 255.255.255.240'
                ],
                'correct_answer' => 'B'
            ],
            [
                'question' => 'Manakah di bawah ini yang merupakan rentang IP Private Kelas C yang sering digunakan di jaringan lokal?',
                'image' => null,
                'options' => [
                    'A. 192.168.0.0 - 192.168.255.255',
                    'B. 10.0.0.0 - 10.255.255.255',
                    'C. 172.16.0.0 - 172.31.255.255',
                    'D. 8.8.8.0 - 8.8.8.255',
                    'E. 202.152.0.0 - 202.152.255.255'
                ],
                'correct_answer' => 'A'
            ],
            [
                'question' => 'Jika menggunakan mask 255.255.255.240, berapa blok subnet yang akan terbentuk secara keseluruhan pada Kelas C standar?',
                'image' => null,
                'options' => [
                    'A. 4',
                    'B. 8',
                    'C. 16',
                    'D. 32',
                    'E. 64'
                ],
                'correct_answer' => 'C'
            ],
            [
                'question' => 'Sebuah universitas besar sedang merancang infrastruktur jaringan untuk gedung pusat data mereka. Mengingat banyaknya perangkat server dan manajemen yang akan terhubung, administrator jaringan memutuskan untuk menggunakan alokasi IP yang sangat luas dengan prefix /16.\n\nSaat teknisi melakukan konfigurasi pada core switch, sistem meminta input subnet mask dalam format desimal (dotted-decimal). Berdasarkan skenario tersebut, manakah subnet mask desimal yang harus dimasukkan oleh teknisi?',
                'image' => null,
                'options' => [
                    'A. 255.0.0.0',
                    'B. 255.255.0.0',
                    'C. 255.255.255.0',
                    'D. 255.255.240.0',
                    'E. 255.255.255.240'
                ],
                'correct_answer' => 'B'
            ],
            [
                'question' => 'Dalam proses pengiriman data antar jaringan, sebuah router menerima paket yang ditujukan ke alamat IP tertentu. Langkah prosedural pertama yang dilakukan router untuk menentukan ke mana paket tersebut harus diteruskan adalah melakukan operasi logika AND antara IP tujuan dengan Subnet Mask.\n\nSetelah hasil operasi AND tersebut didapatkan, prosedur selanjutnya yang harus dilakukan router adalah…',
                'image' => null,
                'options' => [
                    'A. Mencocokkan hasil tersebut dengan daftar alamat MAC (Physical Address) di dalam tabel ARP.',
                    'B. Mengirimkan paket tersebut ke seluruh interface yang aktif untuk mencari jalur tercepat.',
                    'C. Mencocokkan hasil tersebut dengan daftar entri Network ID yang tersimpan di dalam Routing Table.',
                    'D. Mengubah alamat IP tujuan pada paket data agar sesuai dengan alamat IP default gateway.',
                    'E. Memeriksa konfigurasi firewall untuk memastikan port layanan data tersebut tidak terblokir.'
                ],
                'correct_answer' => 'C'
            ],
            [
                'question' => 'Dalam perencanaan pengalamatan IP (IP Addressing), tidak semua alamat dapat diberikan kepada perangkat (host). Salah satu alamat khusus adalah Network ID, yang berfungsi sebagai identitas utama sebuah kelompok jaringan.\n\nSecara teknis, manakah syarat mutlak yang harus dipenuhi agar sebuah alamat IP dapat dikategorikan sebagai Network ID yang valid?',
                'image' => null,
                'options' => [
                    'A. Seluruh bit yang berada pada porsi host (host portion) dalam format biner harus bernilai \'0\'.',
                    'B. Seluruh bit yang berada pada porsi host (host portion) dalam format biner harus bernilai \'1\'.',
                    'C. Nilai desimal pada oktet terakhir harus selalu angka genap dan dapat dibagi oleh nilai prefix.',
                    'D. Alamat tersebut harus memiliki nilai yang satu angka lebih besar dari alamat Default Gateway.',
                    'E. Jumlah bit pada porsi network harus lebih sedikit daripada jumlah bit pada porsi host.'
                ],
                'correct_answer' => 'A'
            ],
            [
                'question' => 'Sebuah perangkat firewall lama hanya menerima input subnet mask dalam format biner. Jika administrator ingin menetapkan subnet mask 255.255.255.224 pada perangkat tersebut, bagaimanakah representasi biner yang tepat yang harus dimasukkan oleh administrator pada oktet terakhir? (Asumsikan tiga oktet pertama sudah terisi penuh oleh bit \'1\')',
                'image' => null,
                'options' => [
                    'A. 11111111.11111111.11111111.11000000',
                    'B. 11111111.11111111.11111111.11100000',
                    'C. 11111111.11111111.11111111.11110000',
                    'D. 11111111.11111111.11111111.11111000',
                    'E. 11111111.11111111.11111111.11111111'
                ],
                'correct_answer' => 'B'
            ],
            [
                'question' => 'Dalam pembagian alamat IP, nilai interval blok menentukan di mana sebuah jaringan baru dimulai. Jika sebuah jaringan menggunakan subnet mask 255.255.255.192, berapakah nilai interval yang menjadi penanda dimulainya Subnet kedua?',
                'image' => null,
                'options' => [
                    'A. 32',
                    'B. 64',
                    'C. 128',
                    'D. 192',
                    'E. 256'
                ],
                'correct_answer' => 'B'
            ],
            [
                'question' => 'Dalam pengaturan alamat IP pada kartu jaringan (Network Interface Card), tidak semua alamat dalam sebuah blok subnet dapat diberikan kepada perangkat komputer. Jika sebuah laboratorium komputer menggunakan blok 192.168.1.64/26, manakah di antara alamat berikut yang merupakan contoh alamat Host Terakhir yang valid untuk digunakan?',
                'image' => null,
                'options' => [
                    'A. 192.168.1.64',
                    'B. 192.168.1.65',
                    'C. 192.168.1.126',
                    'D. 192.168.1.127',
                    'E. 192.168.1.128'
                ],
                'correct_answer' => 'C'
            ],
            [
                'question' => 'Dalam metode VLSM, kita selalu disarankan untuk menghitung urutan jaringan mulai dari yang membutuhkan jumlah host paling banyak ke yang paling sedikit. Mengapa urutan ini menjadi syarat penting yang harus diikuti?',
                'image' => null,
                'options' => [
                    'A. Agar sisa alamat IP yang tersedia tidak terpotong-potong, sehingga masih ada ruang yang cukup luas untuk kelompok jaringan besar lainnya.',
                    'B. Karena kelompok jaringan yang besar membutuhkan kecepatan akses internet yang lebih tinggi daripada jaringan kecil.',
                    'C. Supaya administrator jaringan tidak perlu melakukan perhitungan biner lagi untuk jaringan-jaringan yang kecil.',
                    'D. Karena urutan dari besar ke kecil sudah menjadi aturan otomatis yang diatur oleh penyedia layanan internet (ISP).',
                    'E. Agar alamat IP pada jaringan yang paling besar bisa secara otomatis menjadi alamat pusat bagi semua jaringan lainnya.'
                ],
                'correct_answer' => 'A'
            ],
            [
                'question' => 'Terdapat klaim teknis yang menyatakan bahwa: "Prefix /30 adalah prefix terkecil yang masih memungkinkan terjadinya komunikasi dua arah antara dua host."\n\nLakukan verifikasi terhadap klaim tersebut menggunakan algoritma perhitungan host usable (2ⁿ - 2). Hasil analisis manakah yang mendukung kebenaran klaim tersebut?',
                'image' => null,
                'options' => [
                    'A. Klaim benar, karena /30 menghasilkan 4 alamat total, di mana setelah dikurangi Network dan Broadcast, masih tersisa tepat 2 alamat untuk host.',
                    'B. Klaim salah, karena prefix /31 juga menghasilkan 2 alamat host yang dapat digunakan secara langsung oleh komputer.',
                    'C. Klaim benar, karena prefix di bawah /30 (seperti /29) tidak lagi memiliki alamat Broadcast sehingga data tidak bisa dikirim.',
                    'D. Klaim salah, karena prefix /30 hanya menyediakan 1 alamat host usable, sehingga komunikasi dua arah tidak mungkin terjadi.',
                    'E. Klaim benar, karena hanya prefix genap yang bisa menghasilkan alamat IP usable bagi perangkat akhir.'
                ],
                'correct_answer' => 'A'
            ],
            [
                'question' => "Berikut adalah tahapan acak untuk mengubah notasi prefix /25 menjadi bentuk Subnet Mask Desimal:\n1. Mengonversi setiap kelompok 8-bit (oktet) biner menjadi angka desimal.\n2. Menuliskan deretan angka biner '1' sebanyak 25 kali secara berurutan.\n3. Melengkapi sisa bit hingga berjumlah total 32-bit dengan angka biner '0'.\n4. Membagi deretan bit tersebut menjadi empat kelompok yang masing-masing terdiri dari 8-bit.\n\nManakah urutan prosedur yang paling tepat dan logis untuk mendapatkan hasil konversi yang akurat?",
                'image' => null,
                'options' => [
                    'A. 2 – 3 – 4 – 1',
                    'B. 2 – 4 – 3 – 1',
                    'C. 3 – 2 – 4 – 1',
                    'D. 1 – 2 – 3 – 4',
                    'E. 4 – 1 – 2 – 3'
                ],
                'correct_answer' => 'A'
            ],
            [
                'question' => 'Berapa total host usable yang tersedia pada satu blok Kelas C jika tidak dilakukan subnetting (/24)?',
                'image' => null,
                'options' => [
                    'A. 62',
                    'B. 126',
                    'C. 254',
                    'D. 510',
                    'E. 256'
                ],
                'correct_answer' => 'C'
            ]
        ];

        // Looping untuk memasukkan semua soal ke database secara otomatis
        // Hapus (kosongkan) dulu soal lama di node 31 agar tidak berantakan
        Module::where('lesson_id', $lessonId)->delete();

        foreach ($daftarSoal as $index => $soal) {
            Module::create([
                'lesson_id' => $lessonId,
                'title'     => 'Soal Posttest ' . ($index + 1),
                'type'      => 'quiz',
                'content'   => json_encode($soal),
                'order'     => $index + 1,
                'is_active' => true,
            ]);
        }

        $this->command->info('Alhamdulillah, 30 Soal POST-TEST Tervalidasi berhasil masuk ke database!');
    }
}
