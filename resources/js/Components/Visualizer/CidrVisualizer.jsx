import React, { useState, useEffect, useRef } from 'react';
import { FaNetworkWired, FaTable, FaMicrochip, FaExchangeAlt, FaInfoCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function CidrVisualizer() {
    const [ipInput, setIpInput] = useState('192.168.10.1');
    const [prefix, setPrefix] = useState(24);
    const [data, setData] = useState(null);

    // Ref untuk tabel agar bisa auto-scroll mengikuti slider
    const activeRowRef = useRef(null);

    // --- RUMUS MENGHITUNG CIDR ---
    useEffect(() => {
        calculateCidr();
    }, [ipInput, prefix]);

    // Efek Auto-Scroll Tabel saat Prefix berubah
    useEffect(() => {
        if (activeRowRef.current) {
            activeRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [prefix]);

    const toBinary = (n) => parseInt(n).toString(2).padStart(8, '0');

    const calculateCidr = () => {
        // 1. Validasi IP
        const parts = ipInput.split('.');
        if (parts.length !== 4 || parts.some(p => isNaN(p) || p === '')) {
            // Jangan set null agar UI tidak 'kedip', biarkan data lama atau return
            return;
        }

        // 2. Hitung Masker Biner (String Panjang 32 bit)
        const maskBinaryStr = '1'.repeat(prefix).padEnd(32, '0');

        // 3. Hitung Subnet Mask (Desimal)
        const maskParts = [];
        for (let i = 0; i < 32; i += 8) {
            maskParts.push(parseInt(maskBinaryStr.substring(i, i + 8), 2));
        }

        // 4. Hitung Network & Broadcast
        const ipParts = parts.map(p => parseInt(p));
        const wildcardParts = maskParts.map(m => 255 - m);
        const netParts = ipParts.map((p, i) => p & maskParts[i]);
        const broadParts = netParts.map((p, i) => p | wildcardParts[i]);

        // 5. Hitung Hosts
        const totalHosts = Math.pow(2, 32 - prefix);
        const usableHosts = prefix >= 31 ? 0 : totalHosts - 2;

        // 6. Siapkan Data Visualisasi Biner (IP)
        const ipBinaryStr = ipParts.map(toBinary).join('');

        setData({
            mask: maskParts.join('.'),
            wildcard: wildcardParts.join('.'),
            network: netParts.join('.'),
            broadcast: broadParts.join('.'),
            totalHosts,
            usableHosts,
            binaries: {
                ip: ipBinaryStr,      // '11000000...' (Data Asli)
                mask: maskBinaryStr   // '11111111...' (Topeng)
            }
        });
    };

    // Generate Data Tabel Referensi /1 sampai /32
    const cidrTable = Array.from({ length: 32 }, (_, i) => {
        const p = i + 1;
        const count = Math.pow(2, 32 - p);
        return { prefix: p, count: count };
    });

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">

            {/* === TOOLBAR (Fixed Top) === */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 md:px-6 py-4 shadow-sm z-10 shrink-0 transition-colors">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center justify-between">

                    {/* INPUT IP */}
                    <div className="w-full md:w-64">
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">IP Target</label>
                        <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden focus-within:border-indigo-500 dark:focus-within:border-indigo-400 transition bg-white dark:bg-slate-900 h-10">
                            <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700"><FaNetworkWired /></div>
                            <input
                                value={ipInput}
                                onChange={e => setIpInput(e.target.value)}
                                className="w-full border-none px-3 font-mono font-bold text-slate-700 dark:text-slate-200 bg-transparent focus:ring-0 text-sm"
                                placeholder="192.168.1.1"
                            />
                        </div>
                    </div>

                    {/* SLIDER PREFIX */}
                    <div className="flex-1 w-full">
                         <div className="flex justify-between items-end mb-2">
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Geser Prefix (CIDR)</label>
                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">/{prefix}</span>
                         </div>
                         <input
                            type="range" min="1" max="32" step="1"
                            value={prefix} onChange={e => setPrefix(parseInt(e.target.value))}
                            className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500 hover:accent-indigo-500 transition-all"
                         />
                    </div>
                </div>
            </div>

            {/* === MAIN CONTENT (Scrollable Area) === */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-slate-900 custom-scrollbar relative">
                <div className="absolute inset-0 opacity-30 pointer-events-none bg-grid-pattern h-full dark:opacity-10"></div>

                {/* Grid Layout: Kiri Visualisasi, Kanan Tabel */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10">

                    {/* === KOLOM KIRI (8/12): VISUALISASI === */}
                    <div className="xl:col-span-8 space-y-6">

                        {/* KARTU 1: ANATOMI BINER (DUA BARIS) */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden transition-colors">
                            <div className="flex items-center gap-2 mb-4 md:mb-6 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 pb-2">
                                <FaMicrochip /> Anatomi Biner (IP vs Mask)
                            </div>

                            {/* Scroll horizontal jika layar hp kecil */}
                            <div className="overflow-x-auto pb-4 custom-scrollbar">
                                {data ? (
                                    <div className="space-y-6 md:space-y-8 min-w-max px-1">

                                        {/* BARIS 1: IP ADDRESS (DATA ASLI) */}
                                        <div>
                                            <div className="text-[10px] text-slate-400 dark:text-slate-500 mb-2 font-mono flex justify-between">
                                                <span>BINARY IP ADDRESS (DATA ASLI)</span>
                                                <span className="text-slate-300 dark:text-slate-600">1 = ON, 0 = OFF</span>
                                            </div>
                                            <div className="flex gap-1">
                                                {/* Rendering 32 Bit IP */}
                                                {data.binaries.ip.split('').map((bit, idx) => (
                                                    <BitBox key={`ip-${idx}`} bit={bit} idx={idx} prefix={prefix} type="ip" />
                                                ))}
                                            </div>
                                        </div>

                                        {/* BARIS 2: SUBNET MASK (TOPENG) */}
                                        <div>
                                            <div className="text-[10px] text-slate-400 dark:text-slate-500 mb-2 font-mono flex justify-between">
                                                <span>BINARY SUBNET MASK (TOPENG)</span>
                                                <span className="text-indigo-500 dark:text-indigo-400">1 = NETWORK, 0 = HOST</span>
                                            </div>
                                            <div className="flex gap-1">
                                                {/* Rendering 32 Bit Masker */}
                                                {data.binaries.mask.split('').map((bit, idx) => (
                                                    <BitBox key={`mask-${idx}`} bit={bit} idx={idx} prefix={prefix} type="mask" />
                                                ))}
                                            </div>
                                        </div>

                                    </div>
                                ) : (
                                    <div className="text-center text-slate-400 dark:text-slate-600 italic py-10">
                                        Masukkan IP yang valid untuk melihat visualisasi.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* KARTU 2: INFO GRID (4 KOLOM) */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            <InfoCard title="Subnet Mask" value={data?.mask} icon="🎭" color="bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300" />
                            <InfoCard title="Total Host" value={new Intl.NumberFormat('id-ID').format(data?.totalHosts || 0)} sub={`Usable: ${new Intl.NumberFormat('id-ID').format(data?.usableHosts || 0)}`} icon="📦" color="bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300" />
                            <InfoCard title="Network ID" value={data?.network} sub="Awal" icon="🌐" color="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300" />
                            <InfoCard title="Broadcast" value={data?.broadcast} sub="Akhir" icon="📢" color="bg-pink-50 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300" />
                        </div>
                    </div>

                    {/* === KOLOM KANAN (4/12): TABEL REFERENSI (STICKY) === */}
                    <div className="xl:col-span-4 mt-6 xl:mt-0">
                        {/* Container Tabel dengan tinggi tetap & Scrollable */}
                        {/* PERBAIKAN: Di mobile h-[400px], di desktop pakai calc */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[400px] xl:h-[calc(85vh-150px)] xl:sticky xl:top-0 transition-colors">

                            {/* Header Tabel */}
                            <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest flex items-center gap-2 shrink-0 rounded-t-2xl transition-colors">
                                <FaTable /> Tabel Referensi
                            </div>

                            {/* Body Tabel (Scrollable) */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10 shadow-sm text-slate-500 dark:text-slate-400 transition-colors">
                                        <tr>
                                            <th className="px-4 py-2">CIDR</th>
                                            <th className="px-4 py-2 text-right">Total IP</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                        {cidrTable.map((row) => {
                                            const isActive = row.prefix === prefix;
                                            return (
                                                <tr
                                                    key={row.prefix}
                                                    // Ref dipasang jika baris ini aktif
                                                    ref={isActive ? activeRowRef : null}
                                                    className={`
                                                        transition-colors cursor-pointer
                                                        ${isActive
                                                            ? 'bg-indigo-600 dark:bg-indigo-500 text-white font-bold'
                                                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'
                                                        }
                                                    `}
                                                    onClick={() => setPrefix(row.prefix)}
                                                >
                                                    <td className="px-4 py-3 font-mono">/{row.prefix}</td>
                                                    <td className="px-4 py-3 text-right font-mono">{new Intl.NumberFormat('id-ID').format(row.count)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// --- SUB KOMPONEN (Untuk Kotak Biner) ---
function BitBox({ bit, idx, prefix, type }) {
    const isNetwork = idx < prefix;
    const isOctetSep = (idx > 0) && (idx % 8 === 0);

    // Styling Dinamis
    let bgClass = "bg-slate-100 text-slate-300 border-slate-200 dark:bg-slate-700 dark:text-slate-500 dark:border-slate-600"; // Default (Host/Off)

    if (type === 'mask') {
        // Visualisasi Topeng: 1 = Network (Tebal), 0 = Host (Tipis)
        if (isNetwork) {
            bgClass = "bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold scale-105 z-10 dark:bg-indigo-500 dark:border-indigo-400";
        }
    } else {
        // Visualisasi IP: Network Portion = Biru Muda, Host Portion = Abu
        if (isNetwork) {
            bgClass = "bg-blue-100 text-blue-700 border-blue-300 font-bold border-b-2 dark:bg-blue-900/60 dark:text-blue-300 dark:border-blue-700";
        } else {
            bgClass = "bg-slate-50 text-slate-400 border-slate-200 border-b dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700";
        }
    }

    return (
        <>
            {/* Pemisah per 8 bit (Titik) */}
            {isOctetSep && <div className="w-1.5 md:w-2 flex items-center justify-center text-slate-300 dark:text-slate-600 font-bold select-none text-sm md:text-base">.</div>}

            <motion.div
                layout
                className={`
                    w-6 h-8 md:w-8 md:h-10 flex items-center justify-center rounded border text-xs md:text-sm font-mono transition-colors duration-300 select-none
                    ${bgClass}
                `}
            >
                {bit}
            </motion.div>
        </>
    );
}

// --- SUB KOMPONEN (Info Card) ---
function InfoCard({ title, value, sub, icon, color }) {
    return (
        <div className={`rounded-xl p-2.5 md:p-3 border flex flex-col justify-between ${color} h-20 md:h-24 shadow-sm transition-colors`}>
            <div className="flex justify-between items-start mb-1 md:mb-0">
                <span className="text-[9px] md:text-[10px] font-bold uppercase opacity-80 tracking-wider truncate mr-1">{title}</span>
                <span className="text-xs md:text-sm opacity-70 shrink-0">{icon}</span>
            </div>
            <div>
                <div className="text-xs md:text-sm font-bold font-mono truncate" title={value}>{value || '-'}</div>
                {sub && <div className="text-[9px] md:text-[10px] opacity-90 mt-0.5 md:mt-1 truncate" title={sub}>{sub}</div>}
            </div>
        </div>
    );
}
