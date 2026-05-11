import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaKeyboard } from 'react-icons/fa';
import Confetti from 'react-confetti';

export default function SmartForm({ data, onComplete }) {
    const config = typeof data === 'string' ? JSON.parse(data) : data;

    const [inputs, setInputs] = useState({});
    const [feedback, setFeedback] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [mistakes, setMistakes] = useState(0);
    const [startTime, setStartTime] = useState(null);

    useEffect(() => {
        setInputs({});
        setFeedback(null);
        setShowConfetti(false);
    }, [config.problem]);

    useEffect(() => {
        setStartTime(Date.now());
    }, []);

    const handleChange = (id, value) => {
        setInputs(prev => ({ ...prev, [id]: value }));
        if (feedback === 'incorrect') setFeedback(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let isAllCorrect = true;

        config.fields.forEach(field => {
            const userVal = inputs[field.id]?.toString().trim();
            const correctVal = field.answer.toString().trim();

            if (userVal !== correctVal) {
                isAllCorrect = false;
            }
        });

        if (isAllCorrect) {
            setFeedback('correct');
            setShowConfetti(true);

            const timeTaken = Math.floor((Date.now() - startTime) / 1000);

            if (onComplete) onComplete({
                mistakes: mistakes,
                time_taken: timeTaken
            });

            setTimeout(() => setShowConfetti(false), 5000);
        } else {
            setFeedback('incorrect');
            setMistakes(prev => prev + 1);
        }
    };

    return (
        <div className="relative bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm my-4 md:my-6 overflow-hidden">

            {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}

            <h3 className="font-bold text-center mb-4 md:mb-6 text-sm md:text-base text-slate-800 dark:text-white flex items-center justify-center gap-2">
                <FaKeyboard className="text-blue-500 shrink-0"/> {config.instruction}
            </h3>

            <div className="bg-slate-100 dark:bg-slate-900 p-4 md:p-6 rounded-xl mb-6 md:mb-8 border border-slate-200 dark:border-slate-700">
                <div className="font-mono text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-center leading-relaxed">
                    {config.problem}
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 md:gap-4 mb-6 md:mb-8">
                    {config.fields.map((field, index) => (
                        <div key={field.id} className="flex items-center">
                            <input
                                type="text"
                                maxLength={3}
                                placeholder="0"
                                disabled={feedback === 'correct'}
                                // PERBAIKAN FONT INPUT: text-base di HP, text-lg di layar sedang, text-2xl di PC
                                className={`w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-16 text-center text-sm sm:text-lg md:text-2xl font-bold rounded-lg border-2 focus:ring-4 focus:outline-none transition-all
                                    ${feedback === 'correct'
                                        ? 'border-green-500 bg-green-50 text-green-700 cursor-not-allowed'
                                        : feedback === 'incorrect'
                                            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200 animate-shake'
                                            : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100 dark:bg-slate-700 dark:border-slate-600 dark:text-white'}
                                `}
                                value={inputs[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                            />
                            {index < config.fields.length - 1 && (
                                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-400 ml-1 sm:ml-2 md:ml-4 pb-2 md:pb-4">.</span>
                            )}
                        </div>
                    ))}
                </div>

                {feedback === 'incorrect' && (
                    <div className="text-center text-red-500 font-bold mb-4 bg-red-100 p-2 md:p-3 rounded-lg animate-pulse text-xs md:text-sm flex justify-center items-center gap-2">
                        <FaTimesCircle className="shrink-0"/> Jawaban belum tepat. Cek lagi hitunganmu!
                    </div>
                )}
                {feedback === 'correct' && (
                    <div className="text-center text-green-600 font-bold mb-4 bg-green-100 p-2 md:p-3 rounded-lg animate-bounce text-xs md:text-sm flex justify-center items-center gap-2">
                        <FaCheckCircle className="shrink-0"/> Hore! Jawaban Benar! 🎉
                    </div>
                )}

                <button
                    type="submit"
                    disabled={feedback === 'correct'}
                    className={`w-full py-2.5 md:py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 text-sm md:text-base
                        ${feedback === 'correct'
                            ? 'bg-green-500 cursor-default shadow-none'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'}
                    `}
                >
                    {feedback === 'correct' ? 'Selesai (Lanjut Materi)' : 'Cek Jawaban'}
                </button>
            </form>
        </div>
    );
}
