import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import * as XLSX from "xlsx";
import {
    FaArrowLeft,
    FaFileExcel,
    FaClipboardList,
    FaKey,
    FaLock,     // <-- Tambahkan FaLock
    FaUnlock
} from "react-icons/fa";

export default function ExamReport({ lessonId, isLocked, lessonTitle, totalQuestions, answerKeys, reportMatrix }) {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("theme") === "light" ? false : true;
        }
        return true;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [isDarkMode]);

    const questionHeaders = Array.from({ length: totalQuestions }, (_, i) => `Q${i + 1}`);

    // FUNGSI EKSPOR KE EXCEL (2 SHEET SEKALIGUS)
    const handleExportExcel = () => {
        // Sheet 1: Matrix 1 dan 0 (Untuk SPSS)
        const dataSPSS = reportMatrix.map((student) => {
            return {
                "Nama Siswa": student.name,
                ...student.binary_answers,
                "Total Benar": student.total_correct,
                "Skor Akhir": student.score,
            };
        });

        // Sheet 2: Huruf A/B/C/D/E (Untuk Lampiran / Guru)
        const dataHuruf = reportMatrix.map((student) => {
            let letters = {};
            questionHeaders.forEach(qKey => letters[qKey] = student.answers[qKey].letter);
            return {
                "Nama Siswa": student.name,
                ...letters,
                "Total Benar": student.total_correct,
                "Skor Akhir": student.score,
            };
        });

        // Menambahkan Baris Kunci Jawaban di Sheet Huruf
        dataHuruf.unshift({
            "Nama Siswa": "KUNCI JAWABAN",
            ...answerKeys,
            "Total Benar": totalQuestions,
            "Skor Akhir": 100,
        });

        const wsSPSS = XLSX.utils.json_to_sheet(dataSPSS);
        const wsHuruf = XLSX.utils.json_to_sheet(dataHuruf);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, wsSPSS, "Data_SPSS_(1_dan_0)");
        XLSX.utils.book_append_sheet(workbook, wsHuruf, "Jawaban_Siswa_(A-E)");

        const safeTitle = lessonTitle ? lessonTitle.replace(/[^a-zA-Z0-9]/g, '_') : 'Ujian';
        XLSX.writeFile(workbook, `Analisis_${safeTitle}.xlsx`);
    };

    const handleToggleLock = () => {
        if (confirm(`Yakin ingin ${isLocked ? 'MEMBUKA' : 'MENGUNCI'} akses ujian ini untuk seluruh siswa?`)) {
            router.post(route('admin.lessons.toggle-lock', lessonId));
        }
    };

    return (
        <div className={`min-h-screen font-sans transition-colors duration-300 pb-12
            dark:bg-slate-900 dark:text-slate-100 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-slate-800 dark:via-slate-900 dark:to-black
            bg-slate-50 text-slate-800`}>

            <Head title={`Analisis - ${lessonTitle}`} />

            <nav className="border-b transition-colors duration-300 sticky top-0 z-50 px-6 py-4
                dark:border-cyan-500/20 dark:bg-slate-900/80 dark:backdrop-blur-md
                border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <Link
                        href={route("admin.dashboard")}
                        className="p-2 rounded-lg border transition-all dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 bg-white border-slate-200 hover:bg-slate-100 text-slate-600"
                    >
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <h1 className="font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r dark:from-cyan-400 dark:to-blue-500 from-blue-600 to-indigo-600 uppercase">
                            Analisis Butir Soal
                        </h1>
                        <p className="text-xs font-bold tracking-widest uppercase dark:text-slate-500 text-slate-400">
                            {lessonTitle}
                        </p>
                    </div>
                </div>
            </nav>

            <main className="p-6 max-w-7xl mx-auto mt-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl dark:bg-emerald-500/20 dark:text-emerald-400 bg-emerald-100 text-emerald-600">
                            <FaClipboardList size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold dark:text-white text-slate-800">
                                Matriks Jawaban
                            </h2>
                            <p className="text-sm dark:text-slate-400 text-slate-500">
                                Total {reportMatrix.length} siswa telah mengerjakan {totalQuestions} soal.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        {/* TOMBOL SAKELAR KUNCI/BUKA UJIAN */}
                        <button
                            onClick={handleToggleLock}
                            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border transition-all shadow-md hover:scale-105 w-full sm:w-auto text-white
                                ${isLocked 
                                    ? 'bg-rose-500 hover:bg-rose-600 border-rose-600 shadow-rose-500/30' 
                                    : 'bg-emerald-500 hover:bg-emerald-600 border-emerald-600 shadow-emerald-500/30'
                                }`}
                        >
                            {isLocked ? <FaLock size={16} /> : <FaUnlock size={16} />}
                            {isLocked ? 'Ujian Terkunci (Buka)' : 'Ujian Terbuka (Kunci)'}
                        </button>

                        {/* TOMBOL EKSPOR EXCEL BAWAAN TADI */}
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border transition-all shadow-lg hover:scale-105 w-full sm:w-auto
                                dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400 dark:hover:bg-blue-500/20
                                bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        >
                            <FaFileExcel size={16} /> 
                            Ekspor .XLSX
                        </button>
                    </div>
                </div>

                <div className="rounded-2xl border overflow-hidden shadow-xl transition-colors
                    dark:bg-slate-800/60 dark:backdrop-blur-md dark:border-slate-700
                    bg-white border-slate-200">

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-max">
                            <thead>
                                <tr className="text-xs uppercase tracking-widest font-bold border-b
                                    dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-700
                                    bg-slate-50 text-slate-500 border-slate-200">
                                    <th className="p-4 border-r dark:border-slate-700/50 border-slate-200 sticky left-0 z-20 dark:bg-slate-900 bg-slate-50 drop-shadow-md">
                                        Nama Player
                                    </th>
                                    {questionHeaders.map((header, index) => (
                                        <th key={index} className="p-4 text-center border-r dark:border-slate-700/50 border-slate-200 w-12">
                                            No {index + 1}
                                        </th>
                                    ))}
                                    <th className="p-4 text-center border-r dark:border-slate-700/50 border-slate-200">Benar</th>
                                    <th className="p-4 text-center">Skor Akhir</th>
                                </tr>
                            </thead>
                            <tbody className="dark:divide-slate-700/50 divide-slate-100">
                                {/* BARIS KHUSUS KUNCI JAWABAN */}
                                <tr className="dark:bg-amber-500/10 bg-amber-50 border-b-2 dark:border-amber-500/30 border-amber-200">
                                    <td className="p-4 font-black dark:text-amber-400 text-amber-700 border-r dark:border-amber-500/30 border-amber-200 sticky left-0 z-10 dark:bg-slate-800 bg-amber-50 drop-shadow-md flex items-center gap-2">
                                        <FaKey /> KUNCI JAWABAN
                                    </td>
                                    {questionHeaders.map((qKey) => (
                                        <td key={qKey} className="p-2 border-r dark:border-amber-500/30 border-amber-200 text-center">
                                            <div className="mx-auto flex items-center justify-center w-8 h-8 rounded text-sm font-black dark:bg-amber-500/20 dark:text-amber-300 bg-amber-200 text-amber-800 shadow-sm">
                                                {answerKeys[qKey]}
                                            </div>
                                        </td>
                                    ))}
                                    <td className="p-4 text-center font-bold dark:text-amber-400 text-amber-700 border-r dark:border-amber-500/30 border-amber-200">
                                        {totalQuestions}
                                    </td>
                                    <td className="p-4 text-center font-bold dark:text-amber-400 text-amber-700">
                                        100
                                    </td>
                                </tr>

                                {/* LOOPING JAWABAN SISWA */}
                                {reportMatrix.length > 0 ? (
                                    reportMatrix.map((student) => (
                                        <tr key={student.id} className="transition duration-300 group
                                            dark:hover:bg-cyan-500/5 hover:bg-blue-50">

                                            <td className="p-4 font-bold dark:text-slate-200 text-slate-700 border-r dark:border-slate-700/50 border-slate-200 sticky left-0 z-10 dark:bg-slate-800 bg-white drop-shadow-md group-hover:bg-blue-50 dark:group-hover:bg-slate-700">
                                                {student.name}
                                            </td>

                                            {questionHeaders.map((qKey) => {
                                                const ans = student.answers[qKey];
                                                const isBenar = ans.is_correct === 1;
                                                const belumDijawab = ans.letter === '-';

                                                let styleClass = 'dark:bg-slate-700 dark:text-slate-400 bg-slate-100 text-slate-400 border-slate-200'; // Default (Kosong)
                                                if (!belumDijawab) {
                                                    styleClass = isBenar
                                                        ? 'dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/50 bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm'
                                                        : 'dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/50 bg-rose-100 text-rose-700 border-rose-300 shadow-sm';
                                                }

                                                return (
                                                    <td key={qKey} className="p-2 border-r dark:border-slate-700/50 border-slate-200 text-center">
                                                        <div className={`mx-auto flex items-center justify-center w-8 h-8 rounded text-sm font-bold border ${styleClass}`} title={isBenar ? 'Benar' : 'Salah'}>
                                                            {ans.letter}
                                                        </div>
                                                    </td>
                                                );
                                            })}

                                            <td className="p-4 text-center font-bold dark:text-slate-300 text-slate-600 border-r dark:border-slate-700/50 border-slate-200">
                                                {student.total_correct}
                                            </td>

                                            <td className="p-4 text-center">
                                                <span className="px-3 py-1 rounded font-bold text-sm shadow-sm border
                                                    dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20
                                                    bg-blue-100 text-blue-600 border-blue-200">
                                                    {student.score}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={totalQuestions + 3} className="p-12 text-center italic dark:text-slate-500 text-slate-400">
                                            Belum ada player yang menyelesaikan tantangan ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
