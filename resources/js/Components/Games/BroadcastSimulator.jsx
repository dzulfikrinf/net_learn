import React, { useState, useEffect } from 'react';
import { FaDesktop, FaNetworkWired, FaShieldAlt, FaBolt } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function BroadcastSimulator({ data, onComplete }) {
    const config = typeof data === 'string' ? JSON.parse(data) : data;
    const [mode, setMode] = useState('flat'); // 'flat' (Tanpa Subnet) | 'subnet' (Dengan Subnet)
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [logs, setLogs] = useState("Sistem Siap...");

    // Simulasi Broadcast
    const handleBroadcast = () => {
        setIsBroadcasting(true);

        if (mode === 'flat') {
            setLogs("⚠️ BROADCAST STORM! 1 PC teriak, 15 PC terganggu!");
        } else {
            setLogs("✅ SUBNETTING AMAN. 1 PC teriak, hanya 3 PC tetangga yang dengar.");
            if (onComplete) onComplete(); // Trigger tombol Lanjut jika user mencoba mode aman
        }

        // Reset animasi setelah 1.5 detik
        setTimeout(() => setIsBroadcasting(false), 1500);
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm my-6">
            <h3 className="font-bold text-center mb-6 text-slate-800 dark:text-white flex items-center justify-center gap-2">
                <FaNetworkWired className="text-blue-500"/> {config.instruction}
            </h3>

            {/* CONTROLS */}
            <div className="flex justify-center gap-4 mb-8">
                <button
                    onClick={() => { setMode('flat'); setIsBroadcasting(false); setLogs("Mode: Tanpa Subnet (Flat Network)"); }}
                    className={`px-4 py-2 rounded-lg font-bold transition-all border-2 flex items-center gap-2
                        ${mode === 'flat' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-400'}
                    `}
                >
                    <FaBolt /> Tanpa Subnet
                </button>
                <button
                    onClick={() => { setMode('subnet'); setIsBroadcasting(false); setLogs("Mode: Dengan Subnetting"); }}
                    className={`px-4 py-2 rounded-lg font-bold transition-all border-2 flex items-center gap-2
                        ${mode === 'subnet' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-400'}
                    `}
                >
                    <FaShieldAlt /> Dengan Subnet
                </button>
            </div>

            {/* VISUALIZATION GRID */}
            <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden min-h-[300px]">

                {/* Garis Pemisah (Hanya muncul di mode Subnet) */}
                {mode === 'subnet' && (
                    <>
                        <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-dashed border-l-2 border-slate-300 z-0"></div>
                        <div className="absolute left-0 top-1/2 w-full h-1 bg-dashed border-t-2 border-slate-300 z-0"></div>
                        <div className="absolute top-2 left-2 text-[10px] font-bold text-slate-400 bg-slate-200 px-2 rounded">HRD</div>
                        <div className="absolute top-2 right-2 text-[10px] font-bold text-slate-400 bg-slate-200 px-2 rounded">IT</div>
                        <div className="absolute bottom-2 left-2 text-[10px] font-bold text-slate-400 bg-slate-200 px-2 rounded">SALES</div>
                        <div className="absolute bottom-2 right-2 text-[10px] font-bold text-slate-400 bg-slate-200 px-2 rounded">GUDANG</div>
                    </>
                )}

                {/* Grid Komputer */}
                <div className="grid grid-cols-4 gap-4 relative z-10">
                    {Array.from({ length: 16 }).map((_, i) => {
                        // Tentukan siapa yang kena dampak
                        // PC 0 adalah Pengirim
                        const isSender = i === 0;

                        // Di mode Flat: SEMUA kena (kecuali pengirim)
                        // Di mode Subnet: Hanya PC 1, 2, 3 (tetangga satu blok) yang kena
                        let isAffected = false;
                        if (isBroadcasting && !isSender) {
                            if (mode === 'flat') isAffected = true;
                            if (mode === 'subnet' && i < 4) isAffected = true; // Cuma baris pertama
                        }

                        return (
                            <motion.div
                                key={i}
                                animate={isAffected ? { scale: [1, 1.2, 1] } : {}}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-300
                                    ${isSender ? 'bg-blue-100 border-2 border-blue-500' : ''}
                                    ${isAffected
                                        ? (mode === 'flat' ? 'bg-red-200 border-red-400 shadow-red-200 shadow-lg' : 'bg-green-200 border-green-400 shadow-green-200 shadow-lg')
                                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}
                                `}
                            >
                                <FaDesktop className={`text-2xl mb-1 ${isSender ? 'text-blue-600' : isAffected ? (mode === 'flat' ? 'text-red-600' : 'text-green-600') : 'text-slate-300'}`} />
                                <span className="text-[10px] font-mono text-slate-500">PC-{i+1}</span>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* ACTION & LOGS */}
            <div className="mt-6 flex flex-col items-center gap-4">
                <button
                    onClick={handleBroadcast}
                    disabled={isBroadcasting}
                    className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95
                        ${isBroadcasting ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300'}
                    `}
                >
                    {isBroadcasting ? 'Mengirim Sinyal...' : '📢 Kirim Broadcast'}
                </button>

                <div className={`text-sm font-bold px-4 py-2 rounded-full border
                    ${logs.includes("STORM") ? 'bg-red-50 text-red-600 border-red-200' : logs.includes("AMAN") ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'}
                `}>
                    {logs}
                </div>
            </div>
        </div>
    );
}
