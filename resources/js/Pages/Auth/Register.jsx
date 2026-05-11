import React, { useEffect, useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FaNetworkWired, FaUser, FaEnvelope, FaLock, FaCheckCircle, FaSun, FaMoon } from 'react-icons/fa';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    // --- TEMA DARK MODE ---
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) return savedTheme === 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <div className="min-h-[100dvh] flex flex-col justify-center items-center relative overflow-hidden font-sans transition-colors duration-500 py-10 md:py-0
            bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
        >
            <Head title="Register" />

            {/* === TOMBOL TOGGLE TEMA === */}
            <button
                onClick={toggleTheme}
                className="absolute top-4 right-4 md:top-8 md:right-8 z-50 p-2 md:p-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm hover:scale-110 transition-all text-slate-600 dark:text-yellow-400"
            >
                {isDarkMode ? <FaSun className="w-4 h-4 md:w-5 md:h-5" /> : <FaMoon className="w-4 h-4 md:w-5 md:h-5" />}
            </button>

            {/* === BACKGROUND PATTERN === */}
            <div className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none transition-opacity duration-500"
                style={{ backgroundImage: "radial-gradient(currentColor 1.5px, transparent 1.5px)", backgroundSize: "30px 30px", color: isDarkMode ? '#475569' : '#cbd5e1' }}
            ></div>

            {/* Hiasan Blob Glow */}
            <div className="absolute top-[-5%] right-[-10%] md:top-[-10%] md:right-[-5%] w-48 h-48 md:w-96 md:h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[60px] md:blur-[80px] opacity-50 animate-blob transition-colors duration-500"></div>
            <div className="absolute bottom-[-5%] left-[-10%] md:bottom-[-10%] md:left-[-5%] w-48 h-48 md:w-96 md:h-96 bg-teal-300 dark:bg-teal-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[60px] md:blur-[80px] opacity-50 animate-blob animation-delay-2000 transition-colors duration-500"></div>

            {/* === CARD REGISTER === */}
            <div className="w-full max-w-md px-4 sm:px-0 relative z-10 animate-fade-in-up mt-8 md:mt-0">
                <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-2xl shadow-blue-900/10 dark:shadow-none border border-white/50 dark:border-slate-700/50 transition-colors duration-500">

                    {/* HEADER */}
                    <div className="text-center mb-6 md:mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 text-white mb-3 md:mb-5 shadow-lg shadow-blue-200 dark:shadow-cyan-900/30 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                            <FaNetworkWired className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <h2 className="text-xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-500">
                            Buat Akun Baru 🚀
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1 md:mt-2 font-medium">
                            Bergabunglah dan mulai belajar jaringan.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">

                        {/* Input Name */}
                        <div>
                            <InputLabel htmlFor="name" value="Nama Lengkap" className="text-slate-600 dark:text-slate-300 font-bold ml-1 mb-1 text-xs md:text-sm" />
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                    <FaUser className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </div>
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="block w-full pl-9 md:pl-11 pr-3 md:pr-4 py-2 md:py-3 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-blue-500 dark:focus:ring-cyan-400 rounded-lg md:rounded-xl shadow-inner text-sm md:text-base transition-colors"
                                    autoComplete="name"
                                    isFocused={true}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    placeholder="Budi Santoso"
                                />
                            </div>
                            <InputError message={errors.name} className="mt-1 ml-1 text-xs" />
                        </div>

                        {/* Input Email */}
                        <div>
                            <InputLabel htmlFor="email" value="Email" className="text-slate-600 dark:text-slate-300 font-bold ml-1 mb-1 text-xs md:text-sm" />
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                    <FaEnvelope className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </div>
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block w-full pl-9 md:pl-11 pr-3 md:pr-4 py-2 md:py-3 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-blue-500 dark:focus:ring-cyan-400 rounded-lg md:rounded-xl shadow-inner text-sm md:text-base transition-colors"
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    placeholder="budi@siswa.com"
                                />
                            </div>
                            <InputError message={errors.email} className="mt-1 ml-1 text-xs" />
                        </div>

                        {/* Input Password */}
                        <div>
                            <InputLabel htmlFor="password" value="Password" className="text-slate-600 dark:text-slate-300 font-bold ml-1 mb-1 text-xs md:text-sm" />
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                    <FaLock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </div>
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="block w-full pl-9 md:pl-11 pr-3 md:pr-4 py-2 md:py-3 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-blue-500 dark:focus:ring-cyan-400 rounded-lg md:rounded-xl shadow-inner text-sm md:text-base transition-colors"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    placeholder="Minimal 8 karakter"
                                />
                            </div>
                            <InputError message={errors.password} className="mt-1 ml-1 text-xs" />
                        </div>

                        {/* Input Confirm Password */}
                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" className="text-slate-600 dark:text-slate-300 font-bold ml-1 mb-1 text-xs md:text-sm" />
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                    <FaCheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </div>
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="block w-full pl-9 md:pl-11 pr-3 md:pr-4 py-2 md:py-3 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-blue-500 dark:focus:ring-cyan-400 rounded-lg md:rounded-xl shadow-inner text-sm md:text-base transition-colors"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                    placeholder="Ulangi password"
                                />
                            </div>
                            <InputError message={errors.password_confirmation} className="mt-1 ml-1 text-xs" />
                        </div>

                        {/* Tombol Register */}
                        <div className="pt-4">
                            <PrimaryButton
                                className="w-full justify-center py-2.5 md:py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 dark:from-cyan-600 dark:to-blue-700 border-none rounded-lg md:rounded-xl text-sm md:text-base font-bold text-white shadow-lg shadow-blue-200 dark:shadow-cyan-900/40 transition-all transform active:scale-95"
                                disabled={processing}
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Memproses...
                                    </span>
                                ) : "Daftar Sekarang"}
                            </PrimaryButton>
                        </div>

                        {/* Link Login */}
                        <div className="mt-4 md:mt-6 text-center text-xs md:text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4 md:pt-6">
                            Sudah punya akun?{' '}
                            <Link href={route('login')} className="text-blue-600 dark:text-cyan-400 font-bold hover:underline transition-colors">
                                Masuk di sini
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Footer Copyright */}
            <div className="relative z-10 mt-8 mb-4 md:mb-6 md:absolute md:bottom-6 text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-mono tracking-widest uppercase text-center w-full px-4">
                &copy; 2025 NetLearn - Media Pembelajaran Jaringan Komputer
            </div>
        </div>
    );
}
