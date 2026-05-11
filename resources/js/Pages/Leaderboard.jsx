import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import TeacherAssistant from '@/Components/TeacherAssistant';
import { FaTrophy, FaMedal, FaArrowLeft, FaFire, FaMapMarkedAlt, FaSignOutAlt, FaMoon, FaSun } from 'react-icons/fa';

export default function Leaderboard({ leaderboard, my_stats, auth, course }) {
    // --- STATE TEMA DARK MODE ---
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        // Cek preferensi tema dari localStorage atau sistem
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

    // Pisahkan Top 3 dengan sisanya
    const topThree = leaderboard.slice(0, 3);
    const others = leaderboard.slice(3);

    // Logika dinamis untuk link kembali
    const backLink = course?.slug
        ? route('course.map', course.slug)
        : route('dashboard');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 pb-[8rem] md:pb-0 transition-colors duration-300">
            <Head title="Leaderboard" />

            {/* === HEADER & PODIUM === */}
            <div className="bg-net-blue dark:bg-slate-900 pb-20 md:pb-24 pt-6 md:pt-8 px-4 md:px-6 relative overflow-hidden transition-colors duration-300 border-b dark:border-slate-800">
                 <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="flex items-center justify-between text-white mb-6 md:mb-8">
                        <Link href={backLink} className="flex items-center gap-1 md:gap-2 text-sm md:text-base opacity-80 hover:opacity-100 transition">
                            <FaArrowLeft /> <span className="hidden sm:inline">Peta Belajar</span>
                        </Link>

                        <div className="flex items-center gap-3 md:gap-4">
                            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                                <FaTrophy className="text-yellow-400" /> <span className="hidden sm:inline">Papan Peringkat</span><span className="sm:hidden">Peringkat</span>
                            </h1>
                            {/* Tombol Toggle Theme */}
                            <button onClick={toggleTheme} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10">
                                {theme === 'light' ? <FaMoon size={14} /> : <FaSun size={14} />}
                            </button>
                        </div>
                    </div>

                    {/* PODIUM JUARA 1, 2, 3 */}
                    <div className="flex justify-center items-end gap-2 sm:gap-4 md:gap-8">
                        {/* JUARA 2 */}
                        {topThree[1] && (
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 md:border-4 border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold text-slate-500 dark:text-slate-300 mb-1 md:mb-2 shadow-lg relative transition-colors">
                                    <span className="absolute -top-2 md:-top-3 bg-slate-500 dark:bg-slate-600 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full transition-colors">#2</span>
                                    {topThree[1].name.charAt(0)}
                                </div>
                                <div className="text-center text-white px-1">
                                    <div className="font-bold text-[10px] sm:text-xs md:text-base truncate w-16 sm:w-20 md:w-auto">{topThree[1].name}</div>
                                    <div className="text-[9px] md:text-xs opacity-80">{topThree[1].xp} XP</div>
                                </div>
                                <div className="h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24 bg-slate-400/30 dark:bg-slate-700/50 rounded-t-lg mt-1 md:mt-2 backdrop-blur-sm transition-colors"></div>
                            </div>
                        )}

                        {/* JUARA 1 */}
                        {topThree[0] && (
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <FaMedal className="absolute -top-4 -right-1 md:-top-6 md:-right-2 text-yellow-300 text-2xl md:text-3xl animate-bounce z-10" />
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full border-2 md:border-4 border-yellow-400 dark:border-yellow-600 bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-1 md:mb-2 shadow-xl shadow-yellow-500/50 transition-colors">
                                        {topThree[0].name.charAt(0)}
                                    </div>
                                </div>
                                <div className="text-center text-white px-1">
                                    <div className="font-bold text-xs sm:text-sm md:text-lg truncate w-20 sm:w-24 md:w-auto">{topThree[0].name}</div>
                                    <div className="text-[10px] md:text-sm font-bold text-yellow-300">{topThree[0].xp} XP</div>
                                </div>
                                <div className="h-24 sm:h-28 md:h-32 w-20 sm:w-24 md:w-32 bg-yellow-500/30 dark:bg-yellow-700/30 border-t border-yellow-400/50 dark:border-yellow-600/50 rounded-t-lg mt-1 md:mt-2 backdrop-blur-sm transition-colors"></div>
                            </div>
                        )}

                        {/* JUARA 3 */}
                        {topThree[2] && (
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 md:border-4 border-orange-400 dark:border-orange-600 bg-orange-200 dark:bg-orange-900/40 flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1 md:mb-2 shadow-lg relative transition-colors">
                                    <span className="absolute -top-2 md:-top-3 bg-orange-600 dark:bg-orange-700 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full transition-colors">#3</span>
                                    {topThree[2].name.charAt(0)}
                                </div>
                                <div className="text-center text-white px-1">
                                    <div className="font-bold text-[10px] sm:text-xs md:text-base truncate w-16 sm:w-20 md:w-auto">{topThree[2].name}</div>
                                    <div className="text-[9px] md:text-xs opacity-80">{topThree[2].xp} XP</div>
                                </div>
                                <div className="h-12 sm:h-16 md:h-20 w-16 sm:w-20 md:w-24 bg-orange-500/30 dark:bg-orange-700/30 rounded-t-lg mt-1 md:mt-2 backdrop-blur-sm transition-colors"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* === LIST SISWA LAINNYA === */}
            <div className="max-w-3xl mx-auto px-4 -mt-6 md:-mt-10 relative z-20 pb-40 md:pb-32">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
                    <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex justify-between transition-colors">
                        <span>Peringkat</span>
                        <span>XP Perolehan</span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {others.map((user) => (
                            <div key={user.rank} className={`flex items-center justify-between p-3 md:p-4 ${user.is_me ? 'bg-blue-50 dark:bg-cyan-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'} transition-colors`}>
                                <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                                    <span className="text-slate-400 dark:text-slate-500 font-bold w-5 md:w-6 text-center text-xs md:text-base shrink-0">{user.rank}</span>
                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${user.avatar_color} text-white flex items-center justify-center font-bold shadow-sm shrink-0 text-sm md:text-base`}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className={`font-bold text-sm md:text-base truncate ${user.is_me ? 'text-net-blue dark:text-cyan-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {user.name} {user.is_me && <span className="text-xs font-normal ml-1 opacity-70">(Anda)</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 md:px-3 md:py-1 rounded-lg text-xs md:text-base shrink-0 ml-2 transition-colors">
                                    {user.xp} <span className="hidden sm:inline">XP</span>
                                </div>
                            </div>
                        ))}

                        {others.length === 0 && (
                            <div className="p-8 text-center text-sm text-slate-400 dark:text-slate-500">
                                Belum ada siswa lain di peringkat ini.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* === STICKY FOOTER (POSISI SAYA) === */}
            <div className="fixed bottom-[4.5rem] md:bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 md:p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-40 pb-safe md:pb-4 transition-colors duration-300">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                         <div className="bg-net-blue dark:bg-cyan-600 text-white w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center font-bold text-sm md:text-base shrink-0 transition-colors">
                            #{my_stats.rank}
                         </div>
                         <div className="min-w-0">
                             <div className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 uppercase font-bold">Posisi Anda</div>
                             <div className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base truncate max-w-[150px] sm:max-w-xs transition-colors">{my_stats.name}</div>
                         </div>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2 text-net-blue dark:text-cyan-500 font-bold text-sm md:text-base shrink-0 transition-colors">
                        <FaFire className="text-orange-500 dark:text-orange-400" /> {my_stats.xp} <span className="hidden sm:inline">XP</span>
                    </div>
                </div>
            </div>

            {/* === BOTTOM NAVIGATION (Mobile Only) === */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50 px-6 py-3 flex justify-around items-center pb-safe transition-colors duration-300">
                <Link href={backLink} className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-cyan-400 transition-colors">
                    <FaMapMarkedAlt size={20} />
                    <span className="text-[10px] font-bold">Peta</span>
                </Link>
                <div className="flex flex-col items-center gap-1 text-orange-500 dark:text-orange-400 cursor-default transition-colors">
                    <FaTrophy size={20} />
                    <span className="text-[10px] font-bold">Peringkat</span>
                </div>
                <Link href={route('logout')} method="post" as="button" className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                    <FaSignOutAlt size={20} />
                    <span className="text-[10px] font-bold">Keluar</span>
                </Link>
            </div>

            {/* === CHATBOT === */}
            <TeacherAssistant
                user={auth.user}
                className="bottom-[9rem] md:bottom-24"
            />
        </div>
    );
}
