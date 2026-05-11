import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaTimes, FaRobot, FaVolumeUp, FaVolumeMute, FaTrash } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const MASCOT_IMAGE = "/images/mascot.gif";

export default function TeacherAssistant({
    user,
    className = "bottom-6",
    currentLessonTitle = "Dashboard",
    currentModuleTitle = "Menu Utama"
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // --- 1. STATE MESSAGES (DIHUBUNGKAN KE LOCAL STORAGE) ---
    const [messages, setMessages] = useState(() => {
        // Cek apakah ada history chat sebelumnya untuk user ini
        if (typeof window !== 'undefined' && user?.id) {
            const savedHistory = localStorage.getItem(`netbot_chat_${user.id}`);
            if (savedHistory) {
                return JSON.parse(savedHistory);
            }
        }
        // Jika tidak ada, tampilkan pesan default
        return [
            { id: 1, sender: 'bot', text: `Halo ${user?.name || 'Siswa'}! 👋 Saya NetBot. Ada yang bisa dibantu soal materi ini?` }
        ];
    });

    // --- 2. AUTO-SAVE HISTORY ---
    // Simpan ke local storage setiap kali state 'messages' berubah
    useEffect(() => {
        if (user?.id) {
            localStorage.setItem(`netbot_chat_${user.id}`, JSON.stringify(messages));
        }
    }, [messages, user?.id]);

    // --- STATE SUARA ---
    const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
    const synthesisRef = useRef(window.speechSynthesis);
    const [availableVoices, setAvailableVoices] = useState([]);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen, isTyping]);

    // --- INISIALISASI SUARA ---
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                setAvailableVoices(voices);
            }
        };

        loadVoices();

        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            if (synthesisRef.current) {
                synthesisRef.current.cancel();
            }
        };
    }, []);

    // --- FUNGSI BICARA ---
    const speak = (text) => {
        if (!isSpeechEnabled) return;
        if (!synthesisRef.current) return;

        synthesisRef.current.cancel();

        const cleanText = text.replace(/[*#_`\-]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);

        const indoVoice = availableVoices.find(v => v.lang === 'id-ID' || v.lang === 'id_ID');

        if (indoVoice) {
            utterance.voice = indoVoice;
        } else {
            utterance.lang = 'id-ID';
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        synthesisRef.current.speak(utterance);
    };

    // --- FUNGSI KIRIM PESAN ---
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        if (synthesisRef.current) synthesisRef.current.cancel();

        const userMsg = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await axios.post(route('chatbot.ask'), {
                message: userMsg.text,
                lesson_title: currentLessonTitle,
                module_title: currentModuleTitle
            });

            const botReply = response.data.reply;
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botReply }]);
            speak(botReply);

        } catch (error) {
            const errorMsg = "Maaf, koneksi terputus atau server error.";
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: errorMsg }]);
            speak(errorMsg);
        } finally {
            setIsTyping(false);
        }
    };

    // --- FUNGSI HAPUS HISTORY (BARU) ---
    const clearHistory = () => {
        if (confirm("Apakah kamu yakin ingin menghapus seluruh riwayat obrolan dengan NetBot?")) {
            const defaultMsg = [
                { id: 1, sender: 'bot', text: `Halo ${user?.name || 'Siswa'}! 👋 Saya NetBot. Ada yang bisa dibantu soal materi ini?` }
            ];
            setMessages(defaultMsg);
            if (user?.id) {
                localStorage.removeItem(`netbot_chat_${user.id}`);
            }
        }
    };

    const toggleSpeech = () => {
        if (isSpeechEnabled) {
            synthesisRef.current.cancel();
        } else {
            const testUtterance = new SpeechSynthesisUtterance("Suara aktif");
            testUtterance.lang = 'id-ID';
            synthesisRef.current.speak(testUtterance);
        }
        setIsSpeechEnabled(!isSpeechEnabled);
    };

    return (
        <motion.div
            drag
            dragMomentum={false}
            dragElastic={0.1}
            dragConstraints={{ left: -300, right: 0, top: -500, bottom: 0 }}
            className={`fixed right-4 md:right-6 z-[100] flex flex-col items-end ${className}`}
        >
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20, originY: 1, originX: 1 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="bg-white dark:bg-slate-900 w-[calc(100vw-2rem)] sm:w-80 md:w-96 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-3 flex flex-col transition-colors duration-300"
                        style={{ height: '500px', maxHeight: '70vh' }}
                        onPointerDownCapture={(e) => e.stopPropagation()}
                    >
                        {/* Header Chat */}
                        <div className="bg-net-blue dark:bg-slate-800 p-3 md:p-4 flex justify-between items-center text-white cursor-grab active:cursor-grabbing shrink-0 border-b border-transparent dark:border-slate-700 transition-colors duration-300">
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-7 h-7 md:w-8 md:h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <FaRobot size={14} className="md:w-4 md:h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xs md:text-sm text-white">NetBot AI</h3>
                                    <div className="flex items-center gap-1 text-[9px] md:text-[10px] opacity-80 text-white">
                                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse"></span> Online
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                {/* TOMBOL CLEAR HISTORY (BARU) */}
                                {messages.length > 1 && (
                                    <button
                                        onClick={clearHistory}
                                        className="transition p-2 rounded-full text-white/50 hover:text-red-300 hover:bg-white/10"
                                        title="Hapus Riwayat Chat"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                )}

                                {/* TOMBOL SPEAKER */}
                                <button
                                    onClick={toggleSpeech}
                                    className={`transition p-2 rounded-full ${isSpeechEnabled ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
                                    title={isSpeechEnabled ? "Matikan Suara" : "Aktifkan Suara"}
                                >
                                    {isSpeechEnabled ? <FaVolumeUp size={14} /> : <FaVolumeMute size={14} />}
                                </button>

                                <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition p-2 rounded-full hover:bg-white/10">
                                    <FaTimes size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Area Pesan Chat */}
                        <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-slate-50 dark:bg-slate-950/50 space-y-4 custom-scrollbar transition-colors duration-300">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm shadow-sm text-left transition-colors duration-300 ${
                                        msg.sender === 'user'
                                            ? 'bg-net-blue dark:bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-500/20'
                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                                    }`}>
                                        <div className={`prose prose-sm max-w-none prose-p:mb-1 ${msg.sender === 'user' ? 'prose-invert' : 'dark:prose-invert'}`}>
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none px-4 py-3.5 shadow-sm flex items-center gap-1.5 w-fit transition-colors duration-300">
                                        <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-1" />
                        </div>

                        {/* Form Input Chat */}
                        <form onSubmit={handleSend} className="p-2 md:p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2 shrink-0 transition-colors duration-300">
                            <input
                                type="text" value={input} onChange={(e) => setInput(e.target.value)}
                                placeholder="Tanya tentang materi ini..."
                                className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white dark:placeholder-slate-400 rounded-full px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm focus:ring-net-blue dark:focus:ring-cyan-900 focus:border-net-blue dark:focus:border-cyan-900 transition-colors duration-300"
                            />
                            <button type="submit" disabled={isTyping} className={`bg-net-teal dark:bg-teal-600 text-white w-8 h-8 md:w-9 md:h-9 shrink-0 rounded-full flex items-center justify-center shadow transition ${isTyping ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-600 dark:hover:bg-teal-500'}`}>
                                <FaPaperPlane size={10} className={`md:w-3 md:h-3 ${isTyping ? 'animate-bounce' : ''}`} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- TOMBOL MASKOT --- */}
            <div
                className="relative group cursor-grab active:cursor-grabbing"
                onClick={() => setIsOpen(!isOpen)}
            >
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute right-full mr-3 md:mr-4 top-1 md:top-2 bg-white dark:bg-slate-800 px-3 py-1.5 md:px-4 md:py-2 rounded-xl rounded-tr-none shadow-lg border border-slate-100 dark:border-slate-700 whitespace-nowrap pointer-events-none hidden sm:block transition-colors duration-300"
                    >
                        <p className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-200 text-center">Bingung? <br />Yuk tanya NetBot!</p>
                    </motion.div>
                )}

                {!isOpen && (
                    <span className="absolute top-0 right-0 flex h-3 w-3 md:h-4 md:w-4 z-20 pointer-events-none">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 md:h-4 md:w-4 bg-red-500 border-2 border-white dark:border-slate-800 transition-colors duration-300"></span>
                    </span>
                )}

                <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full shadow-xl flex items-center justify-center border-[3px] md:border-4 transition-colors duration-300 ${isOpen ? 'border-net-teal bg-blue-50 dark:bg-cyan-900/40 dark:border-teal-500' : 'bg-white dark:bg-slate-800 border-white dark:border-slate-700'}`}>
                    <img
                        src={MASCOT_IMAGE}
                        alt="Bot Mascot"
                        className="w-full h-full object-cover rounded-full select-none pointer-events-none"
                        draggable="false"
                    />
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
            `}</style>
        </motion.div>
    );
}
