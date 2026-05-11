import React, { useState, useEffect } from "react";
import TeacherSmartAssistant from "@/Components/TeacherSmartAssistant";
import { Head, Link, router } from "@inertiajs/react";
import {
    FaChalkboardTeacher,
    FaUserGraduate,
    FaSignOutAlt,
    FaKey,
    FaBook,
    FaGamepad,
    FaChartPie,
    FaBolt,
    FaSkull,
    FaTrophy,
    FaSun,
    FaMoon,
    FaClipboardCheck
} from "react-icons/fa";
import ApexChart from 'react-apexcharts';

export default function AdminDashboard({ auth, students, charts }) {
    // --- STATE DARK MODE ---
    // Cek local storage atau default ke true (Dark Mode)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'light' ? false : true;
        }
        return true;
    });

    // Effect untuk apply class 'dark' ke HTML tag
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

    const handleReset = (id, name) => {
        if (confirm(`RESET SKILL? \nUbah password player "${name}" kembali ke default "netlearn123"?`)) {
            router.post(route("admin.reset_password", id));
        }
    };

    // --- CHART OPTIONS DINAMIS ---
    const commonChartOptions = {
        chart: {
            background: 'transparent',
            toolbar: { show: false },
            foreColor: isDarkMode ? '#94a3b8' : '#475569' // Text color adaptive
        },
        theme: { mode: isDarkMode ? 'dark' : 'light' },
        grid: {
            borderColor: isDarkMode ? '#334155' : '#e2e8f0',
            strokeDashArray: 4
        },
        dataLabels: { enabled: false },
        tooltip: { theme: isDarkMode ? 'dark' : 'light' }
    };

    return (
        // Container Utama: Dark Mode pakai Gradient Hitam, Light Mode pakai Slate-50 polos
        <div className={`min-h-screen font-sans transition-colors duration-300
            dark:bg-slate-900 dark:text-slate-100 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-slate-800 dark:via-slate-900 dark:to-black
            bg-slate-50 text-slate-800`}>

            <Head title="Game Master Panel" />

            {/* === NAVBAR === */}
            <nav className="border-b transition-colors duration-300 sticky top-0 z-50 px-6 py-4
                dark:border-cyan-500/20 dark:bg-slate-900/80 dark:backdrop-blur-md
                border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">

                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg border transition-colors
                            dark:bg-cyan-500/10 dark:border-cyan-500/50
                            bg-blue-100 border-blue-200">
                            <FaGamepad className="dark:text-cyan-400 text-blue-600 text-xl" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r
                                dark:from-cyan-400 dark:to-blue-500
                                from-blue-600 to-indigo-600 uppercase">
                                NetLearn
                            </span>
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase
                                dark:text-slate-500 text-slate-400">
                                Game Master Admin
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* TOGGLE THEME BUTTON */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full transition-all duration-300
                            dark:bg-slate-800 dark:text-yellow-400 dark:hover:bg-slate-700
                            bg-slate-100 text-slate-600 hover:bg-slate-200"
                            title="Switch Theme"
                        >
                            {isDarkMode ? <FaSun /> : <FaMoon />}
                        </button>

                        <div className="h-8 w-px dark:bg-slate-700 bg-slate-300 mx-2"></div>

                        <Link
                            href={route('admin.content.index')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all
                            dark:border-fuchsia-500/30 dark:text-fuchsia-400 dark:hover:bg-fuchsia-500/10
                            border-purple-200 text-purple-600 hover:bg-purple-50"
                        >
                            <FaBook /> Quest Editor
                        </Link>

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <div className="text-xs text-slate-400">Logged in as</div>
                                <div className="font-bold text-sm dark:text-cyan-400 text-blue-600">{auth.user.name}</div>
                            </div>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="p-2 rounded-lg transition-all hover:scale-105 border
                                dark:bg-red-500/10 dark:border-red-500/50 dark:text-red-500 dark:hover:bg-red-500/20
                                bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
                            >
                                <FaSignOutAlt />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* === MAIN CONTENT === */}
            <main className="p-6 max-w-7xl mx-auto">

                {/* HEADLINE STATS */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-black mb-2 tracking-tight drop-shadow-sm dark:text-white text-slate-800">
                            Server Statistics
                        </h1>
                        <p className="flex items-center gap-2 dark:text-slate-400 text-slate-500 mb-5">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Real-time player monitoring system active.
                        </p>

                        {/* === TAMBAHAN: TOMBOL MENUJU REKAP UJIAN === */}
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={route('admin.exam.report', 30)} // 30 = ID node Pre-Test di database
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-all shadow-sm
                                    dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-400 dark:hover:bg-indigo-500/20
                                    bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                            >
                                <FaClipboardCheck /> Analisis Pre-Test
                            </Link>

                            <Link
                                href={route('admin.exam.report', 31)} // 31 = ID node Post-Test di database
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-all shadow-sm
                                    dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/20
                                    bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                            >
                                <FaClipboardCheck /> Analisis Post-Test
                            </Link>
                        </div>
                    </div>

                    {/* Total Player Card */}
                    <div className="p-4 rounded-2xl flex items-center gap-4 min-w-[200px] border backdrop-blur transition-colors
                        dark:bg-slate-800/50 dark:border-slate-700
                        bg-white border-slate-200 shadow-sm">
                        <div className="p-3 rounded-xl dark:bg-blue-500/20 dark:text-blue-400 bg-blue-100 text-blue-600">
                            <FaUserGraduate size={24} />
                        </div>
                        <div>
                            <div className="text-xs uppercase font-bold tracking-wider dark:text-slate-400 text-slate-500">Total Players</div>
                            <div className="text-3xl font-black dark:text-white text-slate-800">{students.length}</div>
                        </div>
                    </div>
                </div>

                {/* === CHART GRID === */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                    {/* PANEL 1: PLAYER ACTIVITY */}
                    <div className="p-6 rounded-2xl border shadow-xl relative overflow-hidden group transition-colors
                        dark:bg-slate-800/40 dark:backdrop-blur-sm dark:border-slate-700/50
                        bg-white border-slate-200">

                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                        <h3 className="font-bold mb-6 flex items-center gap-2 uppercase tracking-wider text-sm dark:text-slate-200 text-slate-700">
                            <FaBolt className="dark:text-cyan-400 text-blue-500" />
                            Activity Logs (7 Days)
                        </h3>
                        <ApexChart
                            options={{
                                ...commonChartOptions,
                                chart: { ...commonChartOptions.chart, type: 'area' },
                                colors: isDarkMode ? ['#06b6d4'] : ['#3b82f6'], // Cyan (Dark) vs Blue (Light)
                                stroke: { curve: 'smooth', width: 3 },
                                xaxis: { categories: charts.activity.map(d => d.date) },
                                fill: {
                                    type: 'gradient',
                                    gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.1, stops: [0, 100] }
                                }
                            }}
                            series={[{ name: 'XP Gained', data: charts.activity.map(d => d.count) }]}
                            type="area"
                            height={300}
                        />
                    </div>

                    {/* PANEL 2: QUEST COMPLETION */}
                    <div className="p-6 rounded-2xl border shadow-xl relative overflow-hidden transition-colors
                        dark:bg-slate-800/40 dark:backdrop-blur-sm dark:border-slate-700/50
                        bg-white border-slate-200">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-lime-500"></div>
                        <h3 className="font-bold mb-6 flex items-center gap-2 uppercase tracking-wider text-sm dark:text-slate-200 text-slate-700">
                            <FaTrophy className="dark:text-emerald-400 text-emerald-600" />
                            Quest Completion Rate
                        </h3>
                        <ApexChart
                            options={{
                                ...commonChartOptions,
                                chart: { ...commonChartOptions.chart, type: 'bar' },
                                colors: isDarkMode ? ['#10b981'] : ['#059669'], // Emerald Shades
                                plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '50%' } },
                                xaxis: { categories: charts.completion.map(d => d.title), labels: { show: false } },
                            }}
                            series={[{ name: 'Completed', data: charts.completion.map(d => d.count) }]}
                            type="bar"
                            height={300}
                        />
                    </div>

                    {/* PANEL 3: DIFFICULTY */}
                    <div className="lg:col-span-2 p-6 rounded-2xl border shadow-xl relative overflow-hidden transition-colors
                        dark:bg-slate-800/40 dark:backdrop-blur-sm dark:border-slate-700/50
                        bg-white border-slate-200">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold flex items-center gap-2 uppercase tracking-wider text-sm dark:text-slate-200 text-slate-700">
                                <FaSkull className="dark:text-orange-400 text-orange-500" />
                                Boss Fight Difficulty Analysis
                            </h3>
                            <span className="text-xs font-mono px-2 py-1 rounded border
                                dark:text-slate-500 dark:bg-slate-900 dark:border-slate-700
                                text-slate-500 bg-slate-100 border-slate-200">
                                METRIC: Avg. Retries
                            </span>
                        </div>
                        <ApexChart
                            options={{
                                ...commonChartOptions,
                                chart: { ...commonChartOptions.chart, type: 'bar' },
                                colors: ['#f97316'],
                                plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: '50%' } },
                                xaxis: { categories: charts.difficulty.map(d => d.title) },
                                dataLabels: { enabled: true, formatter: (val) => val + "x Try", style: { colors: [isDarkMode ? '#fff' : '#334155'] } }
                            }}
                            series={[{ name: 'Avg Retries', data: charts.difficulty.map(d => d.avg) }]}
                            type="bar"
                            height={350}
                        />
                    </div>
                </div>

                {/* === PLAYER ROSTER TABLE === */}
                <div className="rounded-2xl border overflow-hidden shadow-2xl transition-colors
                    dark:bg-slate-800/60 dark:backdrop-blur-md dark:border-slate-700
                    bg-white border-slate-200">

                    <div className="p-6 border-b flex justify-between items-center
                        dark:border-slate-700 border-slate-200">
                        <h3 className="font-bold text-lg flex items-center gap-2 dark:text-white text-slate-800">
                            <FaChartPie className="dark:text-fuchsia-400 text-purple-600" /> Player Roster
                        </h3>
                        <div className="text-xs dark:text-slate-400 text-slate-500 font-mono">
                            STATUS: ONLINE
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs uppercase tracking-widest font-bold
                                    dark:bg-slate-900/50 dark:text-slate-400
                                    bg-slate-50 text-slate-500">
                                    <th className="p-5">Player Name</th>
                                    <th className="p-5">Contact ID</th>
                                    <th className="p-5 text-center">XP Total</th>
                                    <th className="p-5 text-center">Quests Done</th>
                                    <th className="p-5 text-right">Status</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="dark:divide-slate-700/50 divide-slate-100">
                                {students.length > 0 ? (
                                    students.map((student) => (
                                        <tr key={student.id} className="transition duration-300 group
                                            dark:hover:bg-cyan-500/5 hover:bg-blue-50">
                                            <td className="p-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg border flex items-center justify-center transition-all
                                                        dark:bg-slate-700 dark:border-slate-600 dark:text-cyan-400 dark:group-hover:border-cyan-400
                                                        bg-blue-100 border-blue-200 text-blue-600 group-hover:border-blue-400">
                                                        <FaUserGraduate />
                                                    </div>
                                                    <Link
                                                        href={route("admin.student_detail", student.id)}
                                                        className="font-bold transition
                                                            dark:text-slate-200 dark:group-hover:text-cyan-400
                                                            text-slate-700 group-hover:text-blue-600"
                                                    >
                                                        {student.name}
                                                    </Link>
                                                </div>
                                            </td>
                                            <td className="p-5 font-mono text-sm dark:text-slate-500 text-slate-400">
                                                {student.email}
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className="px-3 py-1 rounded font-bold text-xs shadow-sm border
                                                    dark:bg-fuchsia-500/10 dark:text-fuchsia-400 dark:border-fuchsia-500/20
                                                    bg-purple-100 text-purple-600 border-purple-200">
                                                    {student.xp} XP
                                                </span>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className="font-mono font-bold text-lg dark:text-white text-slate-800">
                                                    {student.completed_lessons}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border
                                                    dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20
                                                    text-green-600 bg-green-100 border-green-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    Active
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <button
                                                    onClick={() => handleReset(student.id, student.name)}
                                                    className="px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ml-auto border border-transparent
                                                        dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-orange-500/20 dark:hover:text-orange-400
                                                        bg-slate-100 text-slate-500 hover:bg-orange-100 hover:text-orange-600"
                                                    title="Reset Password Skill"
                                                >
                                                    <FaKey /> Reset
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center italic dark:text-slate-500 text-slate-400">
                                            No players found in the server.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            <TeacherSmartAssistant
                students={students}
                charts={charts}
            />
        </div>
    );
}
