import React from 'react';
import { Link } from '@inertiajs/react';
import { FaLock, FaPlay, FaCheck, FaClipboardList, FaTrophy } from 'react-icons/fa';

export default function LearningNode({ lesson, isLast, position = 'center', nextPosition = 'center' }) {
    let status = lesson.status_user || 'locked';

    // 🔥 FITUR SAKELAR RAHASIA DARI CPANEL (Pakai == agar kebal tipe data) 🔥
    if (lesson.xp_reward == 0) {
        status = 'locked';
    }

    const isCompleted = status === 'completed';
    // PERBAIKAN: Tambahkan status 'started' agar materi yang sedang dikerjakan tidak tergembok lagi
    const isUnlocked = status === 'unlocked' || status === 'started';
    const isActive = isUnlocked;

    // --- 2. DETEKSI PRE-TEST & POST-TEST ---
    const isPreTest = lesson.title.toLowerCase().includes('pre-test') || lesson.title.toLowerCase().includes('pretest');
    const isPostTest = lesson.title.toLowerCase().includes('post-test') || lesson.title.toLowerCase().includes('posttest');
    const isExam = isPreTest || isPostTest;

    // --- 3. LOGIKA POSISI ---
    const getX = (pos) => {
        if (pos === 'left') return 25;
        if (pos === 'right') return 75;
        return 50;
    };
    const currentX = getX(position);
    const nextX = getX(nextPosition);

    // --- 4. LOGIKA WARNA & STYLE ---
    let btnClass = "bg-white dark:bg-slate-800 border-[3px] md:border-4 border-slate-200 dark:border-slate-700 shadow-sm";
    let iconClass = "text-slate-300 dark:text-slate-600 text-lg md:text-xl";
    let Icon = FaLock;
    let strokeClass = "text-slate-200 dark:text-slate-700";
    let lineStyle = "stroke-dashed";

    // Ubah ikon default jika ini adalah ujian
    if (isPreTest) Icon = FaClipboardList;
    if (isPostTest) Icon = FaTrophy;

    if (isCompleted) {
        btnClass = "bg-gradient-to-b from-green-400 to-green-600 border-[3px] md:border-4 border-green-200 dark:border-green-800 shadow-xl shadow-green-200/50 scale-110 z-10";
        iconClass = "text-white drop-shadow-md text-xl md:text-2xl";
        Icon = FaCheck;
        strokeClass = "text-green-400 dark:text-green-600";
        lineStyle = "";
    } else if (isUnlocked) {
        // Gaya visual SPESIAL untuk ujian (Warna Ungu)
        if (isExam) {
            btnClass = "bg-gradient-to-b from-purple-500 to-indigo-600 border-[3px] md:border-4 border-purple-300 dark:border-purple-800 shadow-xl shadow-purple-300/50 scale-125 z-10 animate-pulse";
            iconClass = "text-white drop-shadow-md text-xl md:text-2xl";
            strokeClass = "text-slate-200 dark:text-slate-700";
        } else {
            // Gaya visual normal untuk materi biasa (Warna Biru)
            btnClass = "bg-gradient-to-b from-blue-400 to-blue-600 border-[3px] md:border-4 border-blue-200 dark:border-blue-800 shadow-xl shadow-blue-200/50 scale-110 z-10 animate-bounce-slow";
            iconClass = "text-white drop-shadow-md text-lg md:text-xl pl-1";
            Icon = FaPlay;
            strokeClass = "text-slate-200 dark:text-slate-700";
        }
    }

    const linkHref = status !== 'locked' ? route('learning.show', lesson.slug) : '#';

    return (
        <div className="relative w-full h-28 md:h-36 flex justify-center">

            {/* === KABEL SVG === */}
            {!isLast && (
                <svg
                    className={`absolute top-8 md:top-10 left-0 w-full h-28 md:h-36 -z-10 pointer-events-none transition-colors duration-300 ${strokeClass}`}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    <path
                        d={`M ${currentX} 15 C ${currentX} 60, ${nextX} 40, ${nextX} 100`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        className={`transition-all duration-1000 ${lineStyle === 'stroke-dashed' ? 'opacity-50 dark:opacity-40' : 'opacity-100'}`}
                        strokeDasharray={lineStyle === 'stroke-dashed' ? "4,4" : "none"}
                    />
                    {isActive && (
                        <circle r="1.5" fill={isExam ? "#c084fc" : "#60a5fa"}>
                            <animateMotion
                                dur="1.5s"
                                repeatCount="indefinite"
                                path={`M ${currentX} 15 C ${currentX} 60, ${nextX} 40, ${nextX} 100`}
                            />
                        </circle>
                    )}
                </svg>
            )}

            {/* === TOMBOL NODE === */}
            <div
                className="absolute top-0 transition-all duration-500 z-10"
                style={{ left: `${currentX}%`, transform: 'translateX(-50%)' }}
            >
                <div className="relative group flex flex-col items-center">
                    <Link
                        href={linkHref}
                        className={`
                            w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center
                            transition-all duration-300 ease-in-out relative
                            ${btnClass}
                            ${status === 'locked' ? 'cursor-not-allowed opacity-80 hover:bg-slate-50 dark:hover:bg-slate-800' : 'hover:scale-110 cursor-pointer'}
                        `}
                    >
                        <Icon className={`${iconClass} transition-transform duration-300 ${isActive && isExam ? 'animate-wiggle' : 'group-hover:rotate-12'}`} />
                        <div className="absolute top-1 right-2 md:top-2 md:right-4 w-2 h-2 md:w-3 md:h-3 bg-white opacity-30 rounded-full blur-[2px]"></div>
                    </Link>

                    {/* LABEL TEKS NODE */}
                    <div className="absolute top-full mt-2 md:mt-3 left-1/2 -translate-x-1/2 w-28 md:w-48 text-center pointer-events-none">
                        <div className={`text-[9px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl border shadow-sm inline-block transition-colors duration-300 leading-tight
                            ${isActive && isExam ? 'bg-purple-600 text-white border-purple-600' :
                              isActive ? 'bg-blue-600 text-white border-blue-600 dark:bg-cyan-600 dark:border-cyan-600' :
                              'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}
                        `}>
                            {lesson.title}
                        </div>
                    </div>

                    {/* BADGE (START / UJIAN) */}
                    {isActive && (
                        <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 z-20 animate-bounce">
                            <span className={`text-white text-[8px] md:text-[10px] font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded-md md:rounded-lg shadow-lg border-2 border-white dark:border-slate-800 uppercase tracking-wider ${isExam ? 'bg-red-500' : 'bg-orange-500'}`}>
                                {isExam ? 'UJIAN' : 'START'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
