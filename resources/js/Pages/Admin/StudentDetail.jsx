import React, { useState, useEffect, useMemo } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    FaArrowLeft,
    FaCheckCircle,
    FaClock,
    FaUserAstronaut,
    FaRobot,
    FaRedo,
    FaHourglassHalf,
    FaChartPie,
    FaBolt,
    FaDatabase,
    FaSun,
    FaMoon,
    FaEye,
    FaTimes,
    FaTimesCircle
} from "react-icons/fa";
import Chart from "react-apexcharts";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentDetail({ student, history, charts, analysis }) {
    const { props } = usePage();
    const flash = props.flash || {};

    // --- STATE UNTUK MODAL DETAIL JAWABAN ---
    const [detailModal, setDetailModal] = useState(null);

    // --- 1. DATA SANITIZATION (PEMBERSIHAN DATA) ---
    const sanitizedCharts = useMemo(() => {
        const safe = charts || {};
        const toZero = (val) => (val === null || val === undefined || isNaN(val) ? 0 : Number(val));
        const toString = (val) => (val === null || val === undefined ? "" : String(val));

        return {
            radar: {
                categories: (safe.radar?.categories || []).map(toString),
                series: (safe.radar?.series || []).map(toZero)
            },
            performance: {
                labels: (safe.performance?.labels || []).map(toString),
                scores: (safe.performance?.scores || []).map(toZero),
                attempts: (safe.performance?.attempts || []).map(toZero)
            },
            heatmap: (safe.heatmap || []).map(day => ({
                name: toString(day.name),
                data: (day.data || []).map(point => ({
                    x: toString(point.x),
                    y: toZero(point.y)
                }))
            }))
        };
    }, [charts]);

    // --- 2. DATA CHECK ---
    const hasRadarData = sanitizedCharts.radar.series.length > 0;
    const hasPerformanceData = sanitizedCharts.performance.labels.length > 0;
    const hasHeatmapData = sanitizedCharts.heatmap.length > 0;

    // --- 3. THEME LOGIC ---
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') !== 'light';
        }
        return true;
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

    // --- 4. CHART OPTIONS ---
    const safeFormatter = (val) => {
        if (val === null || val === undefined) return "";
        if (typeof val === 'number') return val.toFixed(0);
        return String(val);
    };

    const baseChartOptions = {
        chart: {
            background: 'transparent',
            toolbar: { show: false },
            foreColor: isDarkMode ? '#94a3b8' : '#475569'
        },
        theme: { mode: isDarkMode ? 'dark' : 'light' },
        grid: { borderColor: isDarkMode ? '#334155' : '#e2e8f0', strokeDashArray: 4 },
        dataLabels: { enabled: false },
        tooltip: { theme: isDarkMode ? 'dark' : 'light', style: { fontSize: '12px' } },
        yaxis: { labels: { formatter: safeFormatter } },
        xaxis: { labels: { formatter: safeFormatter } }
    };

    return (
        <div className={`min-h-screen font-sans p-4 md:p-8 transition-colors duration-300
            dark:bg-slate-950 dark:text-slate-200 dark:bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] dark:from-slate-900 dark:via-slate-950 dark:to-black dark:selection:bg-cyan-500 dark:selection:text-black
            bg-slate-50 text-slate-800`}>

            <Head title={`Operative: ${student.name}`} />

            {/* === TOP BAR === */}
            <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center border-b pb-4 transition-colors dark:border-slate-800 border-slate-200">
                <Link
                    href={route("admin.dashboard")}
                    className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition dark:text-slate-500 dark:hover:text-cyan-400 text-slate-500 hover:text-blue-600"
                >
                    <FaArrowLeft className="group-hover:-translate-x-1 transition" /> Return to Base
                </Link>

                <div className="flex items-center gap-4">
                    <div className="text-xs font-mono dark:text-slate-600 text-slate-400">
                        ID: {student.id.toString().padStart(6, '0')}
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full transition-all duration-300 dark:bg-slate-800 dark:text-yellow-400 dark:hover:bg-slate-700 bg-white text-slate-600 hover:bg-slate-200 border border-slate-200 dark:border-transparent shadow-sm"
                        title="Switch Theme"
                    >
                        {isDarkMode ? <FaSun /> : <FaMoon />}
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT COLUMN */}
                <div className="lg:col-span-4 space-y-6">
                    {/* PLAYER CARD */}
                    <div className="rounded-2xl p-6 relative overflow-hidden shadow-2xl border transition-colors dark:bg-slate-900/50 dark:backdrop-blur-md dark:border-slate-700/50 bg-white border-slate-200">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-2xl border-2 flex items-center justify-center mb-4 shadow-lg transition-colors dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 dark:border-cyan-500/50 bg-gradient-to-br from-blue-50 to-white border-blue-200">
                                <FaUserAstronaut size={40} className="dark:text-cyan-400 text-blue-600" />
                            </div>
                            <h1 className="text-2xl font-black uppercase tracking-tight dark:text-white text-slate-800">{student.name}</h1>
                            <p className="font-mono text-sm mb-6 dark:text-cyan-500/80 text-slate-500">{student.email}</p>
                            <div className="grid grid-cols-2 gap-3 w-full">
                                <div className="p-3 rounded-lg border transition-colors dark:bg-slate-800/80 dark:border-slate-700 bg-slate-50 border-slate-100">
                                    <div className="text-[10px] uppercase tracking-widest dark:text-slate-400 text-slate-500">Experience</div>
                                    <div className="text-xl font-black dark:text-fuchsia-400 text-purple-600">{student.xp} XP</div>
                                </div>
                                <div className="p-3 rounded-lg border transition-colors dark:bg-slate-800/80 dark:border-slate-700 bg-slate-50 border-slate-100">
                                    <div className="text-[10px] uppercase tracking-widest dark:text-slate-400 text-slate-500">Reputation</div>
                                    <div className="text-xl font-black text-yellow-400 flex items-center justify-center gap-1">
                                        {student.stars} <span className="text-xs">★</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RADAR CHART */}
                    <div className="rounded-2xl p-4 shadow-xl relative group border transition-colors dark:bg-slate-900/50 dark:backdrop-blur-md dark:border-slate-700/50 bg-white border-slate-200">
                        <h3 className="font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2 dark:text-slate-200 text-slate-700">
                            <FaChartPie className="dark:text-cyan-400 text-blue-500" /> Skill Competency
                        </h3>
                        <div className="flex items-center justify-center -ml-4">
                            {hasRadarData ? (
                                <Chart
                                    options={{
                                        ...baseChartOptions,
                                        chart: { type: 'radar', toolbar: { show: false }, background: 'transparent' },
                                        xaxis: {
                                            categories: sanitizedCharts.radar.categories,
                                            labels: {
                                                style: { colors: isDarkMode ? '#94a3b8' : '#475569', fontSize: '10px', fontFamily: 'monospace' },
                                                formatter: safeFormatter
                                            }
                                        },
                                        yaxis: { show: false, max: 100, min: 0 },
                                        plotOptions: {
                                            radar: {
                                                size: 90,
                                                polygons: {
                                                    strokeColors: isDarkMode ? '#334155' : '#e2e8f0',
                                                    connectorColors: isDarkMode ? '#334155' : '#e2e8f0',
                                                    fill: { colors: ['transparent', 'transparent'] }
                                                }
                                            }
                                        },
                                        fill: { opacity: 0.2, colors: isDarkMode ? ['#06b6d4'] : ['#3b82f6'] },
                                        stroke: { show: true, width: 2, colors: isDarkMode ? ['#22d3ee'] : ['#2563eb'], dashArray: 0 },
                                        markers: { size: 3, colors: ['#fff'], strokeColors: isDarkMode ? '#06b6d4' : '#3b82f6', strokeWidth: 2 }
                                    }}
                                    series={[{ name: 'Mastery', data: sanitizedCharts.radar.series }]}
                                    type="radar"
                                    height={280}
                                />
                            ) : (
                                <div className="h-60 flex items-center justify-center text-xs italic font-mono border border-dashed rounded w-full dark:text-slate-600 dark:border-slate-800 text-slate-400 border-slate-200">
                                    NO SKILL DATA AVAILABLE
                                </div>
                            )}
                        </div>
                    </div>

                    {/* HEATMAP */}
                    <div className="rounded-2xl p-4 shadow-xl border transition-colors dark:bg-slate-900/50 dark:backdrop-blur-md dark:border-slate-700/50 bg-white border-slate-200">
                        <h3 className="font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2 dark:text-slate-200 text-slate-700">
                            <FaClock className="dark:text-blue-400 text-blue-600" /> Activity Heatmap
                        </h3>
                        {hasHeatmapData ? (
                            <Chart
                                options={{
                                    ...baseChartOptions,
                                    chart: { type: 'heatmap', toolbar: { show: false } },
                                    plotOptions: {
                                        heatmap: {
                                            radius: 2,
                                            enableShades: false,
                                            colorScale: {
                                                ranges: isDarkMode ? [
                                                    { from: 0, to: 0, color: '#1e293b', name: 'None' },
                                                    { from: 1, to: 10, color: '#1e3a8a', name: 'Low' },
                                                    { from: 11, to: 100, color: '#3b82f6', name: 'High' }
                                                ] : [
                                                    { from: 0, to: 0, color: '#f1f5f9', name: 'None' },
                                                    { from: 1, to: 10, color: '#93c5fd', name: 'Low' },
                                                    { from: 11, to: 100, color: '#2563eb', name: 'High' }
                                                ]
                                            }
                                        }
                                    },
                                    stroke: { width: 1, colors: isDarkMode ? ['#0f172a'] : ['#fff'] },
                                    xaxis: { labels: { style: { fontSize: '9px', fontFamily: 'monospace' }, formatter: safeFormatter } },
                                    yaxis: { labels: { formatter: safeFormatter } }
                                }}
                                series={sanitizedCharts.heatmap}
                                type="heatmap"
                                height={200}
                            />
                        ) : (
                            <div className="h-40 flex items-center justify-center text-xs italic font-mono border border-dashed rounded dark:text-slate-600 dark:border-slate-800 text-slate-400 border-slate-200">
                                SYSTEM OFFLINE
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-8 space-y-6">
                    {/* AI ADVISOR */}
                    <div className="rounded-2xl overflow-hidden relative border shadow-lg transition-colors dark:bg-slate-900/80 dark:backdrop-blur dark:border-purple-500/30 dark:shadow-[0_0_20px_rgba(168,85,247,0.1)] bg-white border-purple-200">
                        <div className="p-4 border-b flex justify-between items-center dark:bg-purple-900/20 dark:border-purple-500/20 bg-purple-50 border-purple-100">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                                <h3 className="font-bold uppercase tracking-widest text-xs flex items-center gap-2 dark:text-purple-200 text-purple-700">
                                    <FaRobot /> AI Tactical Advisor
                                </h3>
                            </div>
                            <Link href={route('admin.student_refresh_ai', student.id)} method="post" as="button" className="dark:text-purple-400 dark:hover:text-white text-purple-400 hover:text-purple-700 transition" title="Re-scan">
                                <FaRedo size={12} />
                            </Link>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1 space-y-4">
                                <div className="rounded-xl p-4 border transition-colors dark:bg-slate-800/50 dark:border-slate-700 bg-slate-50 border-slate-200">
                                    <div className="text-[10px] uppercase mb-1 dark:text-slate-400 text-slate-500">Target Focus</div>
                                    <div className="font-bold leading-tight dark:text-white text-slate-800">{analysis?.topic || 'Analyzing...'}</div>
                                </div>
                                <div className="rounded-xl p-4 border flex items-center justify-between transition-colors dark:bg-slate-800/50 dark:border-slate-700 bg-slate-50 border-slate-200">
                                    <div className="text-[10px] uppercase dark:text-slate-400 text-slate-500">Avg. Score</div>
                                    <div className="text-2xl font-black dark:text-cyan-400 text-blue-600">{analysis?.score ?? 0}</div>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                {/* Error Display */}
                                {props.errors?.ai_error && (
                                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-xs rounded">
                                        <strong>Error:</strong> {props.errors.ai_error}
                                    </div>
                                )}

                                {flash?.ai_report || student.ai_report ? (
                                    <div className="prose prose-sm max-w-none text-xs font-mono leading-relaxed dark:prose-invert dark:text-slate-300 text-slate-600 custom-scrollbar max-h-48 overflow-y-auto">
                                        <ReactMarkdown>{flash?.ai_report || student.ai_report}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-xl dark:border-slate-700 border-slate-300">
                                        <p className="text-xs mb-3 dark:text-slate-500 text-slate-400">No tactical data found.</p>
                                        <Link href={route('admin.student_analyze', student.id)} method="post" as="button" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded text-xs font-bold transition shadow-lg">
                                            RUN ANALYSIS
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* PERFORMANCE CHART */}
                    <div className="rounded-2xl p-6 shadow-xl border transition-colors dark:bg-slate-900/50 dark:backdrop-blur-md dark:border-slate-700/50 bg-white border-slate-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold uppercase tracking-wider text-xs flex items-center gap-2 dark:text-slate-200 text-slate-700">
                                <FaBolt className="dark:text-yellow-400 text-orange-500" /> Combat Performance
                            </h3>
                            <div className="flex gap-4 text-[10px] font-mono dark:text-slate-400 text-slate-500">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Score</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Attempts</span>
                            </div>
                        </div>
                        {hasPerformanceData ? (
                            <Chart
                                options={{
                                    ...baseChartOptions,
                                    chart: { type: 'line', toolbar: { show: false }, background: 'transparent' },
                                    stroke: { width: [0, 3], curve: 'smooth' },
                                    xaxis: {
                                        categories: sanitizedCharts.performance.labels,
                                        labels: {
                                            style: { colors: isDarkMode ? '#64748b' : '#64748b', fontSize: '10px' },
                                            formatter: safeFormatter
                                        }
                                    },
                                    yaxis: [
                                        {
                                            title: { text: 'Score', style: { color: '#3b82f6' } },
                                            min: 0, max: 100,
                                            labels: { formatter: safeFormatter }
                                        },
                                        {
                                            opposite: true,
                                            title: { text: 'Tries', style: { color: '#f97316' } },
                                            labels: { formatter: safeFormatter }
                                        }
                                    ],
                                    colors: ['#3b82f6', '#f97316'],
                                    plotOptions: { bar: { columnWidth: '30%', borderRadius: 2 } },
                                    legend: { show: false }
                                }}
                                series={[
                                    { name: 'Final Score', type: 'column', data: sanitizedCharts.performance.scores },
                                    { name: 'Attempts', type: 'line', data: sanitizedCharts.performance.attempts }
                                ]}
                                type="line"
                                height={250}
                            />
                        ) : (
                            <div className="h-60 flex items-center justify-center text-xs italic font-mono border border-dashed rounded dark:text-slate-600 dark:border-slate-800 text-slate-400 border-slate-200">
                                NO PERFORMANCE DATA
                            </div>
                        )}
                    </div>

                    {/* MISSION LOG TINGKAT LANJUT (SCROLLABLE & DENGAN WAKTU) */}
                    <div className="rounded-2xl overflow-hidden shadow-xl border transition-colors dark:bg-slate-900/50 dark:backdrop-blur-md dark:border-slate-700/50 bg-white border-slate-200">
                        <div className="p-4 flex items-center justify-between border-b dark:border-slate-800 border-slate-100">
                            <h3 className="font-bold uppercase tracking-wider text-xs flex items-center gap-2 dark:text-slate-200 text-slate-700">
                                <FaDatabase className="dark:text-emerald-400 text-emerald-600" /> Mission Log
                            </h3>
                            <span className="text-[10px] px-2 py-1 rounded font-mono dark:bg-slate-800 dark:text-slate-400 bg-slate-100 text-slate-500">
                                Total: {history.length}
                            </span>
                        </div>

                        {/* BAGIAN TABEL YANG DIBUAT BISA DI-SCROLL */}
                        <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse relative">
                                {/* Header Sticky agar tetap terlihat saat di-scroll */}
                                <thead className="sticky top-0 z-10 dark:bg-slate-800/90 bg-slate-50/90 backdrop-blur-sm shadow-sm">
                                    <tr className="text-[10px] uppercase tracking-widest font-bold dark:text-slate-400 text-slate-500">
                                        <th className="p-4">Mission / Quest</th>
                                        <th className="p-4 text-center">Score</th>
                                        <th className="p-4 text-center">Time</th>
                                        <th className="p-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="dark:divide-slate-800/50 divide-slate-100">
                                    {history.length > 0 ? history.map((item) => {
                                        // Pastikan 'details' berbentuk array
                                        let parsedDetails = [];
                                        try {
                                            parsedDetails = typeof item.details === 'string' ? JSON.parse(item.details) : (item.details || []);
                                        } catch (e) {
                                            parsedDetails = [];
                                        }

                                        return (
                                            <tr key={item.id} className="transition group dark:hover:bg-cyan-500/5 hover:bg-blue-50">
                                                <td className="p-4">
                                                    <div className="font-bold text-sm transition dark:text-slate-300 dark:group-hover:text-cyan-400 text-slate-700 group-hover:text-blue-600">
                                                        {item.lesson_title}
                                                    </div>
                                                    <div className="text-[10px] font-mono dark:text-slate-500 text-slate-400 mt-0.5">Date: {item.completed_at_formatted || '-'}</div>
                                                </td>

                                                <td className="p-4 text-center">
                                                    {item.status === 'completed' ? (
                                                        <span className={`inline-block w-10 py-1.5 rounded text-xs font-bold font-mono border ${(item.score ?? 0) >= 75 ? 'dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 bg-green-100 text-green-700 border-green-200' : 'dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30 bg-red-100 text-red-700 border-red-200'}`}>
                                                            {item.score ?? 0}
                                                        </span>
                                                    ) : <FaHourglassHalf className="dark:text-slate-600 text-slate-400 mx-auto" title="Pending" />}
                                                </td>

                                                {/* Kolom Waktu (Duration) Dikembalikan */}
                                                <td className="p-4 text-center">
                                                    <div className="text-[11px] font-mono font-medium dark:text-slate-400 text-slate-600 bg-slate-100 dark:bg-slate-800/50 inline-block px-2 py-1 rounded">
                                                        {item.status === 'completed' ? `${item.duration}` : '-'}
                                                    </div>
                                                </td>

                                                <td className="p-4 text-center">
                                                    {/* TOMBOL LIHAT DETAIL */}
                                                    {parsedDetails.length > 0 ? (
                                                        <button
                                                            onClick={() => setDetailModal({ ...item, details: parsedDetails })}
                                                            className="px-3 py-1.5 rounded bg-blue-100 text-blue-700 dark:bg-cyan-900/40 dark:text-cyan-400 hover:bg-blue-200 transition text-xs font-bold flex items-center justify-center gap-2 mx-auto whitespace-nowrap"
                                                        >
                                                            <FaEye /> Cek Jawaban
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] italic dark:text-slate-600 text-slate-400">No Detail</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr><td colSpan="4" className="p-8 text-center text-xs font-mono dark:text-slate-600 text-slate-400">No logs found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* === MODAL REKAP JAWABAN BENAR/SALAH === */}
            <AnimatePresence>
                {detailModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header Modal */}
                            <div className="p-5 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-lg font-black dark:text-white text-slate-800">Detail Evaluasi</h2>
                                    <p className="text-sm dark:text-cyan-400 text-blue-600 font-medium">{detailModal.lesson_title}</p>
                                </div>
                                <button onClick={() => setDetailModal(null)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition">
                                    <FaTimes size={18} />
                                </button>
                            </div>

                            {/* Rekap Skor Atas */}
                            <div className="p-5 flex gap-4 shrink-0 bg-white dark:bg-slate-900">
                                <div className="flex-1 bg-green-50 dark:bg-emerald-900/20 border border-green-200 dark:border-emerald-800/50 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-black text-green-600 dark:text-emerald-400 mb-1">
                                        {detailModal.details.filter(d => d.is_correct).length}
                                    </div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-emerald-500">Benar</div>
                                </div>
                                <div className="flex-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-black text-red-600 dark:text-red-400 mb-1">
                                        {detailModal.details.filter(d => !d.is_correct).length}
                                    </div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-500">Salah</div>
                                </div>
                                <div className="flex-1 bg-blue-50 dark:bg-cyan-900/20 border border-blue-200 dark:border-cyan-800/50 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-black text-blue-600 dark:text-cyan-400 mb-1">
                                        {detailModal.score ?? 0}
                                    </div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-cyan-500">Skor</div>
                                </div>
                            </div>

                            {/* List Soal (Bisa Di-scroll) */}
                            <div className="p-5 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="space-y-4">
                                    {detailModal.details.map((soal, index) => (
                                        <div key={index} className={`p-4 rounded-xl border-l-4 shadow-sm bg-white dark:bg-slate-800 border ${soal.is_correct ? 'border-l-green-500 dark:border-l-emerald-500 border-slate-200 dark:border-slate-700' : 'border-l-red-500 dark:border-l-red-500 border-slate-200 dark:border-slate-700'}`}>
                                            <div className="flex gap-3">
                                                <div className="shrink-0 mt-1">
                                                    {soal.is_correct
                                                        ? <FaCheckCircle className="text-green-500 dark:text-emerald-400 text-xl" />
                                                        : <FaTimesCircle className="text-red-500 dark:text-red-400 text-xl" />
                                                    }
                                                </div>
                                                <div className="w-full">
                                                    <p className="font-medium text-sm md:text-base dark:text-slate-200 text-slate-700 mb-3 leading-relaxed">
                                                        <span className="font-black mr-1">{index + 1}.</span> {soal.question}
                                                    </p>
                                                    <div className="text-xs dark:text-slate-400 text-slate-500 bg-slate-50 dark:bg-slate-900/80 p-3 rounded-lg border border-slate-100 dark:border-slate-700 w-full">
                                                        <div className="mb-1 uppercase tracking-wider text-[10px] font-bold text-slate-400">Pilihan Siswa:</div>
                                                        <span className={`font-medium ${soal.is_correct ? 'text-green-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                            {soal.selected_option}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    );
}
