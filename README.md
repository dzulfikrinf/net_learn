# NetLearn — Gamified Network Simulation & Learning Platform

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-2.0-9553E9?style=flat-square&logo=inertia&logoColor=white)](https://inertiajs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

> Platform edukasi interaktif untuk pembelajaran konsep Jaringan Komputer dan Subnetting berbasis gamifikasi. Menghadirkan visualisasi kanvas topologi real-time, modul tantangan bertahap, formula matematika dinamis (KaTeX), serta pelacakan progres dan leaderboard siswa.

---

## 🎯 Gambaran Proyek

Mempelajari dasar jaringan komputer—seperti IP Addressing, CIDR subnetting, netmask, hingga routing topologi—seringkali abstrak dan menyulitkan pemula jika hanya dipelajari melalui buku teks atau slide statis.

**NetLearn** hadir sebagai media pembelajaran interaktif untuk:
- Memvisualisasikan perangkat jaringan dan interkoneksi kabel secara modular.
- Menyediakan tantangan kalkulasi subnetting dengan feedback instan.
- Mendorong keterlibatan belajar siswa lewat sistem reward gamifikasi (Leveling, XP, Login Streak, dan Leaderboard).
- Memberikan panel kendali bagi pengajar untuk merancang materi, modul berurutan, dan memantau analitik pemahaman kelas.

---

## 🚀 Fitur Utama

- **Interactive Topology Canvas (React Flow)**: Simulasi drag-and-drop perangkat jaringan, penghubungan port kabel, dan pengecekan alur transmisi.
- **Subnetting Assessment Engine**: Validasi otomatis untuk perhitungan Netmask, Network Address, Broadcast Address, Usable Host Range, dan evaluasi CIDR slash notation (`/24`–`/30`).
- **Gamification & Engagement Engine**:
  - Pelacakan perolehan XP dan sistem kenaikan level bertingkat.
  - Tracking keaktifan harian (*login streak*).
  - Papan peringkat kelas (*real-time student leaderboard*).
- **Rich Pedagogical Formatting**:
  - Rendering formula dan kalkulasi biner/desimal menggunakan **KaTeX**.
  - Format materi berbasis **Markdown** terstruktur dengan integrasi multimedia.
- **Teacher & Content Management Dashboard**:
  - Kurikulum hierarkis: *Course* ➔ *Stage/Week* ➔ *Lesson* ➔ *Interactive Modules*.
  - Pemantauan metrik keberhasilan siswa via chart interaktif (**ApexCharts**).

---

## 🛠️ Tech Stack & Arsitektur

| Layer | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Backend** | Laravel 12 (PHP 8.2+) | Monolith modern untuk API, routing, autentikasi, dan business logic |
| **Frontend** | React 18 & Inertia.js 2.0 | Pengalaman SPA reaktif tanpa kompleksitas overhead REST API terpisah |
| **Database** | PostgreSQL 18 | Penyimpanan data relasional terstruktur (13 model tabel) |
| **Interactive Canvas** | React Flow | Kanvas interaktif simulasi node topologi jaringan |
| **Styling & UI** | Tailwind CSS & Framer Motion | Desain modern, clean UI, transisi dinamis & responsive layout |
| **Visual Telemetry** | ApexCharts | Visualisasi grafik analitik performa belajar siswa |

---

## 📂 Struktur Database

Skema database PostgreSQL dirancang terelasi kuat mencakup:
1. `users`: Akun siswa & pengajar, role, total XP, level, dan tracking login.
2. `courses`, `weeks`, `lessons`, `modules`: Struktur hierarki kurikulum pembelajaran.
3. `user_progress`: Pelacakan detail tiap modul yang dikerjakan, skor, dan waktu penyelesaian.
4. `sessions`, `jobs`, `cache`: Manajemen sesi dan antrian sistem Laravel.

---

## 💻 Panduan Instalasi Lokal

### Prasyarat
- PHP >= 8.2 (dengan ekstensi `pdo_pgsql` aktif)
- Composer >= 2.0
- Node.js >= 18.x & NPM
- PostgreSQL Server >= 14 (aktif di port default 5432)

### Langkah-langkah

1. **Clone Repository**
   ```bash
   git clone https://github.com/dzulfikrinf/net_learn.git
   cd net_learn
   ```

2. **Install Dependensi**
   ```bash
   composer install
   npm install
   ```

3. **Konfigurasi Environment**
   Salin berkas konfigurasi `.env.example`:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

   Sesuaikan parameter database dan Gemini AI di file `.env`:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=net-learn
   DB_USERNAME=postgres
   DB_PASSWORD=postgres

   # Dapatkan API key gratis di Google AI Studio (https://aistudio.google.com/)
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Buat Database PostgreSQL**
   Pastikan database dengan nama `net-learn` sudah dibuat di PostgreSQL instance Anda.

5. **Jalankan Migrasi & Seeder**
   ```bash
   php artisan migrate:fresh --seed
   ```
   *Seeder akan otomatis menyiapkan user demo pengajar, siswa, serta modul materi awal.*

6. **Jalankan Server Development**
   Jalankan server aplikasi di dua terminal terpisah:
   ```bash
   # Terminal 1: Backend Server
   php artisan serve

   # Terminal 2: Frontend Bundler
   npm run dev
   ```

   Buka peramban di `http://localhost:8000`.

---

## 🔑 Akun Demo Bawaan

| Role | Email | Password |
| :--- | :--- | :--- |
| **Guru / Admin** | `guru@netlearn.com` | `password` |
| **Siswa / Student** | `admin@netlearn.com` | `password` |

---

## 📄 Lisensi

Proyek ini didistribusikan di bawah lisensi [MIT License](LICENSE).
