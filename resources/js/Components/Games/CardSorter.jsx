import React, { useState, useEffect } from 'react';
import { FaBoxOpen, FaCheckCircle } from 'react-icons/fa';

export default function CardSorter({ data, onComplete }) {
    // Parse config dari database
    const config = typeof data === 'string' ? JSON.parse(data) : data;

    // State
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [completedCount, setCompletedCount] = useState(0);
    const [wrongFeedback, setWrongFeedback] = useState(false);

    // --- NORMALISASI DATA (PENTING) ---
    useEffect(() => {
        if (config?.items && config?.categories) {

            // 1. Normalisasi Categories
            const normalizedCategories = config.categories.map(cat => {
                if (typeof cat === 'string') {
                    return { id: cat, title: cat }; // Format Lama
                }
                return cat; // Format Baru
            });

            // 2. Normalisasi Items
            const shuffledItems = [...config.items]
                .map((item, index) => {
                    const targetId = item.categoryId || item.category;

                    return {
                        ...item,
                        id: index,
                        status: 'idle',
                        targetId: targetId
                    };
                })
                .sort(() => Math.random() - 0.5);

            setItems(shuffledItems);
            setCategories(normalizedCategories);
            setCompletedCount(0);
            setSelectedItem(null);
        }
    }, [data]); // Reset kalau data berubah

    // 1. Klik Kartu
    const handleItemClick = (item) => {
        if (item.status === 'correct') return;
        setSelectedItem(item);
        setWrongFeedback(false);
    };

    // 2. Klik Keranjang (Category)
    const handleCategoryClick = (categoryObj) => {
        if (!selectedItem) return;

        // Bandingkan ID target item dengan ID kategori
        if (selectedItem.targetId === categoryObj.id) {
            // BENAR
            const newItems = items.map(i =>
                i.id === selectedItem.id ? { ...i, status: 'correct' } : i
            );
            setItems(newItems);
            setSelectedItem(null);

            const newCount = completedCount + 1;
            setCompletedCount(newCount);

            // Cek Apakah Selesai Semua?
            if (newCount === items.length) {
                if (onComplete) onComplete();
            }
        } else {
            // SALAH
            setWrongFeedback(true);
            setTimeout(() => setWrongFeedback(false), 500);
        }
    };

    return (
        // PERBAIKAN: Padding & Margin Wrapper disesuaikan (p-4 di HP, p-6 di Laptop)
        <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm my-4 md:my-6">
            <h3 className="text-center font-bold mb-4 md:mb-6 text-sm md:text-base text-slate-800 dark:text-white flex items-center justify-center gap-2">
                <FaBoxOpen className="text-blue-500 shrink-0"/>
                <span>{config.instruction || "Kelompokkan data berikut!"}</span>
            </h3>

            {/* === AREA KARTU (ITEMS) === */}
            {/* PERBAIKAN: Min-height, gap, dan padding area kotak-kotak disesuaikan */}
            <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-6 md:mb-10 min-h-[100px] md:min-h-[120px] bg-slate-50 dark:bg-slate-900/50 p-3 md:p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 transition-all duration-500">
                {items.filter(i => i.status !== 'correct').length === 0 && (
                    <div className="text-green-500 font-bold text-sm md:text-lg animate-bounce flex items-center gap-2 mt-2 md:mt-4">
                        <FaCheckCircle className="shrink-0" /> Selesai! Kerja Bagus.
                    </div>
                )}

                {items.map((item) => {
                    if (item.status === 'correct') return null; // Hilang kalau benar

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            // PERBAIKAN: Padding font mengecil di HP (px-3 py-1.5, text-xs) agar muat banyak
                            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-mono font-bold border-2 transition-all transform shadow-sm text-xs md:text-sm
                                ${selectedItem?.id === item.id
                                    ? 'bg-blue-100 border-blue-500 text-blue-700 scale-110 z-10'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200'}
                                ${selectedItem?.id === item.id && wrongFeedback ? 'animate-shake border-red-500 text-red-500 bg-red-50' : ''}
                            `}
                        >
                            {item.text}
                        </button>
                    );
                })}
            </div>

            {/* === AREA KERANJANG (CATEGORIES) === */}
            {/* PERBAIKAN: Gap antar kotak dirapatkan di HP (gap-3), Grid responsif */}
            <div className={`grid gap-3 md:gap-8 ${categories.length > 2 ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2'}`}>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat)}
                        // PERBAIKAN: Kotak Keranjang lebih ceper di HP (min-h-[100px]), padding dikurangi
                        className={`min-h-[100px] md:min-h-[120px] p-3 md:p-4 rounded-xl md:rounded-2xl border-2 flex flex-col items-center justify-center gap-2 md:gap-3 transition-all relative overflow-hidden group
                            ${selectedItem
                                ? 'border-blue-300 bg-blue-50/50 cursor-pointer hover:bg-blue-100 dark:hover:bg-slate-700 hover:border-blue-500 hover:scale-[1.02]'
                                : 'border-slate-200 bg-slate-100 cursor-default dark:bg-slate-900 dark:border-slate-700 opacity-70'}
                        `}
                    >
                        <div className={`p-2 md:p-3 rounded-full ${selectedItem ? 'bg-white shadow-md' : 'bg-slate-200 dark:bg-slate-800'}`}>
                            <FaBoxOpen className={`text-xl md:text-2xl ${selectedItem ? 'text-blue-500' : 'text-slate-400'}`} />
                        </div>

                        {/* PERBAIKAN: Teks judul kategori menjadi lebih kecil (text-[10px]) dan leading-tight agar tidak memakan ruang */}
                        <span className="font-bold text-[10px] md:text-sm text-slate-700 dark:text-slate-300 text-center uppercase tracking-wide leading-tight">
                            {cat.title}
                        </span>

                        {/* Visual Feedback Kartu Masuk */}
                        {selectedItem && (
                            <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </button>
                ))}
            </div>

            <p className="text-center text-[10px] md:text-xs text-slate-400 mt-4 md:mt-6 italic">
                {selectedItem ? "Klik salah satu kotak di bawah untuk memasukkan kartu." : "Klik kartu di atas terlebih dahulu."}
            </p>
        </div>
    );
}
