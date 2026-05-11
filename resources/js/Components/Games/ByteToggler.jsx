import React, { useState, useEffect } from 'react';
import { FaLightbulb, FaCheckCircle } from 'react-icons/fa';

export default function ByteToggler({ data, onComplete }) {
    const config = typeof data === 'string' ? JSON.parse(data) : data;
    const targetValue = config.target || 0; // Misal targetnya 192

    // State 8 Bit (0 = Mati, 1 = Nyala)
    const [bits, setBits] = useState([0, 0, 0, 0, 0, 0, 0, 0]);

    // Bobot setiap posisi bit
    const weights = [128, 64, 32, 16, 8, 4, 2, 1];

    // Hitung total desimal saat ini
    const currentDecimal = bits.reduce((acc, bit, index) => acc + (bit * weights[index]), 0);

    const handleToggle = (index) => {
        if (currentDecimal === targetValue) return; // Kunci jika sudah benar

        const newBits = [...bits];
        newBits[index] = newBits[index] === 0 ? 1 : 0;
        setBits(newBits);
    };

    // Cek Kemenangan
    useEffect(() => {
        if (currentDecimal === targetValue) {
            if (onComplete) onComplete();
        }
    }, [currentDecimal]);

    return (
        // PERBAIKAN: Padding di HP dikurangi (p-4)
        <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm my-4 md:my-6 text-center">

            {/* Target Misi */}
            <div className="mb-6 md:mb-8">
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-bold uppercase mb-1 md:mb-2">Misi Kamu</p>
                <h3 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-white leading-tight">
                    Nyalakan sakelar hingga nilainya: <span className="text-blue-600 text-3xl md:text-4xl block mt-1 md:mt-2">{targetValue}</span>
                </h3>
            </div>

            {/* Deretan Sakelar 8-Bit */}
            {/* PERBAIKAN: gap antar sakelar dikecilkan di HP (gap-1 sm:gap-2) */}
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2 md:gap-4 mb-6 md:mb-8">
                {bits.map((bit, index) => (
                    <div key={index} className="flex flex-col items-center gap-1 md:gap-2">
                        {/* Bobot Angka (128, 64, dst) */}
                        {/* PERBAIKAN: Ukuran font bobot dikecilkan di HP (text-[10px]) */}
                        <span className="text-[10px] md:text-xs font-mono text-slate-400 font-bold leading-none">{weights[index]}</span>

                        {/* Tombol Sakelar */}
                        {/* PERBAIKAN: Ukuran sakelar disesuaikan, lebar w-8 di HP, tinggi h-14 di HP */}
                        <button
                            onClick={() => handleToggle(index)}
                            className={`w-8 h-12 sm:w-10 sm:h-16 md:w-14 md:h-24 rounded-md md:rounded-lg border-b-[3px] md:border-b-4 transition-all duration-200 flex flex-col items-center justify-end pb-1.5 md:pb-3 shadow-md md:shadow-lg
                                ${bit === 1
                                    ? 'bg-yellow-400 border-yellow-600 translate-y-1 shadow-yellow-200/50'
                                    : 'bg-slate-200 border-slate-400 hover:bg-slate-300 dark:bg-slate-700 dark:border-slate-900'}
                            `}
                        >
                            {/* PERBAIKAN: Ukuran ikon lampu dikecilkan di HP */}
                            <FaLightbulb className={`text-sm sm:text-xl md:text-2xl mb-0.5 md:mb-1 ${bit === 1 ? 'text-white drop-shadow-md' : 'text-slate-400'}`} />
                            {/* PERBAIKAN: Angka 0/1 di dalam sakelar dikecilkan */}
                            <span className={`font-bold font-mono text-xs md:text-base leading-none ${bit === 1 ? 'text-yellow-800' : 'text-slate-500'}`}>{bit}</span>
                        </button>
                    </div>
                ))}
            </div>

            {/* Hasil Realtime */}
            {/* PERBAIKAN: Kotak hasil dikecilkan padding dan min-width-nya */}
            <div className={`transition-all duration-500 p-3 md:p-4 rounded-xl border-2 inline-block min-w-[150px] md:min-w-[200px]
                ${currentDecimal === targetValue
                    ? 'bg-green-100 border-green-500 text-green-700 scale-105 md:scale-110'
                    : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-700'}
            `}>
                <span className="block text-[10px] md:text-xs font-bold uppercase">Total Saat Ini</span>
                <span className="text-2xl md:text-3xl font-mono font-bold">{currentDecimal}</span>
            </div>

            {currentDecimal === targetValue && (
                <div className="mt-4 md:mt-6 animate-bounce text-green-600 font-bold flex justify-center items-center gap-2 text-sm md:text-base">
                    <FaCheckCircle /> Sempurna! {targetValue} tercapai.
                </div>
            )}
        </div>
    );
}
