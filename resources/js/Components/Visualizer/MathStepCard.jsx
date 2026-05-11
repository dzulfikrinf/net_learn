import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMemory, FaNetworkWired, FaMicrochip, FaChevronRight, FaChevronLeft } from "react-icons/fa";

// --- HELPER: Mengubah Prefix menjadi Desimal ---
const getDecMask = (prefix) => {
    const mask = -1 << (32 - prefix);
    return [(mask >>> 24) & 255, (mask >>> 16) & 255, (mask >>> 8) & 255, mask & 255].join('.');
};

// --- HELPER: Visualizer Biner 32-bit ---
const BinaryVisualizer = ({ prefix, borrowed = 0 }) => {
    const baseNetwork = prefix - borrowed;
    const bits = Array.from({ length: 32 }, (_, i) => {
        if (i < baseNetwork) return { val: 1, type: 'network', color: 'bg-blue-500 dark:bg-blue-600 text-white' };
        if (i < prefix) return { val: 1, type: 'borrowed', color: 'bg-yellow-400 dark:bg-yellow-500 text-slate-900' };
        return { val: 0, type: 'host', color: 'bg-slate-200 dark:bg-slate-700 text-slate-400' };
    });

    return (
        <div className="mt-3">
            <div className="flex flex-wrap gap-x-1 sm:gap-x-1.5 gap-y-1 justify-center font-mono text-[8px] sm:text-[10px]">
                {bits.map((bit, i) => (
                    <React.Fragment key={i}>
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.01 }}
                            className={`w-3 h-4 sm:w-4 sm:h-5 flex items-center justify-center rounded-[2px] ${bit.color} shadow-sm font-bold`}
                        >
                            {bit.val}
                        </motion.div>
                        {(i + 1) % 8 === 0 && i !== 31 && <div className="w-1.5 sm:w-2"></div>}
                    </React.Fragment>
                ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-3 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Network</span>
                {borrowed > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Pinjaman (x)</span>}
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span> Host (y)</span>
            </div>
        </div>
    );
};

export default function MathStepCard({ stepData }) {
    const [innerStep, setInnerStep] = useState(1);
    const [isSorted, setIsSorted] = useState(false);

    useEffect(() => {
        setInnerStep(1);
        setIsSorted(false);
    }, [stepData]);

    useEffect(() => {
        if (stepData && !stepData.borrowedBits && stepData.isFirstStep && innerStep === 1) {
            const timer = setTimeout(() => setIsSorted(true), 1200);
            return () => clearTimeout(timer);
        }
    }, [stepData, innerStep]);

    if (!stepData) return null;

    const isFLSM = stepData.borrowedBits !== undefined;
    const isVLSMFirstStep = !isFLSM && stepData.isFirstStep;
    const totalSlides = isFLSM ? 4 : (isVLSMFirstStep ? 5 : 4);
    const vlsmCalcStep = isVLSMFirstStep ? innerStep - 1 : innerStep;

    const decMask = getDecMask(stepData.newPrefix);
    const octets = decMask.split('.');
    const interestingOctetVal = octets.find(o => o < 255) || 0;
    const interval = 256 - parseInt(interestingOctetVal);

    const totalCapacity = stepData.blockSize;
    const usableCapacity = stepData.blockSize - 2;
    const neededHosts = stepData.hosts;
    const utilizationPercent = Math.min(100, Math.round((neededHosts / usableCapacity) * 100));

    const slideVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
    };

    const themeColor = isFLSM ? 'blue' : 'teal';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-6 shadow-2xl max-w-lg mx-auto my-2 relative overflow-hidden transition-colors duration-300 min-h-[300px] flex flex-col`}
        >
            <FaMicrochip className="absolute -right-10 -bottom-10 text-[150px] opacity-5 dark:opacity-10 text-slate-400 pointer-events-none" />

            {/* Header Global */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3 relative z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className={`bg-gradient-to-br from-${themeColor}-500 to-${isFLSM ? 'cyan' : 'green'}-500 text-white p-2 rounded-xl shadow-md`}>
                        <FaNetworkWired size={16} />
                    </div>
                    <div>
                        <h4 className="text-sm md:text-base font-black text-slate-800 dark:text-white uppercase tracking-wide">
                            Dapur Perhitungan
                        </h4>
                        <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {isFLSM ? 'Metode FLSM Berjenjang' : 'Metode VLSM Dinamis'}
                        </p>
                    </div>
                </div>
                <div className={`text-xs font-bold text-net-${themeColor} dark:text-${themeColor}-400 bg-${themeColor}-50 dark:bg-${themeColor}-900/30 px-3 py-1 rounded-full border border-${themeColor}-100 dark:border-${themeColor}-800 shadow-inner`}>
                    {stepData.name}
                </div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex-1">
                    <AnimatePresence mode="wait">

                        {/* FLSM WIZARD */}
                        {isFLSM && innerStep === 1 && (
                            <motion.div key="f-step1" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                                <div className="text-center">
                                    <span className="inline-block bg-blue-100 dark:bg-cyan-900/50 text-blue-600 dark:text-cyan-400 font-black px-3 py-1 rounded-full text-xs mb-3">Langkah 1</span>
                                    <h5 className="font-bold text-slate-800 dark:text-white text-lg">Menentukan Bit Pinjaman (<i>x</i>)</h5>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                                    <p className="text-xs text-slate-400 mb-2 uppercase tracking-widest font-bold">Rumus Pangkat 2</p>
                                    <div className="text-2xl font-mono font-black text-blue-600 dark:text-cyan-400">
                                        2<sup className="text-red-500">{stepData.borrowedBits}</sup> = {Math.pow(2, stepData.borrowedBits)} Blok
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-4">
                                        Maka kita meminjam <b className="text-red-500">{stepData.borrowedBits} bit</b> dari porsi host.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {isFLSM && innerStep === 2 && (
                            <motion.div key="f-step2" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                                <div className="text-center">
                                    <span className="inline-block bg-blue-100 dark:bg-cyan-900/50 text-blue-600 dark:text-cyan-400 font-black px-3 py-1 rounded-full text-xs mb-2">Langkah 2</span>
                                    <h5 className="font-bold text-slate-800 dark:text-white text-lg">Subnet Mask Baru</h5>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Prefix awal <b className="font-mono">/{stepData.newPrefix - stepData.borrowedBits}</b> ditambah pinjaman <b className="text-yellow-500">{stepData.borrowedBits} bit</b>.
                                    </p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <BinaryVisualizer prefix={stepData.newPrefix} borrowed={stepData.borrowedBits} />
                                    <div className="mt-5 flex justify-between items-center text-xs font-mono bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600">
                                        <span className="text-slate-500">Desimal: <span className="font-bold text-slate-800 dark:text-white">{decMask}</span></span>
                                        <span className="text-slate-500">Prefix: <span className="font-bold text-green-600 dark:text-green-400 text-sm">/{stepData.newPrefix}</span></span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {isFLSM && innerStep === 3 && (
                            <motion.div key="f-step3" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                                <div className="text-center">
                                    <span className="inline-block bg-blue-100 dark:bg-cyan-900/50 text-blue-600 dark:text-cyan-400 font-black px-3 py-1 rounded-full text-xs mb-2">Langkah 3 & 4</span>
                                    <h5 className="font-bold text-slate-800 dark:text-white text-lg">Kapasitas & Interval Blok</h5>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                                        <div>
                                            <div className="text-[10px] text-slate-400 uppercase font-bold">Kapasitas (2<sup>y</sup>)</div>
                                            <div className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200">
                                                2<sup>{32 - stepData.newPrefix}</sup> = <span className="text-blue-600 dark:text-cyan-400">{stepData.blockSize} IP</span>
                                            </div>
                                        </div>
                                        <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700"></div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-slate-400 uppercase font-bold">Interval (256 - Oktet)</div>
                                            <div className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200">256 - {interestingOctetVal} = <span className="text-green-600 dark:text-green-400">{interval}</span></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-bold mb-1.5">Visualisasi Potongan 1 Blok:</div>
                                        <div className="h-5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex shadow-inner relative">
                                            <div className="w-[10%] bg-red-500 h-full border-r-2 border-white/20" title="Network ID"></div>
                                            <div className="w-[80%] bg-green-500 dark:bg-green-600 h-full flex items-center justify-center text-[9px] text-white font-bold">
                                                {stepData.hosts} IP Halal
                                            </div>
                                            <div className="w-[10%] bg-red-500 h-full border-l-2 border-white/20" title="Broadcast ID"></div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {isFLSM && innerStep === 4 && (
                            <motion.div key="f-step4" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                                <div className="text-center">
                                    <span className="inline-block bg-blue-100 dark:bg-cyan-900/50 text-blue-600 dark:text-cyan-400 font-black px-3 py-1 rounded-full text-xs mb-2">Langkah 5</span>
                                    <h5 className="font-bold text-slate-800 dark:text-white text-lg">Hasil Potongan Subnet</h5>
                                    <p className="text-xs text-slate-500 mt-1">Ini adalah jatah IP untuk <b>{stepData.name}</b>.</p>
                                </div>
                                <div className="bg-blue-50 dark:bg-cyan-900/30 p-5 rounded-2xl border border-blue-200 dark:border-cyan-800/50 shadow-inner">
                                    <ul className="space-y-3 font-mono text-sm text-slate-700 dark:text-slate-200">
                                        <li className="flex justify-between border-b border-blue-200/50 dark:border-cyan-800/50 pb-2">
                                            <span className="text-slate-500 dark:text-slate-400">Network ID:</span>
                                            <span className="font-bold text-blue-700 dark:text-cyan-300">{stepData.networkId}/{stepData.newPrefix}</span>
                                        </li>
                                        <li className="flex justify-between border-b border-blue-200/50 dark:border-cyan-800/50 pb-2">
                                            <span className="text-slate-500 dark:text-slate-400">Range Host:</span>
                                            <span className="font-bold">{stepData.rangeStart} - {stepData.rangeEnd}</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">Broadcast:</span>
                                            <span className="font-bold text-red-500 dark:text-red-400">{stepData.broadcastId}</span>
                                        </li>
                                    </ul>
                                </div>
                            </motion.div>
                        )}

                        {/* VLSM WIZARD */}
                        {isVLSMFirstStep && innerStep === 1 && (
                            <motion.div key="v-step-sort" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                                <div className="text-center">
                                    <span className="inline-block bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 font-black px-3 py-1 rounded-full text-xs mb-3">Aturan VLSM</span>
                                    <h5 className="font-bold text-slate-800 dark:text-white text-lg">Urutkan dari Terbesar</h5>
                                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Syarat utama perhitungan VLSM agar tidak ada IP yang tumpang tindih.</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 min-h-[150px] flex flex-col justify-center">
                                    <div className="flex flex-col gap-2">
                                        <AnimatePresence>
                                            {(isSorted ? stepData.sortedReqs : stepData.rawReqs).map((item) => (
                                                <motion.div
                                                    layout
                                                    key={item.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                    className={`flex justify-between items-center p-2.5 rounded-xl border transition-colors shadow-sm
                                                        ${isSorted ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600'}
                                                    `}
                                                >
                                                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{item.name}</span>
                                                    <span className={`font-mono font-bold ${isSorted ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500'}`}>{item.hosts} Host</span>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {!isFLSM && vlsmCalcStep === 1 && (
                            <motion.div key="v-step1" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                                <div className="text-center">
                                    <span className="inline-block bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 font-black px-3 py-1 rounded-full text-xs mb-3">Langkah 1</span>
                                    <h5 className="font-bold text-slate-800 dark:text-white text-lg">Pangkat 2 Terdekat</h5>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Departemen <b>{stepData.name}</b> membutuhkan {stepData.hosts} host.</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                                    <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold mb-4 border border-red-200 dark:border-red-800/50">
                                        <FaMemory /> Target = {stepData.hosts} + 2 = {stepData.needed} IP
                                    </div>
                                    <p className="text-xs text-slate-400 mb-2 uppercase tracking-widest font-bold">Kapasitas Blok (2<sup>y</sup>)</p>
                                    <div className="text-2xl font-mono font-black text-net-teal dark:text-teal-400">
                                        2<sup className="text-slate-600 dark:text-slate-300">{stepData.hostBits}</sup> = {totalCapacity} IP
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {!isFLSM && vlsmCalcStep === 2 && (
                            <motion.div key="v-step2" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                                <div className="text-center">
                                    <span className="inline-block bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 font-black px-3 py-1 rounded-full text-xs mb-2">Langkah 2</span>
                                    <h5 className="font-bold text-slate-800 dark:text-white text-lg">Menentukan Prefix Baru</h5>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Bit Host (<i>y</i>) adalah {stepData.hostBits}, maka Bit Network = 32 - {stepData.hostBits}
                                    </p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <BinaryVisualizer prefix={stepData.newPrefix} borrowed={0} />
                                    <div className="mt-4 text-center">
                                        <span className="text-xs text-slate-500 font-medium">Hasil Prefix:</span>
                                        <div className="font-bold text-green-600 dark:text-green-400 text-2xl font-mono">/{stepData.newPrefix}</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {!isFLSM && vlsmCalcStep === 3 && (
                            <motion.div key="v-step3" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                                <div className="text-center">
                                    <span className="inline-block bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 font-black px-3 py-1 rounded-full text-xs mb-2">Langkah 3</span>
                                    <h5 className="font-bold text-slate-800 dark:text-white text-lg">Efisiensi Alokasi</h5>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Melihat seberapa banyak IP yang terbuang (wasted).</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Penggunaan Host</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${utilizationPercent > 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400'}`}>
                                            {utilizationPercent}% Terpakai
                                        </span>
                                    </div>
                                    <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex relative shadow-inner mb-3">
                                        <motion.div
                                            initial={{ width: 0 }} animate={{ width: `${utilizationPercent}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="bg-gradient-to-r from-teal-400 to-green-400 h-full"
                                        ></motion.div>
                                    </div>
                                    <div className="flex justify-between text-xs font-mono font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-2.5 rounded border border-slate-200 dark:border-slate-600">
                                        <span className="flex flex-col"><span className="text-[9px] text-slate-400">Diminta</span>{neededHosts} PC</span>
                                        <div className="w-[1px] bg-slate-200 dark:bg-slate-700"></div>
                                        <span className="flex flex-col text-right"><span className="text-[9px] text-slate-400">Tersedia (Usable)</span>{usableCapacity} IP</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {!isFLSM && vlsmCalcStep === 4 && (
                            <motion.div key="v-step4" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                                <div className="text-center">
                                    <span className="inline-block bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 font-black px-3 py-1 rounded-full text-xs mb-2">Langkah 4</span>
                                    <h5 className="font-bold text-slate-800 dark:text-white text-lg">Hasil Alokasi {stepData.name}</h5>
                                    <p className="text-xs text-slate-500 mt-1">Blok VLSM berhasil dibentuk sesuai kebutuhan.</p>
                                </div>
                                <div className="bg-teal-50 dark:bg-teal-900/20 p-5 rounded-2xl border border-teal-200 dark:border-teal-800/50 shadow-inner">
                                    <ul className="space-y-3 font-mono text-sm text-slate-700 dark:text-slate-200">
                                        <li className="flex justify-between border-b border-teal-200/50 dark:border-teal-800/50 pb-2">
                                            <span className="text-slate-500 dark:text-slate-400">Network ID:</span>
                                            <span className="font-bold text-teal-700 dark:text-teal-300">{stepData.networkId}/{stepData.newPrefix}</span>
                                        </li>
                                        <li className="flex justify-between border-b border-teal-200/50 dark:border-teal-800/50 pb-2">
                                            <span className="text-slate-500 dark:text-slate-400">Range Host:</span>
                                            <span className="font-bold">{stepData.rangeStart} - {stepData.rangeEnd}</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">Broadcast:</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-300">{stepData.broadcastId}</span>
                                        </li>
                                    </ul>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                {/* Kontrol Navigasi */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
                    <button
                        onClick={() => setInnerStep(s => Math.max(1, s - 1))}
                        disabled={innerStep === 1}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <FaChevronLeft size={10}/> Kembali
                    </button>

                    <div className="flex gap-1.5">
                        {Array.from({ length: totalSlides }, (_, i) => i + 1).map(i => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${innerStep === i ? `w-6 bg-net-${themeColor} dark:bg-${themeColor}-500` : 'w-2 bg-slate-200 dark:bg-slate-700'}`}></div>
                        ))}
                    </div>

                    <button
                        onClick={() => setInnerStep(s => Math.min(totalSlides, s + 1))}
                        disabled={innerStep === totalSlides}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${innerStep === totalSlides ? 'text-slate-400 bg-transparent opacity-30 cursor-not-allowed' : `text-net-${themeColor} dark:text-${themeColor}-400 bg-${themeColor}-50 dark:bg-${themeColor}-900/30 hover:bg-${themeColor}-100 dark:hover:bg-${themeColor}-900/50`}`}
                    >
                        Lanjut <FaChevronRight size={10}/>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
