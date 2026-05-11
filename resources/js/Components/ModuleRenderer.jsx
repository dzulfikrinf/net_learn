import React from 'react';
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';

// --- 1. IMPORT KOMPONEN GAME & VISUALIZER ---
import MatchingGame from '@/Components/Games/MatchingGame';
import CardSorter from '@/Components/Games/CardSorter';
import ByteToggler from '@/Components/Games/ByteToggler';
import SmartForm from '@/Components/Games/SmartForm';
import BroadcastSimulator from '@/Components/Games/BroadcastSimulator';

// Import Visualizer Baru
import CidrVisualizer from '@/Components/Visualizer/CidrVisualizer';
import FlsmVisualizer from '@/Components/Visualizer/FlsmVisualizer';
import VlsmVisualizer from '@/Components/Visualizer/VlsmVisualizer';

// Import Visualizer Lama
import SubnetVisualizerWrapper from "@/Components/Visualizer/SubnetVisualizerWrapper";

export default function ModuleRenderer({ module, config: propConfig, quizState, onQuizOptionClick, onGameComplete }) {

    // Helper: Parsing Config
    let config = propConfig;
    if (!config) {
        try {
            if (module.type !== 'text' && typeof module.content === 'string') {
                config = JSON.parse(module.content);
            }
        } catch (e) { /* Silent Error */ }
    }

    const handleInteractiveComplete = (performanceData) => {
        if (onGameComplete) {
            onGameComplete(performanceData);
        }
    };

    // ==========================================================
    // TRIK DETEKSI MODE UJIAN (Dari URL Slug)
    // Jika URL mengandung kata pre-test atau post-test, masuk ke Mode Ujian
    // ==========================================================
    const isExam = typeof window !== 'undefined' && (
        window.location.pathname.toLowerCase().includes('pre-test') ||
        window.location.pathname.toLowerCase().includes('post-test') ||
        window.location.pathname.toLowerCase().includes('pretest') ||
        window.location.pathname.toLowerCase().includes('posttest')
    );

    // =========================================
    // A. SECTION GAME
    // =========================================

    if (module.type === 'game_matching') {
        return <div className="my-4 md:my-8"><MatchingGame data={config} onComplete={handleInteractiveComplete} /></div>;
    }

    if (module.type === 'game_sorter') {
        return <div className="my-4 md:my-8"><CardSorter data={config} onComplete={handleInteractiveComplete} /></div>;
    }

    if (module.type === 'game_toggler') {
        return <div className="my-4 md:my-8"><ByteToggler data={config} onComplete={handleInteractiveComplete} /></div>;
    }

    if (module.type === 'smart_form') {
        return <div className="my-4 md:my-8"><SmartForm data={config} onComplete={handleInteractiveComplete} /></div>;
    }

    if (module.type === 'broadcast_simulator') {
        return <div className="my-4 md:my-8"><BroadcastSimulator data={config} onComplete={handleInteractiveComplete} /></div>;
    }

    // =========================================
    // B. SECTION VISUALIZER (NETWORK SIM)
    // =========================================

    if (module.type === 'cidr_visualizer' || module.type === 'cidr_selector') {
        return (
            <div className="w-full h-[70vh] md:h-[85vh] my-4 md:my-8 border border-slate-200 rounded-xl md:rounded-2xl overflow-hidden shadow-sm">
                <CidrVisualizer data={config} />
            </div>
        );
    }

    if (module.type === 'flsm_visualizer' || module.type === 'flsm_lab') {
        return (
            <FlsmVisualizer
                initialMode={module.type === 'flsm_visualizer' ? 'auto' : 'manual'}
                data={config}
                onGameComplete={handleInteractiveComplete}
            />
        );
    }

    if (module.type === 'vlsm_visualizer' || module.type === 'vlsm_lab') {
        return (
            <VlsmVisualizer
                initialMode={module.type === 'vlsm_visualizer' ? 'auto' : 'manual'}
                data={config}
                onGameComplete={handleInteractiveComplete}
            />
        );
    }

    if (['simulator_vlsm', 'simulator_flsm', 'simulator_cidr'].includes(module.type)) {
        return <SubnetVisualizerWrapper moduleType={module.type} config={config} />;
    }

    // =========================================
    // C. SECTION QUIZ (DENGAN MODE UJIAN & GAMBAR)
    // =========================================

    if (module.type === 'quiz') {
        const { selectedOption, status } = quizState || {};

        return (
            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-slate-200 dark:border-slate-700">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 md:p-6 rounded-xl md:rounded-2xl border dark:border-slate-700">
                    <h3 className="font-bold mb-4 md:mb-6 dark:text-white flex items-center gap-2 text-sm md:text-base">
                        <span className={`${isExam ? 'bg-purple-500' : 'bg-blue-500'} text-white w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs`}>
                            ?
                        </span>
                        {isExam ? 'Pertanyaan Ujian' : 'Uji Pemahaman'}
                    </h3>

                    {/* --- FITUR BARU: TAMPILKAN GAMBAR SOAL JIKA ADA --- */}
                    {config?.image && (
                        <div className="mb-6 flex justify-center bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                            <img
                                src={config.image}
                                alt="Ilustrasi Soal"
                                className="max-w-full h-auto max-h-64 object-contain rounded shadow-sm"
                            />
                        </div>
                    )}

                    <p className="mb-6 md:mb-8 text-base md:text-lg dark:text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                        {config?.question}
                    </p>

                    <div className="grid gap-2.5 md:gap-3">
                        {config?.options?.map((opt, idx) => {
                            // Style Default (Belum dipilih)
                            let style = "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 dark:text-white hover:border-blue-400";
                            let showCheck = false;
                            let showCross = false;

                            // Jika opsi ini dipilih oleh user
                            if (selectedOption === opt) {
                                if (isExam) {
                                    // 1. JIKA INI UJIAN: Mode Senyap (Warna Biru Netral)
                                    style = "bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 ring-2 ring-blue-200 dark:ring-blue-800";
                                } else {
                                    // 2. JIKA LATIHAN BIASA: Munculkan Benar/Salah
                                    if (status === 'correct') {
                                        style = "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:text-green-400";
                                        showCheck = true;
                                    } else if (status === 'incorrect') {
                                        style = "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-400";
                                        showCross = true;
                                    } else {
                                        // Sedang loading / mengecek
                                        style = "bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
                                    }
                                }
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => onQuizOptionClick && onQuizOptionClick(opt)}
                                    // Di mode ujian, jangan kunci jawaban (agar bisa ganti jawaban sebelum di-submit/lanjut)
                                    disabled={!isExam && status === 'correct'}
                                    className={`w-full text-left px-4 py-3 md:px-5 md:py-3.5 rounded-lg md:rounded-xl border-2 font-medium transition-all flex justify-between items-center text-sm md:text-base ${style}`}
                                >
                                    <span>{opt}</span>
                                    {showCheck && <FaCheckCircle className="text-green-600 shrink-0 ml-2"/>}
                                    {showCross && <FaTimesCircle className="text-red-600 shrink-0 ml-2"/>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // =========================================
    // D. FALLBACK UNTUK MODUL TEKS BIASA (TEORI)
    // =========================================
    const rawContent = module.content || "";

    return (
        <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
            >
                {rawContent}
            </ReactMarkdown>
        </div>
    );
}
