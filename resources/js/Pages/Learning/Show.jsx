import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    FaArrowLeft,
    FaChevronRight,
    FaChevronLeft,
    FaBookOpen,
    FaInfoCircle,
    FaTimesCircle,
    FaCheckCircle,
    FaExclamationCircle,
    FaQuestionCircle,
    FaMoon,
    FaSun,
    FaVolumeUp,
    FaStopCircle,
    FaTh
} from "react-icons/fa";
import TeacherAssistant from "@/Components/TeacherAssistant";
import ModuleRenderer from '@/Components/ModuleRenderer';
import confetti from "canvas-confetti";
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";

export default function Show({ auth, lesson }) {
    // --- STATE ---
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [quizState, setQuizState] = useState({ selectedOption: null, status: "idle" });
    const [showSimInstructions, setShowSimInstructions] = useState(true);
    const [isStepCompleted, setIsStepCompleted] = useState(false);
    const [theme, setTheme] = useState('light');

    // STATE UNTUK PENAMPUNG TOTAL STATISTIK
    const [lessonStats, setLessonStats] = useState({ mistakes: 0, time_taken: 0, details: [] });

    // --- STATE UNTUK POP-UP MODAL KUSTOM ---
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // --- STATE UNTUK TEXT TO SPEECH ---
    const [isSpeaking, setIsSpeaking] = useState(false);

    const currentModule = lesson.modules[currentModuleIndex];
    const isLastModule = currentModuleIndex === lesson.modules.length - 1;

    // --- DETEKSI MODE UJIAN (Dari URL) ---
    const isExam = typeof window !== 'undefined' && (
        window.location.pathname.toLowerCase().includes('pre-test') ||
        window.location.pathname.toLowerCase().includes('post-test') ||
        window.location.pathname.toLowerCase().includes('pretest') ||
        window.location.pathname.toLowerCase().includes('posttest')
    );

    // --- Tipe Simulator ---
    const simulatorTypes = [
        'simulator_vlsm', 'simulator_flsm', 'simulator_cidr', 'simulator_cli',
        'flsm_visualizer', 'flsm_lab',
        'vlsm_visualizer', 'vlsm_lab',
        'cidr_visualizer', 'cidr_selector'
    ];

    const isSimulator = simulatorTypes.includes(currentModule.type);

    // --- HELPER: Parse Config ---
    let moduleConfig = {};
    const rawData = (currentModule.type !== 'text') ? (currentModule.content || currentModule.data) : null;

    if (rawData && typeof rawData === 'string') {
        if (rawData.trim().startsWith('<')) {
            moduleConfig = { instruction: rawData };
        } else {
            try {
                moduleConfig = JSON.parse(rawData);
            } catch (e) {
                console.error("Gagal parse config module:", e);
                moduleConfig = { instruction: rawData };
            }
        }
    } else if (rawData && typeof rawData === 'object') {
        moduleConfig = rawData;
    }

    const activeMascot = isSimulator
        ? "/images/maskotInVisualizer.png"
        : "/images/maskotInModule.png";

    // --- HELPER: Cek Status Modul untuk Kotak Navigasi ---
    const checkModuleStatus = (mod, index) => {
        const isCurrent = index === currentModuleIndex;
        const isAutoUnlock = ['text', 'video', 'simulator_cidr', 'simulator_vlsm', 'simulator_flsm', 'simulator_cli', 'cidr_visualizer', 'flsm_visualizer', 'vlsm_visualizer'].includes(mod.type);

        let qText = null;
        if (mod.type === 'quiz') {
            try {
                const data = typeof mod.content === 'string' ? JSON.parse(mod.content) : (mod.content || mod.data);
                qText = data?.question;
            } catch(e) {}
        }

        const isAnswered = lessonStats.details?.some(d => d.question === qText);
        const isCompleted = isAutoUnlock || isAnswered;

        return { isCurrent, isCompleted };
    };

    // --- EFFECT: Init & Theme ---
    useEffect(() => {
        axios.post(route('learning.start', lesson.id)).catch(console.error);

        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        } else {
            setTheme('light');
            document.documentElement.classList.remove('dark');
        }
    }, [lesson.id]);

    // --- EFFECT: Reset State, Baca Jawaban Tersimpan & Pindah Modul ---
    useEffect(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);

        const autoUnlockTypes = [
            'text', 'video',
            'simulator_cidr', 'simulator_vlsm', 'simulator_flsm', 'simulator_cli',
            'cidr_visualizer', 'flsm_visualizer', 'vlsm_visualizer'
        ];

        let shouldUnlock = autoUnlockTypes.includes(currentModule.type);

        // FITUR BARU: Membaca jawaban yang sudah tersimpan saat user loncat soal
        const savedAnswer = lessonStats.details?.find(d => d.question === moduleConfig?.question);

        if (currentModule.type === 'quiz' && savedAnswer) {
            setQuizState({
                selectedOption: savedAnswer.selected_option,
                status: isExam ? "answered" : (savedAnswer.is_correct ? "correct" : "incorrect")
            });
            setIsStepCompleted(true);
        } else {
            setQuizState({ selectedOption: null, status: "idle" });
            setIsStepCompleted(shouldUnlock);
        }

        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        if (isSimulator) setShowSimInstructions(!isMobile);

        return () => {
            window.speechSynthesis.cancel();
        };
    }, [currentModuleIndex, currentModule.type]);

    // --- HANDLER: Toggle Dark Mode ---
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    };

    // --- FUNGSI TEXT TO SPEECH ---
    const handleToggleSpeech = () => {
        if (!('speechSynthesis' in window)) {
            alert("Maaf, browser kamu belum mendukung fitur suara.");
            return;
        }

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        let rawText = currentModule.content || moduleConfig?.instruction || "Teks tidak tersedia.";
        let cleanText = rawText
            .replace(/<[^>]*>?/gm, ' ')
            .replace(/[*_~`#]/g, '')
            .trim();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'id-ID';
        utterance.rate = 1.0;
        utterance.pitch = 1.2;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    // --- HANDLER: Kuis Selesai ---
    const handleQuizOptionClick = (option) => {
        if (!isExam && quizState.status === "correct") return;

        const correctKey = moduleConfig?.correct_answer;
        const selectedKey = option.charAt(0);
        const isAnswerCorrect = selectedKey === correctKey;

        const answerDetail = {
            question: moduleConfig?.question || "Soal Kuis",
            selected_option: option,
            is_correct: isAnswerCorrect
        };

        const updateStats = (prevStats) => {
            const filteredDetails = (prevStats.details || []).filter(d => d.question !== answerDetail.question);
            return {
                ...prevStats,
                details: [...filteredDetails, answerDetail]
            };
        };

        if (isExam) {
            setQuizState({ selectedOption: option, status: "answered" });
            setIsStepCompleted(true);
            setLessonStats(prev => {
                const newState = updateStats(prev);
                newState.mistakes = newState.details.filter(d => !d.is_correct).length;
                return newState;
            });
            return;
        }

        if (isAnswerCorrect) {
            setQuizState({ selectedOption: option, status: "correct" });
            setIsStepCompleted(true);
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            setSuccessMessage("Jawaban kamu tepat sekali! Pertahankan kerja bagus ini.");
            setShowSuccessModal(true);
            setLessonStats(prev => updateStats(prev));
        } else {
            setQuizState({ selectedOption: option, status: "incorrect" });
            axios.post(route('learning.fail', lesson.id));
            setLessonStats(prev => {
                const newState = updateStats(prev);
                newState.mistakes = prev.mistakes + 1;
                return newState;
            });
        }
    };

    const handleGameComplete = (performanceData = {}) => {
        if (!isStepCompleted) {
            setIsStepCompleted(true);
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

            if (isSimulator) {
                setSuccessMessage("Luar biasa! Alokasi IP telah berhasil dihitung semua. Silakan tutup pesan ini untuk mengeksplorasi hasil akhir visualisasinya.");
            } else {
                setSuccessMessage("Luar biasa! Kamu berhasil menyelesaikan tantangan ini dengan sempurna.");
            }

            setLessonStats(prev => ({
                ...prev,
                mistakes: prev.mistakes + (performanceData.mistakes || 0),
                time_taken: prev.time_taken + (performanceData.time_taken || 0)
            }));

            setShowSuccessModal(true);
        }
    };

    const handleProceed = () => {
        setShowSuccessModal(false);
        if (!isLastModule) {
            setCurrentModuleIndex((prev) => prev + 1);
        } else {
            setShowConfirmModal(true);
        }
    };

    const handleNext = () => {
        if (!isStepCompleted) {
            setShowWarningModal(true);
            return;
        }
        handleProceed();
    };

    const backLink = lesson.week?.course?.slug
        ? route('course.map', lesson.week.course.slug)
        : route('dashboard');

    return (
        <div className="h-[100dvh] flex flex-col font-sans overflow-hidden relative transition-colors duration-300 bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
            <Head title={lesson.title} />

            {/* === HEADER === */}
            <header className="h-14 md:h-16 flex items-center justify-between px-3 md:px-6 border-b shrink-0 z-30 shadow-sm relative transition-colors bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                    <Link href={backLink} className="p-2 rounded-full transition bg-slate-100 text-slate-600 hover:bg-net-blue hover:text-white dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-cyan-600 dark:hover:text-white shrink-0">
                        <FaArrowLeft size={14} className="md:w-4 md:h-4" />
                    </Link>
                    <div className="min-w-0">
                        <h1 className="font-bold text-sm md:text-lg leading-tight truncate dark:text-white">{lesson.title}</h1>
                        <div className="text-[9px] md:text-xs flex items-center gap-1 md:gap-2 dark:text-slate-400 text-slate-500">
                             <span className="px-1.5 md:px-2 py-0.5 rounded font-bold uppercase text-[8px] md:text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-cyan-400 shrink-0">
                                {currentModule.type.replace(/simulator_|game_|_visualizer|_lab/g, ' ').toUpperCase()}
                            </span>
                            <span className="shrink-0">• Q{currentModuleIndex + 1}/{lesson.modules.length}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4 shrink-0 pl-2">
                    <div className="hidden md:flex flex-col w-32 lg:w-48">
                        <div className="flex justify-between text-[10px] md:text-xs mb-1 font-bold dark:text-slate-400 text-slate-500">
                            <span>Progress</span>
                            <span>{Math.round(((currentModuleIndex + 1) / lesson.modules.length) * 100)}%</span>
                        </div>
                        <div className="w-full h-2 md:h-2.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                            <div className="h-full transition-all duration-500 bg-net-teal dark:bg-cyan-500" style={{ width: `${((currentModuleIndex + 1) / lesson.modules.length) * 100}%` }}></div>
                        </div>
                    </div>
                    <div className="md:hidden text-[10px] font-bold text-slate-500 dark:text-slate-400">
                         {Math.round(((currentModuleIndex + 1) / lesson.modules.length) * 100)}%
                    </div>

                    <button onClick={toggleTheme} className="p-1.5 md:p-2 rounded-full transition-all duration-300 shadow-sm border bg-slate-100 text-slate-600 border-slate-200 hover:bg-yellow-100 hover:text-orange-500 hover:border-orange-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:text-yellow-300">
                        {theme === 'light' ? <FaMoon size={12} className="md:w-4 md:h-4"/> : <FaSun size={12} className="md:w-4 md:h-4"/>}
                    </button>
                </div>
            </header>

            {/* === CONTENT AREA === */}
            <div className="flex-1 relative overflow-hidden h-full bg-slate-50 dark:bg-slate-950/50 flex flex-col">

                {/* --- FITUR BARU: NAVIGASI SOAL HORIZONTAL (KHUSUS MOBILE - HANYA UJIAN) --- */}
                {!isSimulator && isExam && (
                    <div className="md:hidden w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 px-4 overflow-x-auto custom-scrollbar whitespace-nowrap flex gap-2 z-20 shadow-sm shrink-0">
                        {lesson.modules.map((m, idx) => {
                            const { isCurrent, isCompleted } = checkModuleStatus(m, idx);
                            let btnClass = "shrink-0 w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all border-2 ";

                            if (isCurrent) btnClass += "border-net-blue bg-blue-50 text-net-blue dark:border-cyan-400 dark:bg-cyan-900/30 dark:text-cyan-400 shadow-sm ring-2 ring-blue-100 dark:ring-cyan-900";
                            else if (isCompleted) btnClass += "border-emerald-500 bg-emerald-500 text-white dark:border-emerald-600 dark:bg-emerald-600";
                            else btnClass += "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500";

                            return (
                                <button key={idx} onClick={() => { setShowSuccessModal(false); setCurrentModuleIndex(idx); }} className={btnClass}>
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* --- KASUS 1: SIMULATOR (FULLSCREEN LAYOUT) --- */}
                {isSimulator ? (
                    <div className="w-full h-full relative flex flex-col">
                        <div className="flex-1 relative z-0">
                            <ModuleRenderer
                                module={currentModule}
                                config={moduleConfig}
                                onGameComplete={handleGameComplete}
                            />
                        </div>

                        <motion.div
                            drag dragMomentum={false}
                            dragConstraints={{ left: 0, right: typeof window !== 'undefined' ? window.innerWidth - 300 : 0, top: 0, bottom: typeof window !== 'undefined' ? window.innerHeight - 300 : 0 }}
                            initial={{ x: 10, y: 10 }}
                            className="absolute z-20"
                        >
                            <AnimatePresence mode="wait">
                                {showSimInstructions ? (
                                    <motion.div
                                        key="panel"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="w-72 sm:w-80 backdrop-blur-md shadow-2xl rounded-xl border flex flex-col max-h-[40vh] sm:max-h-[500px] bg-white/95 border-slate-200 dark:bg-slate-900/95 dark:border-slate-700"
                                    >
                                        <div className="p-2.5 sm:p-4 border-b flex justify-between items-center rounded-t-xl cursor-grab active:cursor-grabbing border-slate-100 bg-blue-50/50 dark:border-slate-800 dark:bg-slate-800">
                                            <h3 className="font-bold flex items-center gap-2 select-none text-xs sm:text-sm dark:text-white text-slate-700">
                                                <FaBookOpen className="text-net-blue dark:text-cyan-400"/> Panduan Lab
                                            </h3>
                                            <button onPointerDownCapture={(e) => e.stopPropagation()} onClick={() => setShowSimInstructions(false)} className="text-slate-400 hover:text-red-500 p-1">
                                                <FaTimesCircle />
                                            </button>
                                        </div>
                                        <div className="p-3 sm:p-5 overflow-y-auto text-xs sm:text-sm space-y-2 sm:space-y-3 prose prose-sm cursor-auto dark:prose-invert text-slate-600 dark:text-slate-300 custom-scrollbar" onPointerDownCapture={(e) => e.stopPropagation()}>
                                            <div dangerouslySetInnerHTML={{ __html: moduleConfig.instruction || currentModule.content || "<p>Ikuti langkah simulasi di area kerja.</p>" }} />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.button
                                        key="button"
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                        onClick={() => setShowSimInstructions(true)}
                                        className="p-2 sm:p-3 rounded-full shadow-lg hover:scale-110 transition border cursor-grab active:cursor-grabbing bg-white text-net-blue border-blue-100 dark:bg-slate-800 dark:text-cyan-400 dark:border-slate-700"
                                    >
                                        <FaInfoCircle size={20} className="sm:w-6 sm:h-6" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <div className="absolute bottom-0 w-full h-16 sm:h-20 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 flex items-center justify-between px-3 sm:px-8 z-10 pointer-events-none pb-2 sm:pb-0">
                            <div className="pointer-events-auto">
                                <button
                                    onClick={() => {
                                        setShowSuccessModal(false);
                                        setCurrentModuleIndex(prev => Math.max(0, prev - 1));
                                    }}
                                    disabled={currentModuleIndex === 0}
                                    className="flex items-center gap-1 sm:gap-2 font-bold transition px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-sm border bg-white/90 text-slate-500 hover:text-slate-800 border-slate-200 dark:bg-slate-800/90 dark:text-slate-400 dark:hover:text-white dark:border-slate-700 text-[10px] sm:text-sm disabled:opacity-30">
                                    <FaChevronLeft /> <span className="hidden sm:inline">Sebelumnya</span>
                                </button>
                            </div>
                            <div className="pointer-events-auto">
                                <button onClick={handleNext} className={`flex items-center gap-1 sm:gap-2 px-4 py-2 sm:px-8 sm:py-3 font-bold rounded-full shadow-lg transition transform text-[10px] sm:text-sm ${!isStepCompleted ? 'bg-slate-300 text-slate-500 dark:bg-slate-700' : 'bg-net-blue hover:bg-blue-700 text-white dark:bg-cyan-600 dark:hover:bg-cyan-500'}`}>
                                    {isLastModule ? 'Selesai Level' : 'Lanjut Materi'} <FaChevronRight />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (

                    // =========================================================================
                    // --- KASUS 2: TEXT, GAME, QUIZ (RPG DIALOG LAYOUT) ---
                    // =========================================================================
                    <div className="flex-1 w-full overflow-y-auto custom-scrollbar relative pb-24 sm:pb-32">
                        <div className="min-h-full flex justify-center pt-6 sm:pt-8 md:pt-12 px-4 md:px-8">

                            <div className="flex flex-col md:flex-row items-start gap-6 lg:gap-12 w-full max-w-6xl animate-fade-in-up mb-8">

                                {/* SIDEBAR KIRI (NETBOT & MATRIKS NAVIGASI) */}
                                <div className="hidden md:flex md:w-48 lg:w-72 shrink-0 flex-col items-center sticky top-24 lg:top-36">
                                    <div className="relative w-full">
                                        <div className="absolute inset-0 bg-blue-400 dark:bg-cyan-500 blur-3xl opacity-20 rounded-full scale-110"></div>
                                        <img
                                            src={activeMascot}
                                            alt="NetBot Mengajar"
                                            className="w-full relative z-10 drop-shadow-2xl anim-float anim-breath"
                                        />
                                    </div>
                                    <div className="mt-6 flex flex-col items-center">
                                        <span className="bg-slate-800 dark:bg-slate-700 text-white text-xs lg:text-sm font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg">
                                            NetBot
                                        </span>
                                    </div>

                                    {/* --- FITUR BARU: MATRIKS NAVIGASI SOAL (KHUSUS DESKTOP - HANYA UJIAN) --- */}
                                    {isExam && (
                                        <div className="w-full mt-8 bg-white dark:bg-slate-800/80 p-5 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 transition-colors">
                                            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-4 text-center uppercase tracking-widest flex items-center justify-center gap-2">
                                                <FaTh /> Navigasi Matriks
                                            </h3>
                                            <div className="flex flex-wrap justify-center gap-2">
                                                {lesson.modules.map((m, idx) => {
                                                    const { isCurrent, isCompleted } = checkModuleStatus(m, idx);
                                                    let btnClass = "w-9 h-9 lg:w-11 lg:h-11 rounded-xl font-bold text-xs lg:text-sm flex items-center justify-center transition-all border-2 ";

                                                    if (isCurrent) btnClass += "border-net-blue bg-blue-50 text-net-blue dark:border-cyan-400 dark:bg-cyan-900/30 dark:text-cyan-400 scale-110 shadow-md ring-2 ring-blue-100 dark:ring-cyan-900/50";
                                                    else if (isCompleted) btnClass += "border-emerald-500 bg-emerald-500 text-white dark:border-emerald-600 dark:bg-emerald-600 hover:bg-emerald-600 hover:scale-105 shadow-sm";
                                                    else btnClass += "border-slate-200 bg-white text-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-slate-700";

                                                    return (
                                                        <button key={idx} onClick={() => { setShowSuccessModal(false); setCurrentModuleIndex(idx); }} className={btnClass} title={`Soal ${idx + 1}`}>
                                                            {idx + 1}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* AREA TENGAH (KONTEN MODUL) */}
                                <div className="relative flex-1 w-full mt-2 md:mt-8 lg:mt-12">

                                    <div className="hidden md:block absolute top-16 lg:top-24 -left-[14px] w-7 h-7 bg-white dark:bg-slate-800 border-b-2 border-l-2 border-slate-200 dark:border-slate-700 transform rotate-45 rounded-bl-sm z-20 transition-colors duration-300"></div>

                                    <div className="relative z-10 w-full bg-white dark:bg-slate-800 p-6 sm:p-8 md:p-10 lg:p-12 rounded-[2rem] shadow-xl border-2 border-slate-200 dark:border-slate-700 transition-colors duration-300">

                                        {/* HEADER PESAN NETBOT (DESKTOP) DENGAN TOMBOL TTS */}
                                        <div className="hidden md:flex items-center justify-between mb-8 border-b-2 border-slate-100 dark:border-slate-700/50 pb-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-orange-500 animate-bounce' : 'bg-green-500 animate-pulse'} border border-green-200 dark:border-green-800`}></div>
                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                    {isSpeaking ? 'NetBot Sedang Berbicara...' : 'Pesan dari NetBot'}
                                                </span>
                                            </div>

                                            <button
                                                onClick={handleToggleSpeech}
                                                title={isSpeaking ? "Hentikan Suara" : "Dengarkan Penjelasan"}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-bold shadow-sm active:scale-95
                                                    ${isSpeaking
                                                        ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100 dark:bg-red-500/10 dark:border-red-500/30'
                                                        : 'bg-blue-50 text-net-blue border-blue-200 hover:bg-blue-100 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30'
                                                    }`}
                                            >
                                                {isSpeaking ? (
                                                    <><FaStopCircle size={14} /> Berhenti</>
                                                ) : (
                                                    <><FaVolumeUp size={14} /> Dengarkan</>
                                                )}
                                            </button>
                                        </div>

                                        {/* HEADER PESAN NETBOT (MOBILE) DENGAN TOMBOL TTS */}
                                        <div className="md:hidden flex items-start justify-between gap-3 mb-6 border-b-2 border-slate-100 dark:border-slate-700 pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-14 h-14 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center p-1 border-2 border-blue-100 dark:border-slate-600 ${isSpeaking ? 'animate-pulse' : ''}`}>
                                                    <img src={activeMascot} className="w-full h-full object-contain drop-shadow-sm" alt="NetBot" />
                                                </div>
                                                <div>
                                                    <span className="bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">NetBot</span>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                                                        {isSpeaking ? 'Sedang berbicara...' : 'Sedang menjelaskan...'}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleToggleSpeech}
                                                className={`p-2.5 rounded-full border transition-all shadow-sm active:scale-95 mt-1
                                                    ${isSpeaking
                                                        ? 'bg-red-50 text-red-500 border-red-200 dark:bg-red-500/10 dark:border-red-500/30'
                                                        : 'bg-blue-50 text-net-blue border-blue-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30'
                                                    }`}
                                            >
                                                {isSpeaking ? <FaStopCircle size={16} /> : <FaVolumeUp size={16} />}
                                            </button>
                                        </div>

                                        <div className="w-full prose prose-slate dark:prose-invert max-w-none prose-headings:text-net-blue dark:prose-headings:text-cyan-400 prose-img:rounded-2xl prose-img:shadow-md text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                                            <ModuleRenderer
                                                module={currentModule}
                                                config={moduleConfig}
                                                quizState={quizState}
                                                onQuizOptionClick={handleQuizOptionClick}
                                                onGameComplete={handleGameComplete}
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* === FOOTER NAVIGASI (Hanya untuk Mode Non-Simulator) === */}
            {!isSimulator && (
                <div className="h-16 sm:h-20 border-t flex items-center justify-between px-4 sm:px-8 shrink-0 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-colors bg-white border-slate-200 dark:bg-slate-950 dark:border-slate-800 pb-safe">
                    <button
                        onClick={() => {
                            setShowSuccessModal(false);
                            setCurrentModuleIndex(prev => Math.max(0, prev - 1));
                        }}
                        disabled={currentModuleIndex === 0}
                        className="flex items-center gap-1 sm:gap-2 disabled:opacity-30 font-bold transition text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-[10px] sm:text-sm">
                        <FaChevronLeft size={10} className="sm:w-4 sm:h-4"/> <span className="hidden sm:inline">Sebelumnya</span>
                    </button>

                    <div className="sm:hidden text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        {currentModuleIndex + 1} / {lesson.modules.length}
                    </div>

                    <button onClick={handleNext} className={`flex items-center gap-1 sm:gap-2 px-5 py-2 sm:px-8 sm:py-3 font-bold rounded-full shadow-lg transition-all transform text-[10px] sm:text-sm ${!isStepCompleted ? 'bg-slate-200 text-slate-400 shadow-none dark:bg-slate-800 dark:text-slate-600' : 'bg-gradient-to-r from-net-blue to-blue-600 text-white shadow-blue-200 hover:shadow-blue-300 active:scale-95 dark:from-cyan-600 dark:to-blue-600 dark:shadow-cyan-900/50'}`}>
                        {isLastModule ? 'Selesai' : 'Lanjut'} <FaChevronRight size={10} className="sm:w-4 sm:h-4" />
                    </button>
                </div>
            )}

            {/* === MODAL POP-UP SUKSES === */}
            <AnimatePresence>
                {showSuccessModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl border-2 border-slate-200 dark:border-slate-700"
                        >
                            <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/40 text-green-500 rounded-full flex items-center justify-center mb-4">
                                <FaCheckCircle className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Hebat! 🎉</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                                {successMessage}
                            </p>

                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);

                                    if (!isSimulator) {
                                        if (!isLastModule) {
                                            setCurrentModuleIndex((prev) => prev + 1);
                                        } else {
                                            setShowConfirmModal(true);
                                        }
                                    }
                                }}
                                className={`w-full font-bold py-3.5 rounded-xl transition shadow-lg text-white
                                    ${isSimulator ? 'bg-teal-500 hover:bg-teal-600 shadow-teal-500/30' : 'bg-net-blue hover:bg-blue-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 shadow-blue-500/30'}`}
                            >
                                {isSimulator ? 'Lihat Hasil Visualisasi' : (isLastModule ? 'Selesaikan Level' : 'Lanjut Materi Berikutnya')}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* === MODAL POP-UP PERINGATAN === */}
            <AnimatePresence>
                {showWarningModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl border-2 border-slate-200 dark:border-slate-700"
                        >
                            <div className="w-20 h-20 mx-auto bg-orange-100 dark:bg-orange-900/40 text-orange-500 rounded-full flex items-center justify-center mb-4">
                                <FaExclamationCircle className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Eits, Tunggu Dulu!</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                                Kamu harus menyelesaikan tantangan, kuis, atau simulasi di halaman ini terlebih dahulu sebelum bisa lanjut ke materi berikutnya.
                            </p>
                            <button
                                onClick={() => setShowWarningModal(false)}
                                className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold py-3.5 rounded-xl transition"
                            >
                                Oke, Aku Kerjain Dulu
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* === MODAL CONFIRM SELESAI === */}
            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl border-2 border-slate-200 dark:border-slate-700"
                        >
                            <div className="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900/40 text-blue-500 rounded-full flex items-center justify-center mb-4">
                                <FaQuestionCircle className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Selesaikan Level?</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                                Kamu sudah berada di akhir materi. Yakin ingin menyelesaikannya sekarang dan mengklaim XP kamu?
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-white font-bold py-3.5 rounded-xl transition border border-slate-200 dark:border-slate-600"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        router.post(route("learning.complete", lesson.id), lessonStats);
                                    }}
                                    className="flex-1 bg-net-blue hover:bg-blue-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-blue-500/30"
                                >
                                    Ya, Selesai!
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* === CHATBOT (Teacher Assistant) === */}
            {!isExam && (
                <TeacherAssistant
                    user={auth?.user || { name: 'Siswa' }}
                    currentLessonTitle={lesson.title}
                    currentModuleTitle={currentModule.title || currentModule.type}
                    className={isSimulator ? "bottom-20 sm:bottom-24" : "bottom-24 sm:bottom-28"}
                    mascotImage={activeMascot}
                />
            )}

            {/* Scrollbar & Animasi Rakun CSS */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                    100% { transform: translateY(0px); }
                }
                .anim-float { animation: float 3.5s ease-in-out infinite; }
                .anim-breath { animation: breath 4s ease-in-out infinite; }
                @keyframes breath {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.03); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
