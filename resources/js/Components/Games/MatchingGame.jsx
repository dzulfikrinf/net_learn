import React, { useState, useEffect } from 'react';
import { FaLink, FaCheckCircle } from 'react-icons/fa';

export default function MatchingGame({ data, onComplete }) {
    // Parse data config dari database
    const config = typeof data === 'string' ? JSON.parse(data) : data;

    const [leftItems, setLeftItems] = useState([]);
    const [rightItems, setRightItems] = useState([]);
    const [selectedLeft, setSelectedLeft] = useState(null);
    const [matches, setMatches] = useState({});
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        if (!config?.pairs) return;
        const pairs = config.pairs;

        // --- PERBAIKAN DISINI ---
        // Mapping data dari database (question/answer) ke format React
        const left = pairs.map((p, i) => ({
            id: `l-${i}`,
            text: p.question, // <-- Ganti p.left jadi p.question
            pairId: `r-${i}`
        }));

        const right = pairs.map((p, i) => ({
            id: `r-${i}`,
            text: p.answer    // <-- Ganti p.right jadi p.answer
        }));
        // ------------------------

        // Acak Kanan
        const shuffledRight = [...right].sort(() => Math.random() - 0.5);

        setLeftItems(left);
        setRightItems(shuffledRight);
    }, [data]);

    const handleLeftClick = (id) => {
        if (!matches[id]) setSelectedLeft(id);
    };

    const handleRightClick = (rId) => {
        if (!selectedLeft) return;
        const leftItem = leftItems.find(l => l.id === selectedLeft);

        if (leftItem.pairId === rId) {
            const newMatches = { ...matches, [selectedLeft]: rId };
            setMatches(newMatches);
            setSelectedLeft(null);

            // Cek apakah semua sudah cocok
            if (Object.keys(newMatches).length === leftItems.length) {
                setIsCompleted(true);
                if (onComplete) onComplete();
            }
        } else {
            // Animasi getar atau alert kecil (opsional)
            // alert("Kurang tepat! Coba lagi."); // Bisa di-comment biar gak annoying
            setSelectedLeft(null);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm my-6">
            <h3 className="font-bold text-lg mb-6 text-center dark:text-white flex items-center justify-center gap-2">
                <FaLink className="text-blue-500"/> {config.instruction || "Cocokkan pasangan yang tepat!"}
            </h3>

            <div className="flex justify-between gap-4 md:gap-12">
                {/* Sisi Kiri (Question) */}
                <div className="flex-1 space-y-3">
                    {leftItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleLeftClick(item.id)}
                            disabled={matches[item.id]}
                            className={`w-full p-3 rounded-xl font-bold text-sm border-2 text-left transition-all
                                ${matches[item.id]
                                    ? 'bg-green-100 border-green-500 text-green-700 opacity-50 cursor-default'
                                    : selectedLeft === item.id
                                        ? 'bg-blue-100 border-blue-500 text-blue-700 ring-2 ring-blue-200'
                                        : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 dark:text-white hover:bg-slate-100'}`}
                        >
                            {item.text} {matches[item.id] && <FaCheckCircle className="inline ml-2"/>}
                        </button>
                    ))}
                </div>

                {/* Sisi Kanan (Answer) */}
                <div className="flex-1 space-y-3">
                    {rightItems.map((item) => {
                        const isMatched = Object.values(matches).includes(item.id);
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleRightClick(item.id)}
                                disabled={isMatched}
                                className={`w-full p-3 rounded-xl font-bold text-sm border-2 border-dashed text-right transition-all
                                    ${isMatched
                                        ? 'bg-green-100 border-green-500 text-green-700 opacity-50 cursor-default'
                                        : selectedLeft
                                            ? 'bg-blue-50 border-blue-300 hover:bg-blue-100 cursor-pointer animate-pulse' // Kasih hint visual kalo kiri udah dipilih
                                            : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:text-slate-400 cursor-not-allowed'}`}
                            >
                                {item.text}
                            </button>
                        );
                    })}
                </div>
            </div>

            {isCompleted && (
                <div className="mt-6 text-center p-4 bg-green-50 rounded-xl border border-green-200 animate-bounce">
                    <span className="text-green-600 font-bold text-lg">🎉 Sempurna! Lanjut ke materi berikutnya.</span>
                </div>
            )}
        </div>
    );
}
