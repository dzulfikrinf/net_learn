import React from 'react';
import { motion } from 'framer-motion';

export default function SubnetBlock({ data, totalHosts, index, onHover }) {
    const widthPercentage = (data.hostsAvailable / totalHosts) * 100;

    const colors = [
        'bg-net-blue border-blue-500 text-white',
        'bg-net-teal border-teal-500 text-white',
        'bg-orange-400 border-orange-600 text-white',
        'bg-purple-400 border-purple-600 text-white',
        'bg-pink-400 border-pink-600 text-white',
    ];

    const isUnusedBlock = data.isUnused;

    const colorClass = isUnusedBlock
        ? 'bg-slate-200 border-slate-300 text-slate-400'
        : colors[index % colors.length];

    // Hitung Sisa
    const capacityUsable = data.hostsAvailable - 2;
    const hostsNeeded = data.hosts || 0;
    const hostsFree = Math.max(0, capacityUsable - hostsNeeded); // Pastikan tidak minus

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-full flex-grow-0 flex-shrink-0 transition-all duration-300 min-w-[50px] group"
            style={{ width: `${widthPercentage}%` }}
            onMouseEnter={() => onHover(data)}
            onMouseLeave={() => onHover(null)}
        >
            {/* TOOLTIP SENDIRI (Jaga-jaga jika Panel Atas Error) */}
            {/* <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 bg-slate-800 text-white text-xs rounded-lg p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[999] text-center shadow-2xl border border-slate-700">
                <div className="font-bold text-sm mb-2 text-yellow-400 border-b border-slate-600 pb-1">
                    {data.name}
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-left text-[11px]">
                    <span className="text-slate-400">Range:</span>
                    <span className="font-mono text-right text-slate-200">{data.rangeStart} - {data.rangeEnd ? data.rangeEnd.split('.').pop() : '...'}</span>

                    {!isUnusedBlock && (
                        <>
                            <span className="text-green-400 font-bold mt-2">Terpakai:</span>
                            <span className="font-bold text-right mt-2">{hostsNeeded} Host</span>

                            <span className="text-red-400 font-bold">Sisa (Free):</span>
                            <span className="font-bold text-right">{hostsFree} Host</span>
                        </>
                    )}
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800"></div>
            </div> */}

            {/* VISUAL BALOK */}
            <div className={`h-full rounded-lg border-2 shadow-sm flex flex-col items-center justify-center p-1 text-center overflow-hidden cursor-help hover:brightness-110 transition ${colorClass}`}>
                {isUnusedBlock ? (
                    <>
                        <div className="font-bold text-[10px] uppercase tracking-wider">Free</div>
                        <div className="text-xs font-mono mt-1">{data.hostsAvailable} IP</div>
                    </>
                ) : (
                    <>
                        {/* Judul */}
                        <div className="font-bold text-xs md:text-sm truncate w-full px-1 leading-tight mb-1">
                            {data.name}
                        </div>

                        {/* Prefix */}
                        <div className="opacity-70 font-mono text-[10px] mb-2">/{data.prefix}</div>

                        {/* HAPUS BAR, GANTI JUMLAH HOST */}
                        <div className="bg-black/20 rounded-full px-2 py-0.5 text-[10px] font-bold inline-block min-w-[40px]">
                            {hostsNeeded} PC
                        </div>

                        {/* Info Sisa (Kecil di bawah) */}
                        {widthPercentage > 8 && (
                            <div className="text-[9px] mt-1 opacity-75">
                                +{hostsFree} Sisa
                            </div>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );
}
