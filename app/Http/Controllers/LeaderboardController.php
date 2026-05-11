<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Course; // <-- WAJIB IMPORT MODEL COURSE
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class LeaderboardController extends Controller
{
    public function index()
    {
        // 1. Ambil Top 50 Siswa berdasarkan XP tertinggi
        $topStudents = User::where('role', 'student')
            ->orderBy('xp', 'desc')
            ->orderBy('updated_at', 'desc') // Kalau XP sama, yang duluan update yang menang
            ->take(50)
            ->get()
            ->map(function ($user, $index) {
                return [
                    'rank' => $index + 1,
                    'name' => $user->name,
                    'xp' => $user->xp,
                    'is_me' => $user->id === Auth::id(), // Penanda biar bisa di-highlight
                    'avatar_color' => $this->getAvatarColor($user->id) // Bikin warna-warni biar cantik
                ];
            });

        // 2. Cari Ranking User yang sedang login (kalau dia di luar Top 50)
        $myRank = User::where('role', 'student')->where('xp', '>', Auth::user()->xp)->count() + 1;

        // 3. Ambil data Course untuk link "Kembali ke Peta" di React
        // Mengambil course pertama sebagai default.
        // (Bisa disesuaikan jika user bisa enroll ke banyak course berbeda).
        $course = Course::first();

        return Inertia::render('Leaderboard', [
            'leaderboard' => $topStudents,
            'my_stats' => [
                'rank' => $myRank,
                'xp' => Auth::user()->xp,
                'name' => Auth::user()->name
            ],
            'course' => $course // <-- WAJIB DIKIRIM KE REACT
        ]);
    }

    // Fungsi kecil buat ngasih warna random yang konsisten berdasarkan ID
    private function getAvatarColor($id)
    {
        $colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'];
        return $colors[$id % count($colors)];
    }
}
