<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\UserProgress;
use App\Models\Lesson;
use Carbon\Carbon;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        // 1. DATA TABEL SISWA
        $students = User::where('role', 'student')
            ->with('progress')
            ->orderBy('name', 'asc')
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'xp' => $student->xp,
                    'completed_lessons' => $student->progress->where('status', 'completed')->count(),
                ];
            });

        // --- DATA UNTUK GRAFIK DASHBOARD ---
        $lessons = Lesson::orderBy('week_id')->orderBy('order')->get();

        $completionData = $lessons->map(function($lesson) {
            return [
                'title' => $lesson->title,
                'count' => UserProgress::where('lesson_id', $lesson->id)
                            ->where('status', 'completed')
                            ->count()
            ];
        });

        $activityData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $count = UserProgress::whereDate('updated_at', $date)
                        ->where('status', 'completed')
                        ->count();
            $activityData[] = [
                'date' => Carbon::now()->subDays($i)->format('d M'),
                'count' => $count
            ];
        }

        $difficultyData = $lessons->map(function($lesson) {
            $avgAttempts = UserProgress::where('lesson_id', $lesson->id)->avg('attempts');
            return [
                'title' => $lesson->title,
                'avg' => round($avgAttempts ?? 0, 1)
            ];
        });

        return Inertia::render('Admin/Dashboard', [
            'students' => $students,
            'charts' => [
                'completion' => $completionData,
                'activity' => $activityData,
                'difficulty' => $difficultyData
            ]
        ]);
    }

    public function resetPassword($id)
    {
        $student = User::findOrFail($id);
        $student->password = Hash::make('netlearn123');
        $student->save();

        return back()->with('message', 'Password siswa berhasil direset menjadi: netlearn123');
    }

    // =========================================================================
    // FITUR REKAPITULASI UJIAN (ANALISIS BUTIR SOAL 1 DAN 0 + A B C D E)
    // =========================================================================

    public function showExamReport($lesson_id)
    {
        // 1. Ambil data Lesson beserta detail modulnya (untuk ambil Kunci Jawaban)
        $lesson = Lesson::with(['modules' => function ($query) {
            $query->where('type', 'quiz')->orderBy('order', 'asc');
        }])->findOrFail($lesson_id);

        $modules = $lesson->modules;
        $totalQuestions = $modules->count();

        // 2. Ekstrak Kunci Jawaban (A, B, C, D, E) dari masing-masing modul
        $answerKeys = [];
        for ($i = 0; $i < $totalQuestions; $i++) {
            $content = is_string($modules[$i]->content) ? json_decode($modules[$i]->content, true) : $modules[$i]->content;
            $answerKeys['Q' . ($i + 1)] = $content['correct_answer'] ?? '?';
        }

        // 3. Ambil data progress khusus siswa (role student)
        $progressData = UserProgress::with('user')
            ->where('lesson_id', $lesson_id)
            ->whereHas('user', function ($query) {
                $query->where('role', 'student');
            })
            ->get();

        // 4. Rakit data matriks Jawaban & Angka 1/0
        $reportMatrix = $progressData->map(function ($progress) use ($totalQuestions, $modules) {

            $details = [];
            if (!empty($progress->details)) {
                $details = is_string($progress->details) ? json_decode($progress->details, true) : $progress->details;
            }

            $answers = [];
            $binaryAnswers = []; // Khusus disiapkan untuk export SPSS
            $totalCorrect = 0;

            for ($i = 0; $i < $totalQuestions; $i++) {
                $qKey = 'Q' . ($i + 1);

                // Ambil teks soal dari database untuk dicocokkan dengan JSON details siswa
                $modContent = is_string($modules[$i]->content) ? json_decode($modules[$i]->content, true) : $modules[$i]->content;
                $questionText = $modContent['question'] ?? '';

                $studentAnswerLetter = '-';
                $isCorrect = 0;

                // Cari jawaban siswa berdasarkan teks pertanyaan (Lebih aman dari bug)
                $foundDetail = collect($details)->firstWhere('question', $questionText);

                if ($foundDetail) {
                    $selected = $foundDetail['selected_option'] ?? '';
                    if (!empty($selected)) {
                        $studentAnswerLetter = substr($selected, 0, 1); // Ambil huruf A, B, C, D, E
                    }
                    if (isset($foundDetail['is_correct']) && $foundDetail['is_correct'] === true) {
                        $isCorrect = 1;
                        $totalCorrect++;
                    }
                }

                // Simpan ke array
                $answers[$qKey] = [
                    'letter' => $studentAnswerLetter,
                    'is_correct' => $isCorrect
                ];
                $binaryAnswers[$qKey] = $isCorrect;
            }

            return [
                'id' => $progress->user->id,
                'name' => $progress->user->name,
                'answers' => $answers,
                'binary_answers' => $binaryAnswers,
                'total_correct' => $totalCorrect,
                'score' => $progress->score,
            ];
        });

        // 5. Kirim ke Frontend React
        return Inertia::render('Admin/ExamReport', [
            'lessonId' => $lesson->id,            
            'isLocked' => $lesson->xp_reward == 0,
            'lessonTitle' => $lesson->title,
            'totalQuestions' => $totalQuestions,
            'answerKeys' => $answerKeys,
            'reportMatrix' => $reportMatrix
        ]);
    }

    // FITUR SAKELAR KUNCI UJIAN
    public function toggleLessonLock($id)
    {
        $lesson = \App\Models\Lesson::findOrFail($id);

        if ($lesson->xp_reward > 0) {
            $lesson->xp_reward = 0; // Gembok
            $status = 'DIKUNCI';
        } else {
            $lesson->xp_reward = 1000; // Buka Gembok (Kembalikan ke hadiah 1000 XP)
            $status = 'DIBUKA';
        }
        $lesson->save();

        return redirect()->back()->with('message', "Akses ujian berhasil $status!");
    }

    // =========================================================================
    // LOGIKA AI GENERATOR
    // =========================================================================

    public function generateAndSaveAIReport($id)
    {
        $student = User::findOrFail($id);
        $result = $this->processAIAnalysis($student);

        if ($result['status'] === 'success') {
            return back()->with('message', 'Laporan AI berhasil dibuat!');
        } else {
            return back()->withErrors(['ai_error' => $result['message']]);
        }
    }

    public function forceRegenerateReport($id)
    {
        $student = User::findOrFail($id);
        $student->ai_report = null;
        $student->save();

        return back()->with('message', 'Laporan lama dihapus. Silakan klik tombol analisis lagi.');
    }

    private function processAIAnalysis($student)
    {
        $apiKey = config('services.gemini.api_key') ?? env('GEMINI_API_KEY');

        if (!$apiKey) {
            return ['status' => 'error', 'message' => 'API Key Gemini belum disetting di .env!'];
        }

        try {
            // 1. SIAPKAN DATA (Null Safety untuk Lesson Title)
            $reportCard = $student->progress->map(function($p) {
                $durationInfo = "Belum selesai";
                if ($p->completed_at && $p->created_at) {
                    $start = \Carbon\Carbon::parse($p->created_at);
                    $end = \Carbon\Carbon::parse($p->completed_at);
                    $minutes = $start->diffInMinutes($end);
                    $durationInfo = ($minutes < 1) ? "< 1 menit (Sangat Cepat)" : "{$minutes} menit";
                }

                $lessonTitle = $p->lesson->title ?? 'Materi Terhapus';

                return "- Materi '{$lessonTitle}': Skor {$p->score}, Percobaan {$p->attempts}x, Waktu: {$durationInfo}";
            })->implode("\n");

            if (empty($reportCard)) $reportCard = "Siswa ini belum mengerjakan materi apapun.";

            // 2. PROMPT
            $prompt = "
            Analisis data siswa berikut:
            Nama: {$student->name}
            XP: {$student->xp}
            Riwayat Belajar:
            {$reportCard}

            Berikan laporan singkat (maksimal 100 kata) tentang kelemahan, kekuatan, dan rekomendasi belajar selanjutnya. Gunakan bahasa Indonesia yang memotivasi dan profesional.";

            // 3. REQUEST KE GEMINI
            $response = Http::withOptions(['verify' => false])
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                    'contents' => [['parts' => [['text' => $prompt]]]],
                    'safetySettings' => [
                        ['category' => 'HARM_CATEGORY_HARASSMENT', 'threshold' => 'BLOCK_NONE'],
                        ['category' => 'HARM_CATEGORY_HATE_SPEECH', 'threshold' => 'BLOCK_NONE'],
                        ['category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold' => 'BLOCK_NONE'],
                        ['category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold' => 'BLOCK_NONE'],
                    ]
                ]);

            if ($response->failed()) {
                Log::error("Gemini Error: " . $response->body());
                return ['status' => 'error', 'message' => 'Gagal menghubungi Google: ' . $response->status()];
            }

            $json = $response->json();

            // 4. AMBIL JAWABAN
            if (isset($json['candidates'][0]['content']['parts'][0]['text'])) {
                $aiText = $json['candidates'][0]['content']['parts'][0]['text'];
                $student->ai_report = $aiText;
                $student->save();
                return ['status' => 'success', 'message' => 'Berhasil'];
            } else {
                Log::error("Gemini Response Invalid: " . json_encode($json));
                return ['status' => 'error', 'message' => 'Google tidak memberikan jawaban valid.'];
            }

        } catch (\Exception $e) {
            Log::error("AI Exception: " . $e->getMessage());
            return ['status' => 'error', 'message' => 'Server Error: ' . $e->getMessage()];
        }
    }

    public function show($id)
    {
        $student = User::where('role', 'student')
            ->with(['progress.lesson'])
            ->findOrFail($id);

        // Auto-generate jika kosong
        if (empty($student->ai_report)) {
            $this->processAIAnalysis($student);
            $student->refresh();
        }

        // --- DATA TABEL RIWAYAT ---
        $progressDetails = $student->progress->map(function ($prog) {
            $duration = '-';
            if ($prog->completed_at && $prog->created_at) {
                $start = \Carbon\Carbon::parse($prog->created_at);
                $end = \Carbon\Carbon::parse($prog->completed_at);
                $duration = $end->diffForHumans($start, ['syntax' => \Carbon\CarbonInterface::DIFF_ABSOLUTE, 'parts' => 2]);
            }

            $parsedDetails = [];
            if (!empty($prog->details)) {
                $parsedDetails = is_string($prog->details) ? json_decode($prog->details, true) : $prog->details;
            }

            return [
                'id' => $prog->id,
                'lesson_title' => $prog->lesson->title ?? 'Materi Dihapus',
                'status' => $prog->status,
                'score' => $prog->score,
                'attempts' => $prog->attempts,
                'completed_at_formatted' => $prog->completed_at ? \Carbon\Carbon::parse($prog->completed_at)->translatedFormat('l, d M Y, H:i') : '-',
                'duration' => $duration,
                'details' => $parsedDetails
            ];
        });

        // --- LOGIKA SKILL ---
        $rawScores = ['Konsep Dasar' => [], 'Hitungan Subnet' => [], 'Praktik Lab' => []];
        foreach ($student->progress as $p) {
            if ($p->status !== 'completed' || is_null($p->score)) continue;

            $title = strtolower($p->lesson->title ?? '');
            $score = $p->score;
            if (str_contains($title, 'simulator') || str_contains($title, 'lab') || str_contains($title, 'topologi')) {
                $rawScores['Praktik Lab'][] = $score;
            } elseif (str_contains($title, 'hitung') || str_contains($title, 'flsm') || str_contains($title, 'vlsm')) {
                $rawScores['Hitungan Subnet'][] = $score;
            } else {
                $rawScores['Konsep Dasar'][] = $score;
            }
        }

        $skillsAvg = [];
        foreach($rawScores as $cat => $scores) {
            $skillsAvg[$cat] = count($scores) > 0 ? round(array_sum($scores) / count($scores)) : 0;
        }

        // --- REKOMENDASI ---
        asort($skillsAvg);
        $weakestSkill = array_key_first($skillsAvg);
        $totalAverage = round($student->progress->where('status', 'completed')->avg('score') ?? 0);

        $recommendation = [
            'topic' => $weakestSkill ?? 'Belum ada data',
            'score' => $totalAverage,
            'message' => 'Data belum cukup untuk analisis.',
            'action' => 'Selesaikan lebih banyak materi.'
        ];

        if ($totalAverage > 85) {
            $recommendation['message'] = "Performa sangat baik!";
            $recommendation['action'] = "Siap jadi mentor.";
        } elseif ($weakestSkill) {
            $recommendation['message'] = "Perlu peningkatan di {$weakestSkill}.";
            $recommendation['action'] = "Ulangi materi terkait.";
        }

        // --- DATA CHART ---
        $radarData = [
            'categories' => array_keys($skillsAvg),
            'series' => array_values($skillsAvg)
        ];

        $labels = $student->progress->pluck('lesson.title')->toArray();
        $performanceData = [
            'labels' => empty($labels) ? [] : $labels,
            'scores' => empty($labels) ? [] : $student->progress->pluck('score')->toArray(),
            'attempts' => empty($labels) ? [] : $student->progress->pluck('attempts')->toArray()
        ];

        // --- HEATMAP (ACTIVITY LOG) ---
        $heatmapData = [];
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        foreach ($days as $day) {
            $dataPerHour = [];
            for ($hour = 0; $hour < 24; $hour++) {
                $count = $student->progress->filter(function ($p) use ($day, $hour) {
                    if (!$p->completed_at) return false;
                    $dt = \Carbon\Carbon::parse($p->completed_at);
                    return $dt->format('l') === $day && $dt->hour === $hour;
                })->count();

                $dataPerHour[] = ['x' => sprintf('%02d:00', $hour), 'y' => $count];
            }
            $heatmapData[] = ['name' => $day, 'data' => $dataPerHour];
        }

        return Inertia::render('Admin/StudentDetail', [
            'student' => $student,
            'history' => $progressDetails,
            'charts' => [
                'radar' => $radarData,
                'performance' => $performanceData,
                'heatmap' => $heatmapData,
            ],
            'analysis' => $recommendation
        ]);
    }
}
