<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    // =========================================================================
    // 1. CHATBOT SISWA (UMUM/EKSPLORASI)
    // =========================================================================
    public function ask(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'lesson_title' => 'nullable|string',
            'module_title' => 'nullable|string',
        ]);

        $userMessage = $request->input('message');
        $lessonTitle = $request->input('lesson_title', 'Eksplorasi Bebas');
        $moduleTitle = $request->input('module_title', 'Materi Umum Jaringan');

        // Gunakan config() sebagai fallback jika env() terkena cache di hosting
        $apiKey = env('GEMINI_API_KEY') ?? config('services.gemini.api_key') ?? config('app.gemini_key');

        if (!$apiKey) {
            // UBAH JADI 200 BIAR BISA DIBACA DI CHAT REACT
            return response()->json(['reply' => "⚠️ DEBUG ENV: API Key tidak terbaca oleh Laravel. Kemungkinan karena Cache Config di Hosting."], 200);
        }

        $systemInstruction = "Kamu adalah NetBot, asisten guru interaktif khusus untuk aplikasi NetLearn.

        ATURAN KETAT:
        1. LINGKUP MATERI: Kamu HANYA BOLEH menjawab pertanyaan seputar Jaringan Komputer, khususnya IP Address (IPv4/IPv6) dan Subnetting (FLSM/VLSM).
        2. PENOLAKAN: Jika user bertanya di luar topik jaringan komputer, KAMU WAJIB MENOLAKNYA dengan sopan.
        3. KONTEKS SAAT INI: Saat ini siswa sedang berada di halaman materi: [Lesson: {$lessonTitle}] - [Modul: {$moduleTitle}]. Hubungkan jawabanmu dengan materi ini.
        4. GAYA BAHASA: Santai, memotivasi, logis, singkat (maksimal 2-3 kalimat).";

        return $this->sendToGemini($apiKey, $systemInstruction, $userMessage, 0.3);
    }

    // =========================================================================
    // 2. CHATBOT SISWA (KONTEKS PER STAGE)
    // =========================================================================
    public function askStage(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'stage'   => 'required|string',
        ]);

        $userMessage = $request->input('message');
        $stageTitle  = $request->input('stage');
        $apiKey      = env('GEMINI_API_KEY');

        if (!$apiKey) {
            return response()->json(['reply' => "⚠️ DEBUG ENV: API Key tidak terbaca."], 200);
        }

        // Logika Pembatasan Materi
        $stageScope = "";
        $forbiddenTopics = "";
        $stageTitleLower = strtolower($stageTitle);

        if (str_contains($stageTitleLower, 'stage 1')) {
            $stageScope = "Konsep dasar IP Address, kelas IP, IP Public vs Private.";
            $forbiddenTopics = "Subnet Mask, Prefix, Subnetting, FLSM, VLSM.";
        } elseif (str_contains($stageTitleLower, 'stage 2')) {
            $stageScope = "Pengenalan Subnet Mask dan Prefix.";
            $forbiddenTopics = "Cara menghitung subnetting, FLSM, VLSM.";
        } elseif (str_contains($stageTitleLower, 'stage 3')) {
            $stageScope = "Konsep dasar subnetting, Network ID, Broadcast ID.";
            $forbiddenTopics = "Perhitungan blok FLSM utuh, VLSM.";
        } elseif (str_contains($stageTitleLower, 'stage 4')) {
            $stageScope = "Metode FLSM (Fixed Length Subnet Mask).";
            $forbiddenTopics = "Metode VLSM (Variable Length).";
        } elseif (str_contains($stageTitleLower, 'stage 5')) {
            $stageScope = "Metode VLSM, efisiensi IP.";
            $forbiddenTopics = "Routing dinamis (OSPF/BGP).";
        } else {
            $stageScope = "Materi dasar dari " . $stageTitle;
            $forbiddenTopics = "Materi lanjutan di luar " . $stageTitle;
        }

        $systemInstruction = "Kamu adalah NetBot di aplikasi NetLearn. Siswa berada di materi: '{$stageTitle}'.

        ATURAN SUPER KETAT:
        1. FOKUS: Hanya bahas: {$stageScope}.
        2. DILARANG: Jangan bahas: {$forbiddenTopics}. Jika ditanya, tolak sopan dan bilang itu materi nanti.
        3. GAYA: Santai, singkat, gunakan bold untuk kata kunci.";

        return $this->sendToGemini($apiKey, $systemInstruction, $userMessage, 0.1);
    }

    // =========================================================================
    // 3. CHATBOT GURU (DATA ANALYST)
    // =========================================================================
    public function askAdmin(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'context_data' => 'required|array',
        ]);

        $userMessage = $request->input('message');
        $context = $request->input('context_data');
        $apiKey = env('GEMINI_API_KEY');

        if (!$apiKey) {
            return response()->json(['reply' => "⚠️ DEBUG ENV: API Key tidak terbaca."], 200);
        }

        $contextString = json_encode($context, JSON_PRETTY_PRINT);

        $systemInstruction = "Kamu adalah Asisten Analis Data Pendidikan cerdas untuk Admin NetLearn.
        Tugasmu: Membantu Guru menganalisis performa siswa berdasarkan data real-time dashboard.

        DATA DASHBOARD SAAT INI:
        {$contextString}

        PANDUAN MENJAWAB:
        1. Jawablah HANYA berdasarkan data di atas. Jangan mengarang.
        2. Analisis 'struggling_students' untuk mencari siswa yang butuh bantuan.
        3. Analisis 'difficulty_stats' (avg retries) untuk menentukan materi tersulit.
        4. Berikan saran pedagogis yang konkret dan singkat.
        5. Gaya bahasa: Profesional, ramah, to-the-point (Bahasa Indonesia).";

        return $this->sendToGemini($apiKey, $systemInstruction, $userMessage, 0.4);
    }

    // =========================================================================
    // HELPER: FUNGSI PENGIRIM KE GEMINI
    // =========================================================================
    private function sendToGemini($apiKey, $systemPrompt, $userMessage, $temperature)
    {
        try {
            $response = Http::withOptions(['verify' => false])
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key={$apiKey}", [
                    'system_instruction' => [
                        'parts' => [['text' => $systemPrompt]]
                    ],
                    'contents' => [
                        ['role' => 'user', 'parts' => [['text' => $userMessage]]]
                    ],
                    'generationConfig' => [
                        'temperature' => $temperature,
                    ]
                ]);

            if ($response->failed()) {
                Log::error('Gemini API Error: ' . $response->body());
                // TRIK CEPU: Tampilkan error Google ke layar chat! (Status diganti 200)
                return response()->json([
                    'reply' => "⚠️ DEBUG GOOGLE ERROR:\n" . $response->body()
                ], 200);
            }

            $data = $response->json();
            $botReply = $data['candidates'][0]['content']['parts'][0]['text'] ?? "Maaf, saya tidak bisa memproses permintaan tersebut.";

            return response()->json(['reply' => $botReply]);

        } catch (\Exception $e) {
            Log::error('Controller Crash: ' . $e->getMessage());
            // TRIK CEPU: Tampilkan error Server ke layar chat! (Status diganti 200)
            return response()->json([
                'reply' => "⚠️ DEBUG LARAVEL CRASH:\n" . $e->getMessage()
            ], 200);
        }
    }
}
