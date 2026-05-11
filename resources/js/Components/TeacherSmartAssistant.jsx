import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaLightbulb, FaChartLine, FaExclamationTriangle, FaPaperPlane } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

// Samakan sumber gambar dengan yang di User
const MASCOT_IMAGE = "/images/mascot.gif";

// --- PROMPTS OTOMATIS (QUICK ACTIONS) ---
const QUICK_PROMPTS = [
    { icon: <FaChartLine />, text: "Analisis Performa Kelas", query: "Buatkan ringkasan performa kelas berdasarkan data XP dan penyelesaian materi." },
    { icon: <FaExclamationTriangle />, text: "Siswa Bermasalah", query: "Siapa saja siswa yang memiliki XP terendah atau progress lambat? Apa saranmu?" },
    { icon: <FaLightbulb />, text: "Materi Tersulit", query: "Berdasarkan grafik 'Difficulty', materi mana yang paling sering diulang siswa (retries tinggi)?" },
];

export default function TeacherSmartAssistant({ students, charts, className = "bottom-6" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: `Halo Admin! 👨‍🏫\nSaya telah membaca data dari **${students.length} siswa** dan grafik aktivitas.\n\nApa yang ingin Anda analisis hari ini?` }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen, isTyping]);

    const handleSend = async (textToSend) => {
        // e.preventDefault() ditangani di form onSubmit
        const messageText = typeof textToSend === 'string' ? textToSend : input;
        if (!messageText.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: messageText };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // --- RAHASIA KECERDASANNYA ADA DI SINI ---
            const contextPayload = {
                message: messageText,
                context_data: {
                    total_students: students.length,
                    top_students: [...students].sort((a,b) => b.xp - a.xp).slice(0, 5).map(s => `${s.name} (${s.xp} XP)`),
                    struggling_students: [...students].sort((a,b) => a.xp - b.xp).slice(0, 5).map(s => `${s.name} (${s.xp} XP)`),
                    difficulty_stats: charts.difficulty,
                    completion_stats: charts.completion,
                    activity_stats: charts.activity
                },
                role: "teacher_assistant"
            };

            const response = await axios.post(route('chatbot.ask_admin'), contextPayload);

            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: response.data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "Maaf, gagal menganalisis data saat ini." }]);
        } finally {
            setIsTyping(false);
        }
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
                        className="bg-white dark:bg-slate-900 w-[calc(100vw-2rem)] sm:w-80 md:w-[450px] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden mb-3 transition-colors duration-300"
                        style={{ height: '600px', maxHeight: '80vh' }}
                        onPointerDownCapture={(e) => e.stopPropagation()}
                    >
                        {/* HEADER */}
                        <div className="bg-indigo-600 dark:bg-indigo-900 p-3 md:p-4 flex justify-between items-center text-white shadow-md shrink-0 cursor-grab active:cursor-grabbing">
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center p-0.5 border border-white/30">
                                    <img src={MASCOT_IMAGE} alt="NetBot" className="w-full h-full object-cover rounded-full drop-shadow-md" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xs md:text-sm">Data Analyst AI</h3>
                                    <p className="text-[9px] md:text-[10px] opacity-80 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                        Connected to Data
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition">
                                <FaTimes />
                            </button>
                        </div>

                        {/* CHAT AREA */}
                        <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-slate-50 dark:bg-slate-950/50 space-y-4 custom-scrollbar transition-colors duration-300">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm shadow-sm transition-colors duration-300 ${
                                        msg.sender === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                                    }`}>
                                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:mb-1">
                                            <ReactMarkdown>
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 px-4 py-3.5 rounded-2xl rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5 w-fit">
                                        <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-1" />
                        </div>

                        {/* QUICK ACTIONS (CHIPS) */}
                        {messages.length < 3 && (
                            <div className="px-3 md:px-4 py-2 bg-slate-50 dark:bg-slate-950/50 flex gap-2 overflow-x-auto custom-scrollbar shrink-0 transition-colors duration-300">
                                {QUICK_PROMPTS.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSend(prompt.query)}
                                        className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] md:text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 transition whitespace-nowrap shadow-sm"
                                    >
                                        {prompt.icon} {prompt.text}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* INPUT */}
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-2 md:p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2 shrink-0 transition-colors duration-300">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Tanya tentang performa siswa..."
                                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white transition-colors duration-300"
                            />
                            <button disabled={isTyping} type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white w-8 h-8 md:w-9 md:h-9 shrink-0 rounded-full flex items-center justify-center shadow transition disabled:opacity-50">
                                <FaPaperPlane size={10} className={`md:w-3 md:h-3 ${isTyping ? 'animate-bounce' : ''}`} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- TOMBOL MASKOT SAMA SEPERTI DI USER --- */}
            <div
                className="relative group cursor-grab active:cursor-grabbing"
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* TOOLTIP */}
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute right-full mr-3 md:mr-4 top-1 md:top-2 bg-white dark:bg-slate-800 px-3 py-1.5 md:px-4 md:py-2 rounded-xl rounded-tr-none shadow-lg border border-slate-100 dark:border-slate-700 whitespace-nowrap pointer-events-none hidden sm:block transition-colors duration-300"
                    >
                        <p className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-200 text-center">Analisis Data<br />Guru (AI)</p>
                    </motion.div>
                )}

                {/* NOTIFICATION DOT RED PING */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 flex h-3 w-3 md:h-4 md:w-4 z-20 pointer-events-none">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 md:h-4 md:w-4 bg-red-500 border-2 border-white dark:border-slate-800 transition-colors duration-300"></span>
                    </span>
                )}

                {/* ICON LINGKARAN */}
                <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full shadow-xl flex items-center justify-center border-[3px] md:border-4 transition-colors duration-300 ${isOpen ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/40' : 'bg-white dark:bg-slate-800 border-white dark:border-slate-700'}`}>
                    <img
                        src={MASCOT_IMAGE}
                        alt="Bot Mascot"
                        className="w-full h-full object-cover rounded-full select-none pointer-events-none"
                        draggable="false"
                    />
                </div>
            </div>

            {/* Custom Scrollbar CSS (Sama dengan User) */}
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
