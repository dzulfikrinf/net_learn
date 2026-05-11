import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPaperPlane, FaRobot, FaUserAstronaut, FaTrashAlt } from 'react-icons/fa';
import axios from 'axios';

export default function StageAIModal({ isOpen, onClose, stageTitle, mascotSrc, user }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // =========================================================
    // 1. LOAD HISTORY DARI LOCAL STORAGE SAAT MODAL DIBUKA
    // =========================================================
    useEffect(() => {
        if (isOpen && stageTitle) {
            // Cek apakah ada history chat untuk Stage ini di browser
            const savedHistory = localStorage.getItem(`netlearn_chat_${stageTitle}`);

            if (savedHistory) {
                // Jika ada, muat history tersebut
                setMessages(JSON.parse(savedHistory));
            } else {
                // Jika kosong, berikan sapaan pertama kali
                setMessages([
                    {
                        sender: 'ai',
                        text: `Halo ${user?.name || 'Siswa'}! Aku Tutor NetBot khusus untuk materi **${stageTitle}**. Ada konsep yang bikin kamu pusing atau mau aku kasih analogi sederhananya?`
                    }
                ]);
            }
        }
    }, [isOpen, stageTitle, user]);

    // =========================================================
    // 2. SIMPAN KE LOCAL STORAGE SETIAP ADA PESAN BARU
    // =========================================================
    useEffect(() => {
        // Hanya simpan jika modal sedang terbuka dan ada pesan
        if (isOpen && stageTitle && messages.length > 0) {
            localStorage.setItem(`netlearn_chat_${stageTitle}`, JSON.stringify(messages));
        }
    }, [messages, isOpen, stageTitle]);

    // Auto-scroll ke pesan terbaru
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!isOpen) return null;

    // =========================================================
    // 3. FUNGSI HAPUS HISTORY CHAT
    // =========================================================
    const handleClearChat = () => {
        if(confirm('Yakin ingin menghapus riwayat obrolan di Stage ini?')) {
            localStorage.removeItem(`netlearn_chat_${stageTitle}`);
            setMessages([
                {
                    sender: 'ai',
                    text: `Riwayat obrolan dibersihkan! Halo ${user?.name || 'Siswa'}, mari mulai sesi baru untuk materi **${stageTitle}**. Ada yang bisa kubantu?`
                }
            ]);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const messageToSend = inputText;
        const newUserMessage = { sender: 'user', text: messageToSend };

        setMessages(prev => [...prev, newUserMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await axios.post('/chatbot/ask-stage', {
                message: messageToSend,
                stage: stageTitle
            });

            const aiReply = {
                sender: 'ai',
                text: response.data.reply
            };
            setMessages(prev => [...prev, aiReply]);

        } catch (error) {
            console.error("Error AI Stage:", error);
            setMessages(prev => [...prev, {
                sender: 'ai',
                text: 'Waduh, sinyal NetBot lagi jelek nih. Coba tanya lagi ya! 🦝📡'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
            {/* Kartu Modal Utama */}
            <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">

                {/* --- BAGIAN KIRI: Info Tutor & Mascot --- */}
                <div className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 w-full md:w-1/3 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 md:hidden text-slate-400 hover:text-red-500"
                    >
                        <FaTimes size={20} />
                    </button>

                    <div className="relative mb-4">
                        <div className="absolute inset-0 bg-blue-400 dark:bg-cyan-500 blur-2xl opacity-20 rounded-full scale-125"></div>
                        <img
                            src={mascotSrc || '/images/default-mascot.png'}
                            alt="Stage Tutor"
                            className="w-24 h-24 sm:w-32 sm:h-32 relative z-10 drop-shadow-xl anim-float"
                        />
                    </div>
                    <h3 className="text-center font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-500 mb-1">
                        Tutor Stage
                    </h3>
                    <p className="text-center text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 leading-tight">
                        {stageTitle}
                    </p>
                    <div className="mt-4 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-full flex items-center gap-1 border border-green-200 dark:border-green-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
                    </div>
                </div>

                {/* --- BAGIAN KANAN: Ruang Chat --- */}
                <div className="w-full md:w-2/3 h-[60vh] md:h-[65vh] flex flex-col bg-slate-50 dark:bg-slate-950/50">

                    {/* Header Chat */}
                    <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                        <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 text-sm">
                            <FaRobot className="text-blue-500" /> Sesi Bimbingan Privat
                        </span>
                        <div className="flex items-center gap-1">
                            {/* Tombol Hapus Chat */}
                            <button
                                onClick={handleClearChat}
                                title="Bersihkan Obrolan"
                                className="p-2 text-slate-400 hover:bg-orange-50 hover:text-orange-500 dark:hover:bg-orange-900/30 rounded-xl transition"
                            >
                                <FaTrashAlt size={14} />
                            </button>
                            {/* Tombol Tutup (PC) */}
                            <button
                                onClick={onClose}
                                className="hidden md:block p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 rounded-xl transition"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    {/* Area Pesan Chat */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[85%] gap-2 sm:gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className="shrink-0 mt-auto mb-1">
                                        {msg.sender === 'user' ? (
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                                <FaUserAstronaut size={12} />
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 dark:bg-cyan-900 flex items-center justify-center text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-cyan-800">
                                                <FaRobot size={12} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Bubble Chat */}
                                    <div className={`p-3 sm:p-4 rounded-2xl text-sm sm:text-base ${
                                        msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-500/20'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'
                                    }`}>
                                        <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex w-full justify-start">
                                <div className="flex gap-3 max-w-[80%]">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-cyan-900 flex items-center justify-center text-blue-600 dark:text-cyan-400 shrink-0 mt-auto mb-1">
                                        <FaRobot size={12} />
                                    </div>
                                    <div className="p-4 rounded-2xl rounded-bl-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Form Input Chat */}
                    <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
                        <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Tanya Tutor Stage ini..."
                                disabled={isLoading}
                                className="w-full bg-slate-100 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-cyan-900/50 rounded-xl px-4 py-3 text-sm dark:text-white transition"
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim() || isLoading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white p-3 rounded-xl transition flex items-center justify-center shrink-0 shadow-md disabled:shadow-none"
                            >
                                <FaPaperPlane size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
