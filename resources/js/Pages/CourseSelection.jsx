import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    FaNetworkWired, FaCode, FaUserAstronaut, FaSignOutAlt, FaArrowRight,
    FaPenNib, FaVideo, FaMicrochip, FaUserTie, FaBook, FaMoon, FaSun
} from 'react-icons/fa';

// 1. MAPPING ICON
const iconMap = {
    'FaNetworkWired': FaNetworkWired,
    'FaCode': FaCode,
    'FaPenNib': FaPenNib,
    'FaVideo': FaVideo,
    'FaMicrochip': FaMicrochip,
    'FaUserTie': FaUserTie,
    'FaBook': FaBook,
};

// 2. MAPPING WARNA
const themeMap = {
    'blue': 'from-blue-500 to-cyan-400 shadow-blue-200 dark:shadow-none',
    'purple': 'from-purple-500 to-pink-400 shadow-purple-200 dark:shadow-none',
    'green': 'from-emerald-500 to-teal-400 shadow-emerald-200 dark:shadow-none',
    'orange': 'from-orange-400 to-amber-400 shadow-orange-200 dark:shadow-none',
    'red': 'from-rose-500 to-red-400 shadow-rose-200 dark:shadow-none',
    'teal': 'from-teal-500 to-cyan-400 shadow-teal-200 dark:shadow-none',
};

export default function CourseSelection({ courses, user }) {
    // --- TEMA DARK MODE ---
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) return savedTheme === 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    return (
        <div className="min-h-screen font-sans relative overflow-x-hidden transition-colors duration-500 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
            <Head title="Pilih Materi" />

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-40 dark:opacity-10 pointer-events-none transition-opacity duration-500"
                style={{ backgroundImage: "radial-gradient(currentColor 1.5px, transparent 1.5px)", backgroundSize: "30px 30px", color: isDarkMode ? '#cbd5e1' : '#64748b' }}
            ></div>

            {/* === NAVBAR === */}
            <nav className="relative z-20 px-4 md:px-8 py-4 md:py-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="bg-gradient-to-tr from-blue-600 to-cyan-500 dark:from-cyan-500 dark:to-blue-600 p-2 rounded-lg md:rounded-xl shadow-md md:shadow-lg dark:shadow-cyan-900/30">
                        <FaUserAstronaut className="text-white text-base md:text-xl" />
                    </div>
                    <span className="text-lg md:text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-400">
                        NetLearn
                    </span>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                    <span className="hidden md:inline text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors">
                        Halo, <span className="text-slate-800 dark:text-white font-bold">{user.name}</span>
                    </span>

                    {/* Tombol Toggle Tema */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 md:p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:scale-110 transition-all text-slate-600 dark:text-yellow-400"
                    >
                        {isDarkMode ? <FaSun size={14} className="md:w-4 md:h-4" /> : <FaMoon size={14} className="md:w-4 md:h-4" />}
                    </button>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-xs md:text-sm font-bold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-red-100 dark:border-red-800/50 hover:border-red-200 dark:hover:border-red-700 transition-all flex items-center gap-1 md:gap-2"
                    >
                        <span className="hidden sm:inline">Keluar</span>
                        <FaSignOutAlt className="sm:hidden" size={14} />
                    </Link>
                </div>
            </nav>

            {/* === KONTEN UTAMA === */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-6 md:pt-10 pb-20">

                <div className="text-center mb-8 md:mb-16">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-2 md:mb-4 tracking-tight transition-colors">
                        Choose your world!
                    </h1>
                    <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto px-4 md:px-0 transition-colors">
                        Dunia mana yang ingin kamu jelajahi hari ini?
                    </p>
                </div>

                {/* GRID COURSE CARD */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                    {courses.map((course) => {
                        const IconComponent = iconMap[course.icon] || FaBook;
                        const themeClass = themeMap[course.theme] || themeMap['blue'];

                        return (
                            <Link
                                key={course.id}
                                href={route('course.map', course.slug)}
                                className="group relative bg-white dark:bg-slate-900/80 dark:backdrop-blur-md rounded-2xl md:rounded-3xl p-2 md:p-3 shadow-lg md:shadow-xl hover:shadow-2xl dark:shadow-none transition-all duration-300 md:hover:-translate-y-2 border border-slate-100 dark:border-slate-800 flex flex-col"
                            >
                                {/* Card Image / Icon Header */}
                                <div className={`h-36 md:h-48 rounded-xl md:rounded-2xl bg-gradient-to-br ${themeClass} flex items-center justify-center relative overflow-hidden shrink-0`}>
                                    {/* Hiasan Background */}
                                    <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:opacity-10"></div>
                                    <div className="absolute inset-0 bg-white/10 dark:bg-black/10 opacity-0 group-hover:opacity-20 transition"></div>

                                    {/* Icon */}
                                    <IconComponent className="text-white drop-shadow-md transform md:group-hover:scale-110 transition duration-500 relative z-10 text-5xl md:text-7xl" />

                                    {/* Progress Badge */}
                                    <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-black/30 dark:bg-black/50 backdrop-blur-md px-2 md:px-3 py-1 rounded-full text-white text-[10px] md:text-xs font-bold border border-white/20 dark:border-white/10 shadow-sm transition-colors">
                                        {course.progress}% Selesai
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-4 md:p-6 flex-1 flex flex-col">
                                    <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-1 md:mb-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                                        {course.title}
                                    </h3>

                                    <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mb-4 md:mb-6 line-clamp-2 leading-relaxed flex-1 transition-colors">
                                        {course.description || "Tidak ada deskripsi."}
                                    </p>

                                    {/* Progress Bar Kecil */}
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 md:h-2 rounded-full overflow-hidden mb-4 md:mb-6 transition-colors">
                                        <div
                                            className={`h-full bg-gradient-to-r ${themeClass}`}
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>

                                    {/* Tombol Action */}
                                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 md:pt-4 transition-colors">
                                        <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded transition-colors">
                                            {course.completed_lessons} / {course.total_lessons} STAGE
                                        </span>
                                        <span className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 md:group-hover:translate-x-1 transition-transform">
                                            Masuk <FaArrowRight className="text-[10px] md:text-[12px]" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

            </main>
        </div>
    );
}
