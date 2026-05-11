import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import LearningNode from '@/Components/LearningNode';
import TeacherAssistant from '@/Components/TeacherAssistant';
import StageAIModal from '@/Components/StageAIModal';
import {
    FaFire, FaTrophy, FaUserAstronaut, FaSignOutAlt,
    FaMapMarkedAlt, FaStar, FaChartLine, FaMedal, FaMoon, FaSun, FaCode
} from 'react-icons/fa';

export default function Dashboard({ auth, weeks, gamification, course }) {
    // --- STATE TEMA DARK MODE ---
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        } else {
            setTheme('light');
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    };

    // STATE UNTUK MODAL AI STAGE
    const [aiModalConfig, setAiModalConfig] = useState({
        isOpen: false,
        stageTitle: '',
        mascotSrc: ''
    });

    const openStageAI = (title, imgSrc) => {
        setAiModalConfig({ isOpen: true, stageTitle: title, mascotSrc: imgSrc });
    };

    const closeStageAI = () => {
        setAiModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    // --- LOGIKA ZIG-ZAG (Pola Ular) ---
    const getPosition = (index) => {
        const mod = index % 4;
        if (mod === 1) return 'right';
        if (mod === 3) return 'left';
        return 'center';
    };

    // --- LOGIKA STATUS ---
    const getLessonStatus = (lesson, allWeeks) => {
        const progress = lesson.user_progress && lesson.user_progress.length > 0 ? lesson.user_progress[0] : null;
        if (progress?.is_completed || progress?.status === 'completed') return 'completed';
        if (allWeeks.length > 0 && allWeeks[0].lessons.length > 0 && allWeeks[0].lessons[0].id === lesson.id) {
             return 'unlocked';
        }
        if (progress) return 'unlocked';
        return 'locked';
    };

    // ==========================================
    // ARRAY GAMBAR MASKOT RAKUN (STAGE 1-5)
    // ==========================================
    const mascotImages = [
        '/images/mascotstage/stage1.svg',
        '/images/mascotstage/stage2.svg',
        '/images/mascotstage/stage3.png',
        '/images/mascotstage/stage4.png',
        '/images/mascotstage/stage5.png'
    ];

    return (
        <div className="h-[100dvh] w-full bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 font-sans flex flex-col md:flex-row overflow-hidden relative transition-colors duration-300">
            <Head title={course ? course.title : "Peta Belajar"} />

            {/* === 1. SIDEBAR KIRI (PC/Tablet Only) === */}
            <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col p-6 shadow-sm z-30 shrink-0 relative transition-colors">
                <div className="flex items-center gap-3 mb-10">
                    <div className="bg-gradient-to-tr from-blue-500 to-cyan-400 p-2.5 rounded-xl shadow-lg shadow-blue-200 dark:shadow-cyan-900/20">
                        <FaUserAstronaut size={24} className="text-white" />
                    </div>
                    <div>
                        <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-500">
                            NetLearn
                        </span>
                    </div>
                </div>

                <nav className="space-y-3 flex-1">
                    <div className="flex items-center gap-4 px-4 py-3 bg-blue-50 text-blue-600 dark:bg-cyan-900/30 dark:text-cyan-400 rounded-xl font-bold border-l-4 border-blue-500 dark:border-cyan-400 shadow-sm transition-all hover:pl-6 cursor-default">
                        <FaMapMarkedAlt /> Peta Belajar
                    </div>
                    <Link href={route('leaderboard')} className="flex items-center gap-4 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl font-medium transition-all group">
                        <FaTrophy className="group-hover:scale-110 transition" /> Leaderboard
                    </Link>
                </nav>

                <div className="mt-auto space-y-2">
                    <Link
                        href={route('about')}
                        className="flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 transition font-medium px-4 py-2 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg w-full text-left"
                    >
                        <FaCode />
                        <span>Tentang Developer</span>
                    </Link>
                    <button onClick={toggleTheme} className="flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 transition font-medium px-4 py-2 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg w-full text-left">
                        {theme === 'light' ? <><FaMoon /> Mode Gelap</> : <><FaSun /> Mode Terang</>}
                    </button>
                    <Link href={route('logout')} method="post" as="button" className="flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition font-medium px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg w-full text-left">
                        <FaSignOutAlt /> Keluar
                    </Link>
                </div>
            </aside>

            {/* === 2. AREA UTAMA (Peta Belajar) === */}
            <main className="flex-1 relative flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-950/50 transition-colors">
                <div className="absolute inset-0 opacity-30 dark:opacity-10 pointer-events-none bg-grid-pattern"></div>

                {/* --- MOBILE TOP BAR --- */}
                <div className="md:hidden bg-white dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center z-20 shrink-0 shadow-sm transition-colors">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-tr from-blue-500 to-cyan-400 p-1.5 rounded-lg shadow-sm">
                            <FaUserAstronaut size={16} className="text-white" />
                        </div>
                        <span className="font-black text-lg tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-500">NetLearn</span>
                    </div>
                    <div className="flex gap-2 text-xs font-bold items-center">
                        <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full border border-orange-100 dark:border-orange-800/50 transition-colors">
                            <FaStar size={10} /> {gamification?.stars || 0}
                        </div>
                        <div className="flex items-center gap-1 bg-blue-50 dark:bg-cyan-900/30 text-blue-600 dark:text-cyan-400 px-2 py-1 rounded-full border border-blue-100 dark:border-cyan-800/50 transition-colors">
                            <FaTrophy size={10} /> {gamification?.xp || 0}
                        </div>
                        <button onClick={toggleTheme} className="ml-1 p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                            {theme === 'light' ? <FaMoon size={14} /> : <FaSun size={14} />}
                        </button>
                    </div>
                </div>

                {/* --- KONTEN PETA (Scroll) --- */}
                <div className="flex-1 overflow-y-auto px-4 py-8 md:py-12 relative z-10 flex flex-col items-center pb-32 md:pb-20 scroll-smooth custom-scrollbar">

                    <div className="text-center mb-16 md:mb-24 mt-2 md:mt-0">
                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-2 px-2 transition-colors">
                            {course ? course.title : 'Petualangan Jaringan'}
                        </h1>
                        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 px-4 max-w-md mx-auto transition-colors">
                            {course ? course.description : 'Selesaikan setiap node untuk membuka materi selanjutnya.'}
                        </p>
                    </div>

                    {/* RENDER MAP (SEMUA MINGGU) */}
                    <div className="flex flex-col items-center w-full max-w-2xl">
                        {weeks.map((week, weekIndex) => (
                            <div key={week.id} className="w-full flex flex-col items-center mb-20 md:mb-28 relative">

                                {/* Badge Judul Minggu */}
                                <div className="mb-8 md:mb-12 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-md px-5 md:px-6 py-2 rounded-full flex items-center gap-2 z-20">
                                    <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-cyan-500 animate-pulse"></div>
                                    <span className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest text-[10px] md:text-xs">
                                        {week.title}
                                    </span>
                                </div>

                                {/* Nodes dalam Minggu Ini */}
                                <div className="flex flex-col items-center w-full">
                                    {week.lessons.map((lesson, index) => {
                                        const position = getPosition(index);
                                        const nextIndex = index + 1;
                                        const nextPosition = nextIndex < week.lessons.length ? getPosition(nextIndex) : 'center';
                                        const isLastInWeek = index === week.lessons.length - 1;

                                        const status = getLessonStatus(lesson, weeks);
                                        const lessonData = { ...lesson, status_user: status };

                                        // ==========================================
                                        // LOGIKA PENEMPATAN MASCOT (RESPONSIF)
                                        // ==========================================
                                        const mascotTargetIndex = week.lessons.length > 1 ? 1 : 0;
                                        const showMascot = index === mascotTargetIndex;
                                        const isMascotLeft = position === 'right' || (position === 'center' && weekIndex % 2 === 0);

                                        const firstLessonStatus = getLessonStatus(week.lessons[0], weeks);
                                        const isStageUnlocked = firstLessonStatus !== 'locked';

                                        return (
                                            <React.Fragment key={lesson.id}>

                                                {/* --- AI MASCOT WRAPPER --- */}
                                                {showMascot && (
                                                    <div className="relative w-full h-0 z-20 flex justify-center">
                                                        <div
                                                            onClick={() => {
                                                                if (isStageUnlocked) {
                                                                    openStageAI(week.title, mascotImages[weekIndex % mascotImages.length]);
                                                                } else {
                                                                    // Munculkan alert lucu jika masih terkunci
                                                                    alert("Sabar ya! Kamu harus menyelesaikan Stage sebelumnya dulu untuk ngobrol sama NetBot di sini 🦝🔒");
                                                                }
                                                            }}
                                                            className={`
                                                                flex absolute top-0 sm:top-2 flex-col items-center group transition-transform
                                                                ${isMascotLeft ? 'right-1/2 mr-14 sm:mr-16 lg:mr-24' : 'left-1/2 ml-14 sm:ml-16 lg:ml-24'}
                                                                /* Efek CSS berubah tergantung terbuka atau terkunci */
                                                                ${isStageUnlocked ? 'cursor-pointer hover:scale-105 hover:-translate-y-1 sm:hover:-translate-y-2' : 'cursor-not-allowed opacity-60 grayscale'}
                                                            `}
                                                        >
                                                            {/* Balon Kata (Hanya muncul jika stage sudah terbuka) */}
                                                            {isStageUnlocked && (
                                                                <div className="absolute -top-10 sm:-top-12 opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 sm:group-hover:-translate-y-2 transition-all duration-300 whitespace-nowrap bg-white dark:bg-slate-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-30 pointer-events-none">
                                                                    <p className="text-[10px] sm:text-xs font-bold text-blue-600 dark:text-cyan-400">
                                                                        Tanya AI Stage {weekIndex + 1}!
                                                                    </p>
                                                                    <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 rotate-45"></div>
                                                                </div>
                                                            )}

                                                            {/* GAMBAR MASKOT LOKAL */}
                                                            <div className="relative">
                                                                {/* Glow efek hanya nyala kalau stage kebuka */}
                                                                {isStageUnlocked && (
                                                                    <div className="absolute inset-0 bg-blue-400 dark:bg-cyan-500 blur-xl sm:blur-2xl opacity-20 rounded-full scale-150 group-hover:scale-125 transition-transform"></div>
                                                                )}
                                                                <img
                                                                    src={mascotImages[weekIndex % mascotImages.length]}
                                                                    alt={`AI Stage ${weekIndex + 1}`}
                                                                    className={`
                                                                        w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 relative z-10 drop-shadow-xl sm:drop-shadow-2xl
                                                                        /* Animasi berhenti kalau terkunci */
                                                                        ${isStageUnlocked ? (weekIndex % 3 === 0 ? 'anim-float' : weekIndex % 3 === 1 ? 'anim-breathe' : 'anim-wiggle') : ''}
                                                                    `}
                                                                />

                                                                {/* Ikon Gembok (Muncul menumpuk di atas maskot kalau terkunci) */}
                                                                {!isStageUnlocked && (
                                                                    <div className="absolute -top-2 -right-2 bg-slate-700 text-white p-1.5 rounded-full border-2 border-slate-800 z-20 shadow-lg">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* --- NODE --- */}
                                                <LearningNode
                                                    lesson={lessonData}
                                                    isLast={isLastInWeek && weekIndex === weeks.length - 1}
                                                    position={position}
                                                    nextPosition={nextPosition}
                                                />
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {weeks.length === 0 && (
                        <div className="text-center py-10 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 mx-4 transition-colors">
                            <p className="text-slate-400 dark:text-slate-500 font-medium text-sm md:text-base">Belum ada peta belajar yang tersedia.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* === 3. SIDEBAR KANAN (PC/Tablet Only) === */}
            <aside className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 hidden xl:flex flex-col p-6 shadow-sm z-30 shrink-0 overflow-y-auto transition-colors">
                <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-6 text-lg transition-colors">Status Pemain</h3>

                <div className="bg-gradient-to-br from-orange-400 to-red-500 dark:from-orange-500 dark:to-red-600 rounded-2xl p-5 text-white shadow-lg shadow-orange-200 dark:shadow-none mb-4 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition">
                        <FaStar size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1 opacity-90 text-sm font-medium">
                            <FaStar /> Total Bintang
                        </div>
                        <div className="text-4xl font-black">{gamification?.stars || 0}</div>
                        <div className="text-xs opacity-75 mt-2 bg-white/20 inline-block px-2 py-1 rounded">Terus kumpulkan!</div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-cyan-600 dark:to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-200 dark:shadow-none mb-6 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition">
                        <FaTrophy size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1 opacity-90 text-sm font-medium">
                            <FaTrophy /> Experience (XP)
                        </div>
                        <div className="text-4xl font-black">{gamification?.xp || 0}</div>
                        <div className="text-xs opacity-75 mt-2 bg-white/20 inline-block px-2 py-1 rounded">Rank: {gamification?.rank || 'Novice'}</div>
                    </div>
                </div>

                <div className="border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-5 transition-colors">
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2 text-sm transition-colors">
                        <FaMedal className="text-purple-500 dark:text-purple-400"/> Misi Harian
                    </h4>
                    <div className="space-y-3">
                        <div className={`flex items-center gap-3 text-xs md:text-sm transition-colors ${gamification?.quests?.login ? 'text-slate-600 dark:text-slate-300 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] transition-all duration-300 ${gamification?.quests?.login ? 'border-green-400 dark:border-green-500 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'border-slate-300 dark:border-slate-600'}`}>
                                {gamification?.quests?.login ? '✓' : ''}
                            </div>
                            Login Hari Ini
                        </div>
                        <div className={`flex items-center gap-3 text-xs md:text-sm transition-colors ${gamification?.quests?.lesson ? 'text-slate-600 dark:text-slate-300 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] transition-all duration-300 ${gamification?.quests?.lesson ? 'border-green-400 dark:border-green-500 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'border-slate-300 dark:border-slate-600'}`}>
                                {gamification?.quests?.lesson ? '✓' : ''}
                            </div>
                            Selesaikan 1 Level
                        </div>
                    </div>
                </div>
            </aside>

            {/* === 4. BOTTOM NAVIGATION (Mobile Only) === */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-40 px-6 py-3 flex justify-around items-center pb-safe transition-colors">
                <div className="flex flex-col items-center gap-1 text-blue-600 dark:text-cyan-500 cursor-default transition-colors">
                    <FaMapMarkedAlt size={20} />
                    <span className="text-[10px] font-bold">Peta</span>
                </div>
                <Link href={route('leaderboard')} className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                    <FaTrophy size={20} />
                    <span className="text-[10px] font-bold">Peringkat</span>
                </Link>
                <Link href={route('logout')} method="post" as="button" className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                    <FaSignOutAlt size={20} />
                    <span className="text-[10px] font-bold">Keluar</span>
                </Link>
            </div>

            <TeacherAssistant
                user={auth.user}
                currentLessonTitle={course ? course.title : "Peta Belajar"}
                className="bottom-20 md:bottom-6"
            />

            <StageAIModal
                isOpen={aiModalConfig.isOpen}
                onClose={closeStageAI}
                stageTitle={aiModalConfig.stageTitle}
                mascotSrc={aiModalConfig.mascotSrc}
                user={auth.user}
            />

            {/* === CSS TAMBAHAN (Scrollbar & Animasi Maskot) === */}
            <style>{`
                /* --- Custom Scrollbar --- */
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

                /* --- 1. ANIMASI MELAYANG (anim-float) --- */
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                    100% { transform: translateY(0px); }
                }
                .anim-float {
                    animation: float 3.5s ease-in-out infinite;
                }

                /* --- 2. ANIMASI BERNAPAS (anim-breathe) --- */
                @keyframes breathe {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                .anim-breathe {
                    animation: breathe 2.5s ease-in-out infinite;
                }

                /* --- 3. ANIMASI GOYANG (anim-wiggle) --- */
                @keyframes wiggle {
                    0%, 100% { transform: rotate(-3deg); }
                    50% { transform: rotate(3deg); }
                }
                .anim-wiggle {
                    animation: wiggle 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
