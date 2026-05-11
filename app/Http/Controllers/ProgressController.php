<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Lesson;
use App\Models\UserProgress;
use Illuminate\Support\Facades\Auth;

class ProgressController extends Controller
{
    // 1. START: HANYA BUAT DATA JIKA BELUM ADA
    public function start(Request $request, $lessonId)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Gunakan firstOrCreate agar object Model pasti kembali
        $progress = UserProgress::firstOrCreate(
            ['user_id' => $user->id, 'lesson_id' => $lessonId],
            [
                'status' => 'started',
                'attempts' => 1,
                'score' => 0,
                'created_at' => now(),
            ]
        );

        // Pastikan $progress adalah instance Model sebelum save
        if ($progress instanceof UserProgress) {
            // Jika statusnya 'unlocked' (belum pernah disentuh), ubah jadi started
            if ($progress->status === 'unlocked') {
                $progress->status = 'started';
                $progress->created_at = now();
                $progress->save();
            }
        }

        return response()->json(['message' => 'Timer started']);
    }

    // 2. RECORD FAILURE: DATABASE LANGSUNG (TIDAK PERLU SAVE MANUAL)
    public function recordFailure(Request $request, $lessonId)
    {
        $user = Auth::user();

        // Kita pakai increment query langsung biar hemat memori & cepat
        // Tidak perlu $progress->save() disini karena increment sudah otomatis update DB
        UserProgress::where('user_id', $user->id)
            ->where('lesson_id', $lessonId)
            ->increment('attempts');

        return response()->json(['message' => 'Kesalahan dicatat']);
    }

    // 3. COMPLETE: PERBAIKAN LOGIKA ATTEMPTS & SAVE
    public function complete(Request $request, $lessonId)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $lesson = Lesson::findOrFail($lessonId);

        // Ambil progress sebagai Model (Wajib pakai first() atau find())
        /** @var \App\Models\UserProgress $progress */
        $progress = UserProgress::where('user_id', $user->id)
            ->where('lesson_id', $lessonId)
            ->first();

        // Safety check: Jika data tidak ditemukan
        if (!$progress) {
            return back()->with('error', 'Data progress tidak ditemukan. Silakan ulangi materi.');
        }

        // --- 1. LOGIKA SKOR ---
        $sessionMistakes = $request->input('mistakes', 0);
        $timeTaken = $request->input('time_taken', 0);
        $details = $request->input('details', []);

        // Deteksi otomatis: Apakah ini modul Ujian (Pre-Test / Post-Test)?
        $isExam = str_contains(strtolower($lesson->title), 'test');

        if ($isExam && count($details) > 0) {
            // JIKA UJIAN: Gunakan Rumus Sekolah (Benar / Total Soal x 100)
            $totalQuestions = count($details);
            $totalCorrect = collect($details)->where('is_correct', true)->count();
            $calculatedScore = round(($totalCorrect / $totalQuestions) * 100);
        } else {
            // JIKA GAME BIASA: Gunakan Rumus Penalti (100 - 15*Salah)
            $calculatedScore = max(10, 100 - ($sessionMistakes * 15));
        }

        // --- 2. LOGIKA ATTEMPTS (ANTI-RESET) ---
        // Jika attempts di database masih < 1 (aneh), kita paksa jadi 1.
        // Selebihnya, biarkan attempts bertambah lewat fungsi recordFailure tadi.
        if ($progress->attempts < 1) {
            $progress->attempts = 1;
        }

        // --- 3. EXP REWARD ---
        $xpEarned = $lesson->xp_reward ?? 50;

        // Bonus jika modul ujian (ada timer)
        if ($timeTaken > 0) {
            // Bonus Sempurna & Cepat
            if ($sessionMistakes == 0 && $timeTaken <= 45) {
                $xpEarned += 30;
            } elseif ($sessionMistakes == 0) {
                $xpEarned += 15;
            }
            // Penalti jika banyak salah
            if ($sessionMistakes >= 3) {
                $xpEarned = max(10, $xpEarned - 20);
            }
        }

        // --- 4. SIMPAN DATA PROGRESS ---
        $progress->status = 'completed';
        $progress->duration = $timeTaken;
        $progress->completed_at = now();

        // FITUR BARU: Simpan detail jawaban (Benar/Salah per soal) ke database dalam format JSON
        $progress->details = json_encode($request->input('details', []));

        // High Score System: Update skor hanya jika lebih bagus
        if ($calculatedScore >= $progress->score) {
            $progress->score = $calculatedScore;

            // Tambah XP ke User
            $user->xp += $xpEarned;

            // Dapat Bintang jika nilai 100 (Sempurna) dan progress sebelumnya belum 100
            if ($calculatedScore == 100 && $progress->getOriginal('score') < 100) {
                $user->stars += 1;
            }
        } else {
            // Jika remedial tapi nilai turun, kasih XP hiburan dikit
            $user->xp += 10;
        }

        // Save Progress (Aman karena $progress sudah dipastikan Model di atas)
        $progress->save();

        // --- 5. DAILY QUEST (SIMPAN USER) ---
        $today = now()->toDateString();
        if ($user->last_lesson_completed_date !== $today) {
            $user->last_lesson_completed_date = $today;
            $user->xp += 10; // Bonus harian
        }

        // Save User (Aman karena sudah ada Type Hinting)
        $user->save();

        // --- 6. UNLOCK NEXT LEVEL ---
        $this->unlockNextLesson($lesson, $user);

        return to_route('course.map', $lesson->week->course->slug)
            ->with('message', "Selesai! Skor: $calculatedScore | XP Didapat: +$xpEarned");
    }

    private function unlockNextLesson($currentLesson, $user)
    {
        // Cari lesson berikutnya dalam minggu yang sama
        $nextLesson = Lesson::where('week_id', $currentLesson->week_id)
            ->where('order', '>', $currentLesson->order)
            ->orderBy('order', 'asc')
            ->first();

        // Jika tidak ada, cari lesson pertama di minggu berikutnya
        if (!$nextLesson) {
             $nextLesson = Lesson::where('week_id', '>', $currentLesson->week_id)
                ->orderBy('week_id', 'asc')
                ->orderBy('order', 'asc')
                ->first();
        }

        // Buka kunci
        if ($nextLesson) {
            UserProgress::firstOrCreate(
                ['user_id' => $user->id, 'lesson_id' => $nextLesson->id],
                ['status' => 'unlocked', 'attempts' => 0, 'score' => 0]
            );
        }
    }
}
