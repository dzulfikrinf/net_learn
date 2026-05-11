import React, { useState, useEffect, useRef } from 'react';
import { ipToLong, longToIp } from "@/lib/ipUtils";
import SubnetBlock from './SubnetBlock';
import MathStepCard from './MathStepCard';
import NetworkTopologyGraph from './NetworkTopologyGraph';
import { FaPlay, FaForward, FaRedo, FaPlus, FaTrash, FaPause, FaProjectDiagram, FaNetworkWired, FaCheckCircle, FaTable, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

export default function VlsmVisualizer({ initialMode = 'manual', data, onComplete, onGameComplete }) {
    const config = typeof data === 'string' ? JSON.parse(data) : data;

    const [networkInput, setNetworkInput] = useState(config?.default_network || "192.168.10.0/24");

    const defaultReqs = [
        { id: 1, name: "Lab RPL", hosts: 60 },
        { id: 2, name: "Guru", hosts: 12 },
        { id: 3, name: "Server", hosts: 5 },
    ];

    const [requirements, setRequirements] = useState(() => {
        if (config?.requirements) {
            return config.requirements.map((req, index) => ({
                id: index + 1,
                name: req.name,
                hosts: req.hosts
            }));
        }
        return defaultReqs;
    });

    const [isSimulating, setIsSimulating] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [sortedReqs, setSortedReqs] = useState([]);
    const [allocatedBlocks, setAllocatedBlocks] = useState([]);
    const [totalHostsMaster, setTotalHostsMaster] = useState(0);
    const [nextAvailableIp, setNextAvailableIp] = useState(null);
    const [calculationData, setCalculationData] = useState(null);
    const [hoveredBlock, setHoveredBlock] = useState(null);
    const [autoPlay, setAutoPlay] = useState(initialMode === 'auto');
    const [vlsmPlanBlocks, setVlsmPlanBlocks] = useState([]);

    const [soundEnabled, setSoundEnabled] = useState(true);
    const [phase, setPhase] = useState('IDLE');
    const [subPhaseIdx, setSubPhaseIdx] = useState(0);

    const [fullStr, setFullStr] = useState("");
    const [displayStr, setDisplayStr] = useState("");
    const [charIdx, setCharIdx] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const hasTriggeredComplete = useRef(false);

    const isFinished = isSimulating && currentStep >= sortedReqs.length && (phase === 'FINISHED' || phase === 'DONE' || initialMode === 'manual');

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
            .replace(/-/g, ' sampai dengan ')
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
        if (phase === "INTRO") setPhase("SORTING");
        else if (phase === "SORTING") {
            setPhase("SUBNET");
            setSubPhaseIdx(0);
        }
        else if (phase === "SUBNET") {
            if (subPhaseIdx + 1 < vlsmPlanBlocks.length) {
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
        if (!isSimulating || !autoPlay || vlsmPlanBlocks.length === 0 || initialMode === 'manual') return;

        if (phase === 'INTRO') {
            const display = `Studi Kasus:\nKita akan membagi network induk ${networkInput}\nmenggunakan metode dinamis (VLSM) agar penggunaan IP lebih efisien!`;
            const speech = `Studi Kasus. Kita akan membagi network induk ${formatForTTS(networkInput)}, menggunakan metode dinamis atau Fi El Es Em, agar penggunaan Ai Pi lebih hemat dan efisien!`;
            playNarration(display, speech);
        }
        else if (phase === 'SORTING') {
            const reqNames = sortedReqs.map(r => `${r.name} (${r.hosts})`).join(', ');
            const reqNamesSpeech = sortedReqs.map(r => `${r.name} dengan ${r.hosts} host`).join(', kemudian ');
            const display = `Langkah 1: Mengurutkan Kebutuhan\n\nSyarat utama VLSM: Alokasi dimulai dari kebutuhan host terbesar ke terkecil.\n\nUrutan: ${reqNames}`;
            const speech = `Langkah 1. Mengurutkan kebutuhan. Syarat utama perhitungan Fi El Es Em adalah, alokasi harus dimulai dari kebutuhan host terbesar ke yang paling kecil. Urutan kita sekarang adalah: ${reqNamesSpeech}.`;
            playNarration(display, speech);
        }
        else if (phase === 'SUBNET') {
            const calcData = vlsmPlanBlocks[subPhaseIdx];

            setAllocatedBlocks(prev => {
                if (prev.some(s => s.name === calcData.name)) return prev;
                return [...prev, { ...calcData, isUnused: false }];
            });
            setCurrentStep(subPhaseIdx + 1);
            setNextAvailableIp(ipToLong(calcData.broadcastId) + 1);

            const titleDisplay = subPhaseIdx === 0 ? "Langkah 2: Alokasi VLSM\n\n" : "";
            const display = `${titleDisplay}Alokasi: ${calcData.name}\nButuh: ${calcData.hosts} host\nDiberi: Blok kapasitas ${calcData.blockSize} IP (/${calcData.prefix})\nNetwork ID: ${calcData.networkId}`;

            const titleSpeech = subPhaseIdx === 0 ? "Langkah 2. Alokasi per departemen. " : "Lanjut ke ";
            const speech = subPhaseIdx === 0
                ? `${titleSpeech}Departemen ${calcData.name} butuh ${calcData.hosts} host. Diberikan blok berkapasitas ${calcData.blockSize} Ai Pi, dengan prefix slash ${calcData.prefix}. Untuk detail Network dan Range Ai Pi nya, silakan perhatikan tabel di sebelah kanan ya.`
                : `${titleSpeech}departemen ${calcData.name}. Butuh ${calcData.hosts} host, maka diberikan blok berkapasitas ${calcData.blockSize} Ai Pi, dengan prefix slash ${calcData.prefix}.`;

            playNarration(display, speech);
        }
        else if (phase === 'FINISHED') {
            const display = `Yeay Selesai! 🎉\nMetode VLSM berhasil mengalokasikan seluruh IP secara ketat tanpa banyak sisa yang terbuang.\nSentuh diagram blok untuk melihat detailnya!`;
            const speech = `Yey Selesai! Metode Fi El Es Em berhasil mengalokasikan seluruh Ai Pi secara ketat tanpa banyak sisa yang terbuang. Kamu bisa menggeser grafik disamping untuk melihat detail lengkapnya!`;
            playNarration(display, speech);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, subPhaseIdx]);

    // --- NARASI MANUAL MODE (BARU) ---
    // 1. Narasi saat baru klik "Mulai Hitung"
    useEffect(() => {
        if (initialMode === 'manual' && isSimulating && currentStep === 0 && !calculationData) {
            const reqNames = sortedReqs.map(r => `${r.name} (${r.hosts})`).join(', ');
            const reqNamesSpeech = sortedReqs.map(r => `${r.name}`).join(', lalu ');

            const display = `Bagus! Sistem telah mengurutkan kebutuhan dari yang terbesar ke terkecil.\n\nUrutan: ${reqNames}\n\nSilakan klik tombol "Hitung" untuk memecahkan blok IP per departemen.`;
            const speech = `Bagus! Sesuai aturan Fi El Es Em, sistem telah mengurutkan departemen dari kebutuhan terbesar. Yaitu: ${reqNamesSpeech}. Sekarang, silakan klik tombol hitung di bawah untuk mulai memecahkan blok Ai Pi nya.`;

            playNarration(display, speech);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSimulating, currentStep, calculationData, initialMode]);

    // 2. Narasi saat Pop-Up Perhitungan (MathStepCard) muncul atau selesai
    useEffect(() => {
        if (initialMode === 'manual' && isSimulating) {
            if (calculationData) {
                // Saat Pop-up MathStepCard Muncul
                const display = `Saat ini kamu sedang menghitung blok untuk departemen ${calculationData.name}.\n\nKerjakan perhitungan di layar dengan teliti.`;
                const speech = `Sekarang giliran departemen ${calculationData.name}. Silakan ikuti panduan dan kerjakan perhitungan Fi El Es Em nya dengan teliti ya.`;
                playNarration(display, speech);
            } else if (currentStep > 0 && currentStep < sortedReqs.length) {
                // Saat Pop-up ditutup dan siap lanjut ke departemen berikutnya
                const nextDept = sortedReqs[currentStep]?.name;
                const display = `Perhitungan blok sebelumnya berhasil diterapkan ke topologi!\n\nSelanjutnya, mari kita hitung blok untuk departemen ${nextDept}.`;
                const speech = `Mantap! Blok berhasil dialokasikan ke topologi. Selanjutnya, klik hitung lagi untuk departemen ${nextDept}.`;
                playNarration(display, speech);
            } else if (isFinished) {
                 // Saat semua selesai
                const display = `Luar Biasa! 🎉\nSeluruh departemen berhasil dialokasikan menggunakan metode VLSM.\n\nSentuh balok diagram untuk melihat detail akhir topologinya.`;
                const speech = `Luar Biasa! Seluruh departemen telah mendapatkan jatah Ai Pi yang pas. Kamu bisa menyentuh grafik blok disamping untuk melihat detail topologi akhirnya.`;
                playNarration(display, speech);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [calculationData, currentStep, isFinished, initialMode]);


    const handleReqChange = (id, field, val) => {
        setRequirements(prev => prev.map(r => r.id === id ? { ...r, [field]: field === 'hosts' ? parseInt(val)||0 : val } : r));
    };
    const addReq = () => setRequirements(prev => [...prev, { id: Date.now(), name: '', hosts: 0 }]);
    const removeReq = (id) => setRequirements(prev => prev.filter(r => r.id !== id));

    const startSimulation = () => {
        try {
            hasTriggeredComplete.current = false;
            const [ip, prefixStr] = networkInput.split('/');
            const masterLong = ipToLong(ip);
            setTotalHostsMaster(Math.pow(2, 32 - parseInt(prefixStr)));

            const rawFiltered = [...requirements].filter(r => r.hosts > 0);
            const sorted = [...requirements].filter(r => r.hosts > 0).sort((a, b) => b.hosts - a.hosts);
            setSortedReqs(sorted);

            let currentIpLong = masterLong;
            const preCalculatedBlocks = [];

            sorted.forEach(req => {
                const needed = req.hosts + 2;
                const hostBits = Math.ceil(Math.log2(needed));
                const newPrefix = 32 - hostBits;
                const blockSize = Math.pow(2, hostBits);
                const networkIdLong = currentIpLong;
                const broadcastIdLong = networkIdLong + blockSize - 1;

                preCalculatedBlocks.push({
                    name: req.name,
                    hosts: req.hosts,
                    needed,
                    hostBits,
                    blockSize,
                    prefix: newPrefix,
                    newPrefix,
                    networkId: longToIp(networkIdLong),
                    broadcastId: longToIp(broadcastIdLong),
                    rangeStart: longToIp(networkIdLong + 1),
                    rangeEnd: longToIp(broadcastIdLong - 1),
                    hostsAvailable: blockSize,
                });

                currentIpLong = broadcastIdLong + 1;
            });

            if (preCalculatedBlocks.length > 0) {
                preCalculatedBlocks[0].isFirstStep = true;
                preCalculatedBlocks[0].rawReqs = rawFiltered;
                preCalculatedBlocks[0].sortedReqs = sorted;
            }

            setVlsmPlanBlocks(preCalculatedBlocks);
            setNextAvailableIp(masterLong);
            setAllocatedBlocks([]);
            setCurrentStep(0);
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
            alert("Input Network error. Gunakan format x.x.x.x/xx");
        }
    };

    const nextStep = () => {
        if (calculationData) {
            setAllocatedBlocks(prev => [...prev, { ...calculationData, isUnused: false }]);
            setNextAvailableIp(ipToLong(calculationData.broadcastId) + 1);
            setCalculationData(null);

            const nextIdx = currentStep + 1;
            setCurrentStep(nextIdx);

            if (nextIdx >= vlsmPlanBlocks.length) {
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
        if (currentStep >= vlsmPlanBlocks.length) return;
        setCalculationData(vlsmPlanBlocks[currentStep]);
    };

    const reset = () => {
        hasTriggeredComplete.current = false;
        setIsSimulating(false); setAllocatedBlocks([]); setCurrentStep(0); setNextAvailableIp(null); setCalculationData(null); setHoveredBlock(null);
        setPhase('IDLE'); setSubPhaseIdx(0); setFullStr(""); setDisplayStr(""); setCharIdx(0); setIsTyping(false); setIsSpeaking(false);
        window.speechSynthesis && window.speechSynthesis.cancel();
    };

    const calculateUnusedBlock = () => {
        if (!isSimulating || nextAvailableIp === null) return null;
        try {
            const [masterIp, masterPrefixStr] = networkInput.split('/');
            const masterStartLong = ipToLong(masterIp);
            const masterSize = Math.pow(2, 32 - parseInt(masterPrefixStr));
            const masterEndLong = masterStartLong + masterSize - 1;
            const remainingHosts = masterEndLong - nextAvailableIp + 1;
            if (remainingHosts <= 0) return null;

            return {
                name: 'Sisa (Unused)', networkId: longToIp(nextAvailableIp), prefix: 'Free',
                rangeStart: longToIp(nextAvailableIp), rangeEnd: longToIp(masterEndLong), broadcastId: longToIp(masterEndLong), hostsAvailable: remainingHosts, isUnused: true
            };
        } catch(e) { return null; }
    };

    const unusedBlock = calculateUnusedBlock();

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 relative transition-colors duration-300">
            {/* === TOOLBAR === */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 md:px-6 md:py-4 shadow-sm z-20 flex flex-col xl:flex-row gap-3 md:gap-6 items-start xl:items-center justify-between shrink-0 transition-colors">
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center flex-1 w-full">
                    <div className="w-full md:w-48 shrink-0">
                        <label className="block text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-0.5 md:mb-1">Network Induk</label>
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg md:rounded-xl overflow-hidden focus-within:border-net-teal dark:focus-within:border-teal-500 transition bg-slate-50 dark:bg-slate-900 h-8 md:h-10">
                            <div className="bg-slate-100 dark:bg-slate-800 px-2.5 md:px-3 py-1.5 md:py-2 text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 transition-colors">
                                <FaNetworkWired size={12} className="md:w-4 md:h-4"/>
                            </div>
                            <input
                                value={networkInput}
                                onChange={e => setNetworkInput(e.target.value)}
                                disabled={isSimulating}
                                className="w-full border-none px-2.5 md:px-3 py-1 font-mono text-[11px] md:text-sm focus:ring-0 bg-transparent text-slate-700 dark:text-slate-200 disabled:opacity-50"
                                placeholder="192.168.10.0/24"
                            />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 w-full overflow-x-auto pb-1 custom-scrollbar">
                        <label className="block text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-0.5 md:mb-1 flex gap-2 items-center min-w-max">
                            Kebutuhan Host
                            {!isSimulating && (
                                <button onClick={addReq} className="text-net-teal dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold transition-colors flex items-center gap-1 border border-teal-100 dark:border-teal-800">
                                    <FaPlus size={8}/> Tambah
                                </button>
                            )}
                        </label>
                        <div className="flex gap-2 min-w-max">
                            {requirements.map((r, i) => {
                                const colors = ['blue', 'teal', 'purple'];
                                const color = colors[i % 3];
                                return (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key={r.id}
                                        className={`flex-shrink-0 flex items-center gap-1 px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border transition-all w-32 md:w-40 relative group h-8 md:h-10
                                            ${isSimulating ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60' : `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm hover:border-${color}-400 dark:hover:border-${color}-500`}
                                        `}
                                    >
                                        <input
                                            value={r.name} onChange={e => handleReqChange(r.id, 'name', e.target.value)} disabled={isSimulating}
                                            className="w-full bg-transparent border-none text-[10px] md:text-xs font-bold focus:ring-0 px-0 p-0 text-slate-700 dark:text-slate-200 disabled:opacity-80" placeholder="Nama"
                                        />
                                        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                        <input
                                            type="number" value={r.hosts} onChange={e => handleReqChange(r.id, 'hosts', e.target.value)} disabled={isSimulating}
                                            className="w-8 md:w-10 bg-transparent border-none p-0 text-[10px] md:text-xs text-center focus:ring-0 font-mono text-net-teal dark:text-teal-400 font-bold disabled:opacity-80"
                                        />
                                        <span className="text-[8px] md:text-[9px] text-slate-400 dark:text-slate-500">PC</span>
                                        {!isSimulating && (
                                            <button onClick={() => removeReq(r.id)} className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-red-100 dark:bg-red-900/80 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-700 rounded-full p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-200 dark:hover:bg-red-800">
                                                <FaTrash size={8}/>
                                            </button>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 shrink-0 w-full xl:w-auto justify-end mt-1 xl:mt-0 z-50">
                     {!isSimulating ? (
                        <button onClick={startSimulation} className="w-full md:w-auto h-8 md:h-10 bg-gradient-to-r from-net-teal to-teal-500 dark:from-teal-600 dark:to-teal-500 text-white px-6 rounded-lg md:rounded-xl font-bold text-xs md:text-sm shadow-md shadow-teal-200 dark:shadow-teal-900/30 hover:scale-105 transition flex items-center justify-center gap-1.5">
                            <FaPlay size={10} className="md:w-3 md:h-3"/>
                            <span className="hidden sm:inline">{initialMode === 'auto' ? 'Play Demo' : 'Mulai Hitung'}</span>
                            <span className="sm:hidden">Mulai</span>
                        </button>
                    ) : (
                        <div className="flex gap-2 w-full md:w-auto">
                            {initialMode === 'auto' && phase !== 'DONE' && phase !== 'FINISHED' && (
                                <button onClick={() => setAutoPlay(!autoPlay)} className="flex-1 md:flex-none h-8 md:h-10 px-4 rounded-lg md:rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs md:text-sm flex items-center justify-center gap-1.5 transition-colors">
                                    {autoPlay ? <><FaPause size={8} className="md:w-3 md:h-3"/> Pause</> : <><FaPlay size={8} className="md:w-3 md:h-3"/> Lanjut</>}
                                </button>
                            )}
                            <button onClick={reset} className="flex-1 md:flex-none h-8 md:h-10 px-4 rounded-lg md:rounded-xl font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-xs md:text-sm border border-red-100 dark:border-red-800 transition-colors flex items-center justify-center gap-1.5">
                                <FaRedo size={8} className="md:w-3 md:h-3"/> Reset
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* === CONTENT AREA === */}
            <div className="flex-1 relative overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">

                {!isSimulating && (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 z-0 p-8 text-center">
                         <div className="w-20 h-20 md:w-24 md:h-24 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-lg shadow-slate-200 dark:shadow-slate-900 border border-slate-100 dark:border-slate-700 mb-6 rotate-6 anim-float transition-colors">
                            <FaProjectDiagram size={40} className="text-net-teal dark:text-teal-500 opacity-50"/>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-700 dark:text-slate-300 mb-1">Simulator VLSM</h3>
                        <p className="text-[10px] md:text-sm opacity-80 max-w-sm">{config?.instruction || "Masukkan kebutuhan host, sistem akan mengurutkan dan membaginya secara dinamis."}</p>
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
                                    <button onClick={nextStep} className="w-full bg-net-teal dark:bg-teal-600 text-white py-2.5 md:py-3.5 rounded-xl font-bold text-sm md:text-base shadow-md hover:bg-teal-600 dark:hover:bg-teal-500 transition active:scale-95 flex items-center justify-center gap-2">
                                        Terapkan ke Topologi <FaForward className="shrink-0"/>
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
                                    {/* (Bagian AUTO MODE tetap sama) */}
                                    <div className="flex-1 relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden min-h-[400px] lg:min-h-0 flex flex-col touch-none z-10">
                                        <NetworkTopologyGraph allocations={allocatedBlocks} masterNetwork={networkInput} />
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
                                            {/* Isi log VLSM... */}
                                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between shrink-0">
                                                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5">
                                                    <FaTable className="text-net-teal dark:text-teal-500 shrink-0"/> Log VLSM
                                                </h4>
                                                <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500 dark:text-slate-300">
                                                    {allocatedBlocks.length} blok
                                                </span>
                                            </div>
                                            <div className="flex-1 overflow-auto custom-scrollbar bg-white dark:bg-slate-800">
                                                <table className="w-full text-left text-[10px] sm:text-xs">
                                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold sticky top-0 z-10 shadow-sm">
                                                        <tr><th className="px-3 py-2 whitespace-nowrap">Dept.</th><th className="px-3 py-2 whitespace-nowrap text-right">Network ID</th></tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                                        {allocatedBlocks.length === 0 && (
                                                            <tr><td colSpan="2" className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 italic text-xs">Menunggu AI...</td></tr>
                                                        )}
                                                        {allocatedBlocks.map((block, idx) => (
                                                            <motion.tr key={idx} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="hover:bg-teal-50 dark:hover:bg-slate-700/50 transition-colors cursor-default">
                                                                <td className="px-3 py-2 font-bold text-slate-700 dark:text-slate-300 border-l-4 border-transparent hover:border-net-teal whitespace-nowrap flex flex-col gap-0.5 transition-colors">
                                                                    <span>{block.name}</span>
                                                                    <span className="font-mono font-normal text-net-teal dark:text-teal-400 text-[10px]">/{block.prefix}</span>
                                                                </td>
                                                                <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-400 text-right whitespace-nowrap">{block.networkId}</td>
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
                                                <h4 className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Alokasi Memori IP Address</h4>
                                                <div className="text-[10px] md:text-xs font-mono text-slate-400 dark:text-slate-500 mt-0.5 md:mt-1">Total: {totalHostsMaster} IP</div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {!isFinished && !calculationData && (
                                                     <button onClick={nextStep} className="bg-white dark:bg-slate-800 border border-net-teal dark:border-cyan-500 text-net-teal dark:text-cyan-400 px-3 md:px-6 py-1 md:py-2 rounded-full font-bold shadow-sm hover:bg-teal-50 dark:hover:bg-slate-700 transition flex items-center gap-1 md:gap-2 animate-bounce-slow text-[10px] md:text-xs">
                                                        Hitung {sortedReqs[currentStep]?.name || 'Next'} <FaForward className="shrink-0"/>
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
                                                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-slate-800 dark:bg-slate-900 text-white px-4 md:px-5 py-2 md:py-3 rounded-xl shadow-lg border border-slate-700 text-[10px] md:text-xs flex gap-4 md:gap-6 items-center z-50">
                                                            <div className="border-r border-slate-600 pr-4 md:pr-6">
                                                                <div className="font-bold text-teal-400 text-sm md:text-base mb-0.5 truncate max-w-[100px] md:max-w-none">{hoveredBlock.name}</div>
                                                                <div className="font-mono text-[9px] md:text-[10px] text-slate-400">{hoveredBlock.networkId}</div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-x-4 md:gap-x-8 gap-y-0.5 md:gap-y-1 text-[9px] md:text-[11px]">
                                                                <span className="text-slate-400">Prefix: <span className="text-white font-mono font-bold">/{hoveredBlock.prefix}</span></span>
                                                                <span className="text-slate-400">Bcast: <span className="text-white font-mono">{hoveredBlock.broadcastId}</span></span>
                                                                {!hoveredBlock.isUnused ? (
                                                                    <>
                                                                        <span className="text-slate-400 flex items-center gap-1">Terpakai: <span className="text-green-400 font-bold">{hoveredBlock.hosts||0}</span></span>
                                                                        <span className="text-slate-400 flex items-center gap-1">Sisa: <span className="text-orange-400 font-bold">{Math.max(0, (hoveredBlock.hostsAvailable - 2) - (hoveredBlock.hosts||0))}</span></span>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-slate-400 col-span-2">Kapasitas Bebas: <span className="text-white font-bold">{hoveredBlock.hostsAvailable} IP</span></span>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 italic h-full bg-slate-50 dark:bg-slate-900 px-3 md:px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-800 text-[10px] md:text-xs transition-colors">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse"></div>
                                                            <span>Arahkan kursor ke balok untuk melihat detail.</span>
                                                        </div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        <div className="sm:hidden mb-3 bg-slate-800 dark:bg-slate-900 text-white rounded-lg p-2.5 text-[10px] shrink-0 border border-slate-700 shadow-inner overflow-x-auto custom-scrollbar">
                                            {hoveredBlock ? (
                                                <div className="w-full flex flex-col gap-1.5 min-w-max px-1">
                                                    <div className="flex items-center justify-between border-b border-slate-600 pb-1.5">
                                                        <div className="font-bold text-teal-400 text-xs">{hoveredBlock.name}</div>
                                                        <div className="font-mono bg-slate-700 px-1.5 py-0.5 rounded text-blue-300 font-bold">/{hoveredBlock.prefix}</div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
                                                        <span className="text-slate-400">Network:<br/><span className="text-white">{hoveredBlock.networkId}</span></span>
                                                        <span className="text-slate-400">Broadcast:<br/><span className="text-white">{hoveredBlock.broadcastId}</span></span>
                                                        {!hoveredBlock.isUnused ? (
                                                            <>
                                                                <span className="text-slate-400 mt-0.5">Terpakai:<br/><span className="text-green-400 font-bold">{hoveredBlock.hosts||0} Host</span></span>
                                                                <span className="text-slate-400 mt-0.5">Sisa:<br/><span className="text-orange-400 font-bold">{Math.max(0, (hoveredBlock.hostsAvailable - 2) - (hoveredBlock.hosts||0))} IP</span></span>
                                                            </>
                                                        ) : (
                                                            <span className="text-slate-400 col-span-2 mt-0.5">Kapasitas Bebas:<br/><span className="text-white font-bold">{hoveredBlock.hostsAvailable} IP</span></span>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-slate-400 italic text-center w-full py-4">Sentuh balok di bawah untuk detail lengkap</div>
                                            )}
                                        </div>

                                        <div className="w-full bg-slate-100 dark:bg-slate-900/50 rounded-xl md:rounded-2xl overflow-x-auto overflow-y-hidden border border-slate-200 dark:border-slate-700 relative shadow-inner custom-scrollbar transition-colors h-[250px] md:h-[400px] shrink-0">
                                            <div className="flex items-end h-full pb-1 px-1 gap-0.5 min-w-max w-full">
                                                <AnimatePresence>
                                                    {allocatedBlocks.map((block, index) => (
                                                        <SubnetBlock key={block.networkId} data={block} totalHosts={totalHostsMaster} index={index} onHover={setHoveredBlock} />
                                                    ))}
                                                </AnimatePresence>
                                                {unusedBlock && !calculationData && (
                                                    <SubnetBlock key="unused" data={unusedBlock} totalHosts={totalHostsMaster} index={99} onHover={setHoveredBlock} />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* KANAN: PESAN NETBOT (Hanya muncul di Desktop atau ditumpuk di mobile jika ada teks) */}
                                   {/* KANAN: PESAN NETBOT & TABEL LOG */}
                                    <div className="w-full lg:w-[320px] xl:w-[380px] flex flex-col gap-4 md:gap-6 shrink-0 z-20 h-full">

                                        {/* 1. KOTAK NARATOR NETBOT */}
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

                                        {/* 2. TAMBAHAN: TABEL LOG VLSM (Pengisi Ruang Kosong) */}
                                        <div className="flex-1 bg-white dark:bg-slate-800 flex flex-col border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden min-h-[200px]">
                                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between shrink-0">
                                                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5">
                                                    <FaTable className="text-net-teal dark:text-teal-500 shrink-0"/> Log Rekapitulasi
                                                </h4>
                                                <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500 dark:text-slate-300">
                                                    {allocatedBlocks.length} / {sortedReqs.length}
                                                </span>
                                            </div>
                                            <div className="flex-1 overflow-auto custom-scrollbar bg-white dark:bg-slate-800">
                                                <table className="w-full text-left text-[10px] sm:text-xs">
                                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold sticky top-0 z-10 shadow-sm">
                                                        <tr><th className="px-3 py-2 whitespace-nowrap">Dept.</th><th className="px-3 py-2 whitespace-nowrap text-right">Network ID</th></tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                                        {allocatedBlocks.length === 0 && (
                                                            <tr><td colSpan="2" className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 italic text-xs">Belum ada blok yang dihitung.</td></tr>
                                                        )}
                                                        {allocatedBlocks.map((block, idx) => (
                                                            <motion.tr key={idx} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="hover:bg-teal-50 dark:hover:bg-slate-700/50 transition-colors cursor-default">
                                                                <td className="px-3 py-2 font-bold text-slate-700 dark:text-slate-300 border-l-4 border-transparent hover:border-net-teal whitespace-nowrap flex flex-col gap-0.5 transition-colors">
                                                                    <span>{block.name}</span>
                                                                    <span className="font-mono font-normal text-net-teal dark:text-teal-400 text-[10px]">/{block.prefix}</span>
                                                                </td>
                                                                <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-400 text-right whitespace-nowrap">{block.networkId}</td>
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

                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                .anim-float { animation: float 3s ease-in-out infinite; }

                @keyframes breathe {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                .anim-breathe { animation: breathe 1.5s ease-in-out infinite; }
            `}</style>
        </div>
    );
}
