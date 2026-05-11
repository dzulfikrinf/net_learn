import React, { useState, useEffect, useRef } from 'react';
import { ipToLong, longToIp } from "@/lib/ipUtils";
import SubnetBlock from './SubnetBlock';
import MathStepCard from './MathStepCard';
import NetworkTopologyGraph from './NetworkTopologyGraph';
import { FaPlay, FaForward, FaRedo, FaNetworkWired, FaPause, FaProjectDiagram, FaCheckCircle, FaTable, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

const getDecMask = (prefix) => {
    const mask = -1 << (32 - prefix);
    return [
        (mask >>> 24) & 255,
        (mask >>> 16) & 255,
        (mask >>> 8) & 255,
        mask & 255
    ].join('.');
};

// Helper untuk ubah angka/huruf jadi pangkat atas (Superscript)
const toSuper = (val) => {
    const map = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
        'x': 'ˣ', 'y': 'ʸ', 'n': 'ⁿ'
    };
    return val.toString().split('').map(c => map[c] || c).join('');
};

export default function FlsmVisualizer({ initialMode = 'manual', data, onComplete, onGameComplete }) {
    const config = typeof data === 'string' ? JSON.parse(data) : data;

    const [networkInput, setNetworkInput] = useState(config?.default_network || "192.168.10.0/24");
    const [subnetCountReq, setSubnetCountReq] = useState(config?.target_subnets || "4");

    const [isSimulating, setIsSimulating] = useState(false);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [subnets, setSubnets] = useState([]);
    const [totalHostsMaster, setTotalHostsMaster] = useState(0);
    const [calculationData, setCalculationData] = useState(null);
    const [hoveredBlock, setHoveredBlock] = useState(null);
    const [autoPlay, setAutoPlay] = useState(initialMode === 'auto');
    const [flsmPlan, setFlsmPlan] = useState(null);

    const [soundEnabled, setSoundEnabled] = useState(true);
    const [phase, setPhase] = useState('IDLE');
    const [subPhaseIdx, setSubPhaseIdx] = useState(0);

    const [fullStr, setFullStr] = useState("");
    const [displayStr, setDisplayStr] = useState("");
    const [charIdx, setCharIdx] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const hasTriggeredComplete = useRef(false);

    const isFinished = isSimulating && flsmPlan && currentIdx >= flsmPlan.actualSubnetCount && (phase === 'FINISHED' || phase === 'DONE' || initialMode === 'manual');

    // --- SETUP TTS ---
    useEffect(() => {
        if (window.speechSynthesis) window.speechSynthesis.getVoices();
        return () => window.speechSynthesis && window.speechSynthesis.cancel();
    }, []);

    const formatForTTS = (text) => {
        if (!text) return "";
        return text.toString()
            .replace(/\./g, ' titik ')
            .replace(/\//g, ' slash ')
            .replace(/ - /g, ' sampai dengan ')
            .replace(/FLSM/gi, ' Ef El Es Em ')
            .replace(/VLSM/gi, ' Vi El Es Em ')
            .replace(/IP/gi, ' Ai Pi ')
            .replace(/ID/gi, ' Ai Di ');
    };

    const getIndoVoice = () => {
        if (!window.speechSynthesis) return null;
        const voices = window.speechSynthesis.getVoices();
        return voices.find(v => v.lang === 'id-ID' || v.lang === 'id_ID' || v.name.includes('Indonesia')) || voices[0];
    };

    const playNarration = (displayText, speechText) => {
        setFullStr(displayText);
        setDisplayStr("");
        setCharIdx(0);
        setIsTyping(true);

        if (soundEnabled && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(true);
            const utterance = new SpeechSynthesisUtterance(speechText);
            utterance.voice = getIndoVoice();
            utterance.lang = 'id-ID';
            utterance.rate = 0.95;
            utterance.pitch = 1.1;
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        } else {
            setIsSpeaking(false);
        }
    };

    const toggleSound = () => {
        if (soundEnabled && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
        setSoundEnabled(!soundEnabled);
    };

    // --- EFEK MENGETIK ---
    useEffect(() => {
        if (!isTyping) return;
        if (charIdx < fullStr.length) {
            const t = setTimeout(() => {
                setDisplayStr(prev => prev + fullStr[charIdx]);
                setCharIdx(charIdx + 1);
            }, 30);
            return () => clearTimeout(t);
        } else {
            setIsTyping(false);
        }
    }, [charIdx, fullStr, isTyping]);

    const advancePhase = () => {
        if (phase === "INTRO") setPhase("STEP1_X");
        else if (phase === "STEP1_X") setPhase("STEP2_MASK");
        else if (phase === "STEP2_MASK") setPhase("STEP3_HOST");
        else if (phase === "STEP3_HOST") setPhase("STEP4_INTERVAL");
        else if (phase === "STEP4_INTERVAL") {
            setPhase("STEP5_SUBNET");
            setSubPhaseIdx(0);
        }
        else if (phase === "STEP5_SUBNET") {
            if (subPhaseIdx + 1 < flsmPlan.actualSubnetCount) {
                setSubPhaseIdx(prev => prev + 1);
            } else {
                setPhase("FINISHED");
            }
        }
        else if (phase === "FINISHED") {
            setPhase("DONE");
            setTimeout(() => {
                if (!hasTriggeredComplete.current) {
                    hasTriggeredComplete.current = true;
                    if (onGameComplete) onGameComplete();
                    else if (onComplete) onComplete();
                }
            }, 800);
        }
    };

    // --- KONTROL ALUR (AUTO MODE) ---
    useEffect(() => {
        if (initialMode === 'auto' && phase !== 'IDLE' && phase !== 'DONE' && fullStr !== "") {
            const isWaitingForSpeech = soundEnabled ? isSpeaking : false;
            if (!isTyping && !isWaitingForSpeech) {
                const t = setTimeout(() => {
                    if (autoPlay) advancePhase();
                }, 2500);
                return () => clearTimeout(t);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTyping, isSpeaking, autoPlay, phase, fullStr, soundEnabled, initialMode]);

    // --- NARASI AUTO MODE ---
    useEffect(() => {
        if (!isSimulating || !autoPlay || !flsmPlan || initialMode === 'manual') return;

        const y = 32 - flsmPlan.newPrefix;
        const lastOctet = 256 - flsmPlan.blockSize;
        const decMask = getDecMask(flsmPlan.newPrefix);
        const hosts = flsmPlan.blockSize - 2;

        if (phase === 'INTRO') {
            const display = `Studi Kasus:\nKita akan membagi network ${networkInput}\nmenjadi ${flsmPlan.neededSubnets} subnet yang sama besar (Metode FLSM).`;
            const speech = `Studi kasus. Kita akan membagi network induk ${formatForTTS(networkInput)}, menjadi ${flsmPlan.neededSubnets} subnet yang sama besar.`;
            playNarration(display, speech);
        }
        else if (phase === 'STEP1_X') {
            const display = `Langkah 1: Menentukan nilai x (bit subnet)\n\nUntuk mendapatkan ${flsmPlan.neededSubnets} subnet, kita gunakan rumus 2${toSuper('x')}.\nKarena 2${toSuper('x')} = ${flsmPlan.actualSubnetCount}, maka nilai x = ${flsmPlan.borrowedBits}.`;
            const speech = `Langkah 1. Menentukan nilai x, atau bit subnet. Untuk mendapatkan ${flsmPlan.neededSubnets} subnet, kita gunakan rumus 2 pangkat x. Dua pangkat berapa yang hasilnya ${flsmPlan.actualSubnetCount}? Yap, didapatkan nilai x sama dengan ${flsmPlan.borrowedBits}.`;
            playNarration(display, speech);
        }
        else if (phase === 'STEP2_MASK') {
            const display = `Langkah 2: Menentukan subnet mask baru\n\nPrefix awal /${flsmPlan.masterPrefix} ditambah nilai x (${flsmPlan.borrowedBits}) menjadi /${flsmPlan.newPrefix}.\nSubnet mask barunya adalah:\n${decMask}`;
            const speech = `Langkah 2. Menentukan subnet mask baru. Prefix awal slash ${flsmPlan.masterPrefix}, ditambah nilai x yaitu ${flsmPlan.borrowedBits}, menjadi slash ${flsmPlan.newPrefix}. Nilai desimal subnet mask akhirnya adalah, ${formatForTTS(decMask)}.`;
            playNarration(display, speech);
        }
        else if (phase === 'STEP3_HOST') {
            const display = `Langkah 3: Menghitung Jumlah Host per Subnet\n\nSisa bit nol (y) = ${y}.\nRumus: (2${toSuper('y')}) - 2\n= (2${toSuper(y)}) - 2 = ${flsmPlan.blockSize} - 2\n= ${hosts} host per subnet.`;
            const speech = `Langkah 3. Menghitung Jumlah Host per subnet. Sisa bit nol atau y adalah ${y}. Rumusnya adalah 2 pangkat y dikurangi 2. Yaitu ${flsmPlan.blockSize} dikurangi 2. Hasilnya, tiap blok memiliki ${hosts} host yang bisa dipakai.`;
            playNarration(display, speech);
        }
        else if (phase === 'STEP4_INTERVAL') {
            const display = `Langkah 4: Menentukan interval blok subnet\n\nRumus: 256 - Oktet terakhir subnet mask\n= 256 - ${lastOctet}\n= ${flsmPlan.blockSize}`;
            const speech = `Langkah 4. Menentukan interval blok subnet. Rumusnya 256 dikurangi nilai oktet terakhir subnet mask. Yaitu 256 dikurangi ${lastOctet}, sama dengan ${flsmPlan.blockSize}.`;
            playNarration(display, speech);
        }
        else if (phase === 'STEP5_SUBNET') {
            const calcData = calculateSubnet(subPhaseIdx);

            setSubnets(prev => {
                if (prev.some(s => s.name === calcData.name)) return prev;
                return [...prev, { ...calcData, isUnused: false }];
            });
            setCurrentIdx(subPhaseIdx + 1);

            const titleDisplay = subPhaseIdx === 0 ? "Langkah 5: Hasil Pembagian\n\n" : "";
            const display = `${titleDisplay}Subnet ${subPhaseIdx + 1}: ${calcData.networkId}/${calcData.newPrefix}\nRange: ${calcData.rangeStart} - ${calcData.rangeEnd}\nBroadcast: ${calcData.broadcastId}`;

            const titleSpeech = subPhaseIdx === 0 ? "Langkah 5. Hasil Pembagian. " : "Lanjut ke ";
            const speech = subPhaseIdx === 0
                ? `${titleSpeech}Subnet ke ${subPhaseIdx + 1}. Untuk detail Ai Pi Network, Range Host, dan Broadcast-nya, silakan perhatikan tabel detail subnet di sebelah kanan ya.`
                : `${titleSpeech}Subnet ke ${subPhaseIdx + 1}.`;
            playNarration(display, speech);
        }
        else if (phase === 'FINISHED') {
            const display = `Yeay Selesai! 🎉\n${flsmPlan.actualSubnetCount} blok subnet berhasil dibagi sesuai tahapan FLSM.\nSentuh diagram blok untuk melihat detailnya ya!`;
            const speech = `Yey Selesai! Seluruh blok subnet telah berhasil dihitung menggunakan lima langkah Ef El Es Em. Kamu bisa menggeser grafik disamping untuk melihat detail lengkapnya!`;
            playNarration(display, speech);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, subPhaseIdx]);

    // --- NARASI MANUAL MODE (BARU) ---
    // 1. Narasi saat baru klik "Mulai Hitung"
    useEffect(() => {
        if (initialMode === 'manual' && isSimulating && currentIdx === 0 && !calculationData && flsmPlan) {
            const display = `Persiapan Selesai!\n\nKita akan memecah jaringan ini menjadi ${flsmPlan.actualSubnetCount} blok subnet yang ukurannya sama persis.\n\nSilakan klik tombol "Hitung" untuk mulai menentukan IP untuk Subnet 1.`;
            const speech = `Persiapan selesai! Sesuai aturan Ef El Es Em, jaringan ini akan dipecah menjadi ${flsmPlan.actualSubnetCount} blok yang ukurannya sama rata. Silakan klik tombol hitung di bawah untuk mulai menentukan rentang Ai Pi nya.`;
            playNarration(display, speech);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSimulating, currentIdx, calculationData, initialMode, flsmPlan]);

    // 2. Narasi saat Pop-Up Perhitungan atau Selesai
    useEffect(() => {
        if (initialMode === 'manual' && isSimulating && flsmPlan) {
            if (calculationData) {
                const display = `Saat ini kamu sedang mencari rentang IP untuk ${calculationData.name}.\n\nKerjakan perhitungan di layar dengan cermat.`;
                const speech = `Sekarang kita akan menghitung blok untuk ${calculationData.name}. Silakan ikuti panduan rumus Ef El Es Em di layar dengan cermat ya.`;
                playNarration(display, speech);
            } else if (currentIdx > 0 && currentIdx < flsmPlan.actualSubnetCount) {
                const nextName = config?.custom_labels?.[currentIdx] ? config.custom_labels[currentIdx] : `Subnet #${currentIdx + 1}`;
                const display = `Blok subnet sebelumnya berhasil ditambahkan ke topologi!\n\nSelanjutnya, mari kita cari rentang IP untuk ${nextName}.`;
                const speech = `Kerja bagus! Blok Ai Pi berhasil dipetakan. Selanjutnya, klik hitung lagi untuk mencari rentang Ai Pi ${nextName}.`;
                playNarration(display, speech);
            } else if (isFinished) {
                const display = `Luar Biasa! 🎉\nSeluruh blok subnet berhasil dialokasikan menggunakan metode FLSM.\n\nSentuh balok diagram untuk melihat detail akhir subnetnya.`;
                const speech = `Luar biasa! Seluruh blok subnet telah berhasil dibagi rata. Kamu bisa menyentuh grafik blok disamping untuk melihat detail subnet akhirnya.`;
                playNarration(display, speech);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [calculationData, currentIdx, isFinished, initialMode, flsmPlan]);

    const startSimulation = () => {
        try {
            hasTriggeredComplete.current = false;
            const [ip, prefixStr] = networkInput.split('/');
            const masterPrefix = parseInt(prefixStr);
            const masterLong = ipToLong(ip);
            const masterTotalHosts = Math.pow(2, 32 - masterPrefix);
            setTotalHostsMaster(masterTotalHosts);

            const neededSubnets = parseInt(subnetCountReq);
            const borrowedBits = Math.ceil(Math.log2(neededSubnets));
            const newPrefix = masterPrefix + borrowedBits;
            const actualSubnetCount = Math.pow(2, borrowedBits);
            const blockSize = Math.pow(2, 32 - newPrefix);

            setFlsmPlan({ masterPrefix, masterLong, borrowedBits, newPrefix, actualSubnetCount, blockSize, neededSubnets });

            setSubnets([]);
            setCurrentIdx(0);
            setCalculationData(null);
            setHoveredBlock(null);
            setIsSimulating(true);

            if (initialMode === 'auto') {
                setAutoPlay(true);
                setPhase('INTRO');
                setSubPhaseIdx(0);
            } else {
                setPhase('IDLE');
            }
        } catch (e) {
            alert("Input Network tidak valid! Gunakan format x.x.x.x/xx");
        }
    };

    const calculateSubnet = (idx) => {
        const currentIpLong = flsmPlan.masterLong + (idx * flsmPlan.blockSize);
        const customLabels = config?.custom_labels || [];
        const subnetName = customLabels[idx] ? customLabels[idx] : `Subnet #${idx + 1}`;

        return {
            name: subnetName,
            hosts: flsmPlan.blockSize - 2,
            needed: flsmPlan.blockSize,
            hostBits: 32 - flsmPlan.newPrefix,
            blockSize: flsmPlan.blockSize,
            prefix: flsmPlan.newPrefix,
            newPrefix: flsmPlan.newPrefix,
            networkId: longToIp(currentIpLong),
            broadcastId: longToIp(currentIpLong + flsmPlan.blockSize - 1),
            rangeStart: longToIp(currentIpLong + 1),
            rangeEnd: longToIp(currentIpLong + flsmPlan.blockSize - 2),
            hostsAvailable: flsmPlan.blockSize,
            borrowedBits: flsmPlan.borrowedBits,
        };
    };

    const nextStep = () => {
        if (calculationData) {
            setSubnets(prev => [...prev, { ...calculationData, isUnused: false }]);
            setCalculationData(null);

            const nextIdx = currentIdx + 1;
            setCurrentIdx(nextIdx);

            if (nextIdx >= flsmPlan.actualSubnetCount) {
                setTimeout(() => {
                    if (!hasTriggeredComplete.current) {
                        hasTriggeredComplete.current = true;
                        if (onGameComplete) onGameComplete();
                        else if (onComplete) onComplete();
                    }
                }, 800);
            }
            return;
        }
        if (!flsmPlan || currentIdx >= flsmPlan.actualSubnetCount) return;

        const calcData = calculateSubnet(currentIdx);
        const decMask = getDecMask(flsmPlan.newPrefix);
        calcData.customMessage = `Prefix baru: /${flsmPlan.newPrefix} (${decMask})`;

        setCalculationData(calcData);
    };

    const reset = () => {
        hasTriggeredComplete.current = false;
        setIsSimulating(false); setSubnets([]); setCurrentIdx(0); setCalculationData(null); setFlsmPlan(null); setHoveredBlock(null);
        setPhase('IDLE'); setSubPhaseIdx(0); setFullStr(""); setDisplayStr(""); setCharIdx(0); setIsTyping(false); setIsSpeaking(false);
        window.speechSynthesis && window.speechSynthesis.cancel();
    };

    const getNextButtonLabel = () => {
        const customLabels = config?.custom_labels || [];
        const nextName = customLabels[currentIdx] ? customLabels[currentIdx] : `Subnet #${currentIdx + 1}`;
        return `Hitung ${nextName}`;
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 relative transition-colors duration-300">
            {/* === TOOLBAR === */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-2 md:px-6 md:py-4 shadow-sm z-20 flex flex-col md:flex-row gap-2 md:gap-6 items-start md:items-center justify-between shrink-0 transition-colors">

                <div className="flex flex-row gap-1.5 md:gap-4 items-end w-full md:w-auto flex-1">
                    <div className="flex-1 md:w-48">
                        <label className="block text-[8px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-0.5 md:mb-1">Network Induk</label>
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg md:rounded-xl overflow-hidden focus-within:border-net-blue dark:focus-within:border-cyan-500 transition bg-slate-50 dark:bg-slate-900 h-8 md:h-10">
                            <div className="bg-slate-100 dark:bg-slate-800 px-2 md:px-3 py-1.5 md:py-2 text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 transition-colors">
                                <FaNetworkWired size={10} className="md:w-4 md:h-4"/>
                            </div>
                            <input
                                value={networkInput}
                                onChange={e => setNetworkInput(e.target.value)}
                                disabled={isSimulating}
                                className="w-full border-none px-2 md:px-3 py-1 font-mono text-[10px] md:text-sm focus:ring-0 bg-transparent text-slate-700 dark:text-slate-200 disabled:opacity-50"
                                placeholder="192.168.10.0/24"
                            />
                        </div>
                    </div>
                    <div className="w-[65px] sm:w-32 shrink-0">
                         <label className="block text-[8px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-0.5 md:mb-1">Subnet</label>
                         <select
                            value={subnetCountReq} onChange={e => setSubnetCountReq(e.target.value)} disabled={isSimulating}
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg md:rounded-xl px-1.5 md:px-3 font-mono text-[10px] md:text-sm h-8 md:h-10 focus:ring-net-blue dark:focus:ring-cyan-500 focus:border-net-blue dark:focus:border-cyan-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 cursor-pointer transition-colors"
                        >
                            <option value="2">2 Blok</option>
                            <option value="4">4 Blok</option>
                            <option value="8">8 Blok</option>
                            <option value="16">16 Blok</option>
                        </select>
                    </div>

                    {!isSimulating && (
                         <div className="shrink-0">
                             <button onClick={startSimulation} className="h-8 md:h-10 bg-gradient-to-r from-net-blue to-blue-600 dark:from-cyan-600 dark:to-blue-600 text-white px-3 md:px-6 rounded-lg md:rounded-xl font-bold text-[10px] md:text-sm shadow-md shadow-blue-100 dark:shadow-cyan-900/30 hover:scale-105 transition flex items-center justify-center gap-1.5">
                                <FaPlay size={8} className="md:w-3 md:h-3"/>
                                <span className="hidden sm:inline">{initialMode === 'auto' ? 'Play Demo' : 'Mulai Hitung'}</span>
                                <span className="sm:hidden">Mulai</span>
                            </button>
                         </div>
                    )}
                </div>

                {isSimulating && (
                    <div className="flex gap-1.5 w-full md:w-auto justify-end shrink-0 z-50">
                        {initialMode === 'auto' && phase !== 'DONE' && phase !== 'FINISHED' && (
                            <button
                                onClick={() => setAutoPlay(!autoPlay)}
                                className="flex-1 md:flex-none h-8 md:h-10 px-3 md:px-4 rounded-lg md:rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] md:text-sm flex items-center justify-center gap-1.5 transition-colors"
                            >
                                {autoPlay ? <><FaPause size={8} className="md:w-3 md:h-3"/> Pause</> : <><FaPlay size={8} className="md:w-3 md:h-3"/> Lanjut</>}
                            </button>
                        )}
                        <button onClick={reset} className="flex-1 md:flex-none h-8 md:h-10 px-3 md:px-4 rounded-lg md:rounded-xl font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-[10px] md:text-sm border border-red-100 dark:border-red-800 transition-colors flex items-center justify-center gap-1.5">
                            <FaRedo size={8} className="md:w-3 md:h-3"/> Reset
                        </button>
                    </div>
                )}
            </div>

            {/* === CONTENT AREA === */}
            <div className="flex-1 relative overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">

                {!isSimulating && (
                     <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 z-0 p-8 text-center">
                         <div className="w-20 h-20 md:w-24 md:h-24 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-lg shadow-slate-200 dark:shadow-slate-900 border border-slate-100 dark:border-slate-700 mb-6 rotate-6 anim-float transition-colors">
                            <FaProjectDiagram size={40} className="text-net-blue dark:text-cyan-500 opacity-50"/>
                         </div>
                         <h3 className="text-lg md:text-xl font-bold text-slate-700 dark:text-slate-300 mb-1">Simulator FLSM</h3>
                         <p className="text-[10px] md:text-sm opacity-80 max-w-sm">{config?.instruction || "Pilih jumlah subnet, sistem akan membaginya rata."}</p>
                     </div>
                )}

                <AnimatePresence mode='wait'>
                    {calculationData && initialMode === 'manual' && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 md:p-6 touch-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 max-h-[80dvh] flex flex-col"
                            >
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    <MathStepCard stepData={calculationData} />
                                </div>
                                <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shrink-0">
                                    <button onClick={nextStep} className="w-full bg-net-blue dark:bg-cyan-600 text-white py-2.5 md:py-3.5 rounded-xl font-bold text-sm md:text-base shadow-md hover:bg-blue-600 dark:hover:bg-cyan-500 transition active:scale-95 flex items-center justify-center gap-2">
                                        Terapkan {calculationData.name} <FaCheckCircle />
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {isSimulating && (
                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar flex flex-col transition-colors pb-32">
                        <div className="p-3 md:p-6 flex flex-col lg:flex-row flex-1 min-h-max gap-4 md:gap-6">

                            {initialMode === 'auto' ? (
                                <>
                                    <div className="flex-1 relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden min-h-[400px] lg:min-h-0 flex flex-col touch-none z-10">
                                        <NetworkTopologyGraph allocations={subnets} masterNetwork={networkInput} />
                                        {(phase === 'FINISHED' || phase === 'DONE') && (
                                            <div className="absolute top-4 right-4 z-10 bg-green-100 dark:bg-green-900/80 border border-green-500 text-green-700 dark:text-green-300 px-4 py-2 rounded-full font-bold text-xs shadow-sm flex items-center gap-1.5 animate-fade-in-up">
                                                <FaCheckCircle className="shrink-0"/> Simulasi Selesai
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-full lg:w-[320px] xl:w-[380px] flex flex-col gap-4 md:gap-6 shrink-0 z-20">
                                        <AnimatePresence mode='wait'>
                                            {displayStr && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                                    className="flex flex-row items-end gap-3 mb-2 w-full shrink-0"
                                                >
                                                    <div className="relative flex-1 bg-white dark:bg-slate-800 p-3 md:p-4 rounded-2xl rounded-br-none shadow-xl border border-slate-200 dark:border-slate-700 overflow-visible">
                                                        <div className="absolute -right-[6px] bottom-0 w-3 h-3 bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700 transform rotate-45 rounded-br-sm z-0"></div>
                                                        <div className="flex justify-between items-center mb-2 border-b border-slate-100 dark:border-slate-700 pb-2 relative z-10">
                                                            <span className="text-[9px] md:text-[10px] font-black text-blue-600 dark:text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                                                                <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-green-500 animate-ping' : 'bg-green-500'}`}></span> NetBot
                                                            </span>
                                                            <button onClick={toggleSound} className={`text-[8px] md:text-[9px] p-1.5 rounded-full font-bold transition-colors border flex items-center justify-center shrink-0 ${soundEnabled ? 'bg-blue-100 border-blue-200 text-blue-700 dark:bg-cyan-900/50 dark:border-cyan-800 dark:text-cyan-400' : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-700 dark:border-slate-600'}`}>
                                                                {soundEnabled ? <FaVolumeUp size={10} /> : <FaVolumeMute size={10} />}
                                                            </button>
                                                        </div>
                                                        <div className="text-[10px] md:text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-line relative z-10 min-h-[50px]">
                                                            {displayStr}
                                                            {isTyping && <span className="animate-pulse bg-blue-500 w-1 h-3 inline-block ml-0.5 align-middle"></span>}
                                                        </div>
                                                    </div>
                                                    <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 relative">
                                                        <div className="absolute inset-0 bg-blue-400 dark:bg-cyan-500 blur-xl opacity-20 rounded-full scale-110"></div>
                                                        <img src="/images/maskotInVisualizer.png" alt="NetBot" className={`w-full relative z-10 drop-shadow-xl ${isSpeaking ? 'anim-breathe' : 'anim-float'}`} />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="flex-1 bg-white dark:bg-slate-800 flex flex-col border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden min-h-[250px] lg:min-h-0">
                                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between shrink-0">
                                                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5">
                                                    <FaTable className="text-net-blue dark:text-cyan-500 shrink-0"/> Log Pemotongan
                                                </h4>
                                                <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500 dark:text-slate-300">
                                                    {subnets.length} / {flsmPlan?.actualSubnetCount}
                                                </span>
                                            </div>
                                            <div className="flex-1 overflow-auto custom-scrollbar bg-white dark:bg-slate-800">
                                                <table className="w-full text-left text-[10px] sm:text-xs">
                                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold sticky top-0 z-10 shadow-sm">
                                                        <tr><th className="px-3 py-2 whitespace-nowrap">Subnet</th><th className="px-3 py-2 whitespace-nowrap text-right">Network ID</th></tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                                        {subnets.length === 0 && (
                                                            <tr><td colSpan="2" className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 italic text-xs">Menunggu AI...</td></tr>
                                                        )}
                                                        {subnets.map((sub, idx) => (
                                                            <motion.tr key={idx} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors cursor-default">
                                                                <td className="px-3 py-2 font-bold text-slate-700 dark:text-slate-300 border-l-4 border-transparent hover:border-net-blue whitespace-nowrap flex flex-col gap-0.5 transition-colors">
                                                                    <span>{sub.name}</span><span className="font-mono font-normal text-net-blue dark:text-cyan-400 text-[10px]">/{sub.prefix}</span>
                                                                </td>
                                                                <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-400 text-right whitespace-nowrap">{sub.networkId}</td>
                                                            </motion.tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                // --- MANUAL MODE RENDERER ---
                                <div className="w-full flex flex-col lg:flex-row gap-4 md:gap-6 flex-1">

                                    {/* KIRI: GRAFIK BLOK */}
                                    <div className="flex-1 w-full max-w-6xl mx-auto bg-white dark:bg-slate-800 p-3 md:p-8 rounded-xl md:rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl relative flex flex-col transition-colors shrink-0">
                                        <div className="flex justify-between items-start mb-3 md:mb-6 shrink-0 flex-wrap gap-2">
                                            <div>
                                                <h4 className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Peta Pembagian FLSM</h4>
                                                <div className="text-[10px] md:text-xs font-mono text-slate-400 dark:text-slate-500 mt-0.5 md:mt-1">Total: {totalHostsMaster} IP</div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {!isFinished && !calculationData && (
                                                     <button onClick={nextStep} className="bg-white dark:bg-slate-800 border border-net-blue dark:border-cyan-500 text-net-blue dark:text-cyan-400 px-3 md:px-6 py-1 md:py-2 rounded-full font-bold shadow-sm hover:bg-blue-50 dark:hover:bg-slate-700 transition flex items-center gap-1 md:gap-2 animate-bounce-slow text-[10px] md:text-xs">
                                                        {getNextButtonLabel()} <FaForward className="shrink-0"/>
                                                     </button>
                                                )}
                                                {isFinished && initialMode === 'manual' && (
                                                    <div className="bg-green-100 dark:bg-green-900/80 border border-green-500 text-green-700 dark:text-green-300 px-3 md:px-4 py-1 md:py-1.5 rounded-full font-bold shadow-sm flex items-center gap-1 md:gap-2 text-[10px] md:text-xs">
                                                        <FaCheckCircle className="shrink-0" /> Lab Selesai
                                                    </div>
                                                )}
                                            </div>

                                            <div className="hidden sm:block ml-auto w-full md:w-auto mt-2 md:mt-0">
                                                <AnimatePresence mode='wait'>
                                                    {hoveredBlock ? (
                                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-slate-800 dark:bg-slate-900 text-white px-4 md:px-5 py-2 md:py-3 rounded-xl shadow-lg border border-slate-700 text-[10px] md:text-xs flex gap-4 md:gap-6 items-center">
                                                            <div className="border-r border-slate-600 pr-4 md:pr-6">
                                                                <div className="font-bold text-yellow-400 text-sm md:text-base mb-0.5 truncate max-w-[100px] md:max-w-none">{hoveredBlock.name}</div>
                                                                <div className="font-mono text-[9px] md:text-[10px] text-slate-400">{hoveredBlock.networkId}</div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-x-4 md:gap-x-8 gap-y-0.5 md:gap-y-1 text-[9px] md:text-[11px]">
                                                                <span className="text-slate-400">Prefix: <span className="text-white font-mono font-bold">/{hoveredBlock.prefix}</span></span>
                                                                <span className="text-slate-400">Bcast: <span className="text-white font-mono">{hoveredBlock.broadcastId}</span></span>
                                                                <span className="text-slate-400 col-span-2">Range: <span className="text-blue-300 font-mono font-bold">{hoveredBlock.rangeStart} - {hoveredBlock.rangeEnd}</span></span>
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 italic h-full bg-slate-50 dark:bg-slate-900 px-3 md:px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-800 text-[10px] md:text-xs transition-colors">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse"></div>
                                                            <span>Arahkan kursor ke balok untuk detail.</span>
                                                        </div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        <div className="sm:hidden mb-3 bg-slate-800 dark:bg-slate-900 text-white rounded-lg p-2.5 text-[10px] shrink-0 border border-slate-700 shadow-inner overflow-x-auto custom-scrollbar">
                                            {hoveredBlock ? (
                                                <div className="w-full flex flex-col gap-1.5 min-w-max px-1">
                                                    <div className="flex items-center justify-between border-b border-slate-600 pb-1.5">
                                                        <div className="font-bold text-yellow-400 text-xs">{hoveredBlock.name}</div>
                                                        <div className="font-mono bg-slate-700 px-1.5 py-0.5 rounded text-blue-300 font-bold">/{hoveredBlock.prefix}</div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
                                                        <span className="text-slate-400">Network:<br/><span className="text-white">{hoveredBlock.networkId}</span></span>
                                                        <span className="text-slate-400">Broadcast:<br/><span className="text-white">{hoveredBlock.broadcastId}</span></span>
                                                        <span className="text-slate-400 col-span-2 mt-0.5">Usable Range:<br/><span className="text-blue-300 font-bold">{hoveredBlock.rangeStart} - {hoveredBlock.rangeEnd}</span></span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-slate-400 italic text-center w-full py-4">Sentuh balok di bawah untuk detail lengkap</div>
                                            )}
                                        </div>

                                        <div className="w-full bg-slate-100 dark:bg-slate-900/50 rounded-xl md:rounded-2xl overflow-x-auto overflow-y-hidden border border-slate-200 dark:border-slate-700 relative shadow-inner custom-scrollbar transition-colors h-[250px] md:h-[400px] shrink-0">
                                            <div className="flex items-end h-full pb-1 px-1 gap-0.5 min-w-max w-full">
                                                <AnimatePresence>
                                                    {subnets.map((subnet, index) => (
                                                        <SubnetBlock key={index} data={subnet} totalHosts={totalHostsMaster} index={index} onHover={setHoveredBlock} />
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>

                                    {/* KANAN: PESAN NETBOT & TABEL LOG */}
                                    <div className="w-full lg:w-[320px] xl:w-[380px] flex flex-col gap-4 md:gap-6 shrink-0 z-20 h-full">

                                        <AnimatePresence mode='wait'>
                                            {displayStr && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                                    className="flex flex-row items-end gap-3 w-full shrink-0"
                                                >
                                                    <div className="relative flex-1 bg-white dark:bg-slate-800 p-3 md:p-4 rounded-2xl rounded-br-none shadow-xl border border-slate-200 dark:border-slate-700 overflow-visible">
                                                        <div className="absolute -right-[6px] bottom-0 w-3 h-3 bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700 transform rotate-45 rounded-br-sm z-0"></div>
                                                        <div className="flex justify-between items-center mb-2 border-b border-slate-100 dark:border-slate-700 pb-2 relative z-10">
                                                            <span className="text-[9px] md:text-[10px] font-black text-blue-600 dark:text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                                                                <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-green-500 animate-ping' : 'bg-green-500'}`}></span> NetBot
                                                            </span>
                                                            <button onClick={toggleSound} className={`text-[8px] md:text-[9px] p-1.5 rounded-full font-bold transition-colors border flex items-center justify-center shrink-0 ${soundEnabled ? 'bg-blue-100 border-blue-200 text-blue-700 dark:bg-cyan-900/50 dark:border-cyan-800 dark:text-cyan-400' : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-700 dark:border-slate-600'}`}>
                                                                {soundEnabled ? <FaVolumeUp size={10} /> : <FaVolumeMute size={10} />}
                                                            </button>
                                                        </div>
                                                        <div className="text-[10px] md:text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-line relative z-10 min-h-[50px]">
                                                            {displayStr}
                                                            {isTyping && <span className="animate-pulse bg-blue-500 w-1 h-3 inline-block ml-0.5 align-middle"></span>}
                                                        </div>
                                                    </div>
                                                    <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 relative">
                                                        <div className="absolute inset-0 bg-blue-400 dark:bg-cyan-500 blur-xl opacity-20 rounded-full scale-110"></div>
                                                        <img src="/images/maskotInVisualizer.png" alt="NetBot" className={`w-full relative z-10 drop-shadow-xl ${isSpeaking ? 'anim-breathe' : 'anim-float'}`} />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* TABEL LOG FLSM (Pengisi Ruang Kosong) */}
                                        <div className="flex-1 bg-white dark:bg-slate-800 flex flex-col border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden min-h-[200px]">
                                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between shrink-0">
                                                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5">
                                                    <FaTable className="text-net-blue dark:text-cyan-500 shrink-0"/> Log Rekapitulasi
                                                </h4>
                                                <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500 dark:text-slate-300">
                                                    {subnets.length} / {flsmPlan?.actualSubnetCount}
                                                </span>
                                            </div>
                                            <div className="flex-1 overflow-auto custom-scrollbar bg-white dark:bg-slate-800">
                                                <table className="w-full text-left text-[10px] sm:text-xs">
                                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold sticky top-0 z-10 shadow-sm">
                                                        <tr><th className="px-3 py-2 whitespace-nowrap">Subnet</th><th className="px-3 py-2 whitespace-nowrap text-right">Network ID</th></tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                                        {subnets.length === 0 && (
                                                            <tr><td colSpan="2" className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 italic text-xs">Belum ada blok yang dihitung.</td></tr>
                                                        )}
                                                        {subnets.map((sub, idx) => (
                                                            <motion.tr key={idx} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors cursor-default">
                                                                <td className="px-3 py-2 font-bold text-slate-700 dark:text-slate-300 border-l-4 border-transparent hover:border-net-blue whitespace-nowrap flex flex-col gap-0.5 transition-colors">
                                                                    <span>{sub.name}</span>
                                                                    <span className="font-mono font-normal text-net-blue dark:text-cyan-400 text-[10px]">/{sub.prefix}</span>
                                                                </td>
                                                                <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-400 text-right whitespace-nowrap">{sub.networkId}</td>
                                                            </motion.tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
                .anim-float { animation: float 3s ease-in-out infinite; }
                @keyframes breathe { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
                .anim-breathe { animation: breathe 1.5s ease-in-out infinite; }
            `}</style>
        </div>
    );
}
