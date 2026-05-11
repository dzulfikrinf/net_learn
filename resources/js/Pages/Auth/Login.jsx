import React, { useEffect, useState } from "react";
import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import { FaNetworkWired, FaMoon, FaSun } from "react-icons/fa";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

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
            reset("password");
        };
    }, []);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <div className="min-h-[100dvh] flex flex-col justify-center items-center relative overflow-hidden font-sans transition-colors duration-500 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
            <Head title="Log in" />

            {/* Toggle Tema */}
            <button
                onClick={toggleTheme}
                className="absolute top-4 right-4 md:top-8 md:right-8 z-50 p-2 md:p-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm hover:scale-110 transition-all text-slate-600 dark:text-yellow-400"
            >
                {isDarkMode ? <FaSun className="w-4 h-4 md:w-5 md:h-5" /> : <FaMoon className="w-4 h-4 md:w-5 md:h-5" />}
            </button>

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none transition-opacity duration-500"
                style={{ backgroundImage: "radial-gradient(currentColor 1.5px, transparent 1.5px)", backgroundSize: "30px 30px", color: isDarkMode ? '#475569' : '#cbd5e1' }}
            ></div>

            {/* Hiasan Blob */}
            <div className="absolute top-[-5%] left-[-10%] md:top-[-10%] md:left-[-5%] w-48 h-48 md:w-96 md:h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[60px] md:blur-[80px] opacity-50 animate-blob transition-colors duration-500"></div>
            <div className="absolute bottom-[-5%] right-[-10%] md:bottom-[-10%] md:right-[-5%] w-48 h-48 md:w-96 md:h-96 bg-teal-300 dark:bg-teal-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[60px] md:blur-[80px] opacity-50 animate-blob animation-delay-2000 transition-colors duration-500"></div>

            {/* Card Login */}
            <div className="w-full max-w-md px-4 sm:px-0 relative z-10 animate-fade-in-up">
                {/* PERBAIKAN: Padding dikecilkan di HP (p-6), normal di PC (md:p-10) */}
                <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-2xl shadow-blue-900/10 dark:shadow-none border border-white/50 dark:border-slate-700/50 transition-colors duration-500">

                    {/* HEADER */}
                    <div className="text-center mb-6 md:mb-8">
                        {/* PERBAIKAN: Logo dikecilkan di HP */}
                        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 text-white mb-3 md:mb-5 shadow-lg shadow-blue-200 dark:shadow-cyan-900/30 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                            <FaNetworkWired className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <h2 className="text-xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-500">
                            NetLearn
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1 md:mt-2 font-medium">
                            Siap lanjut belajar? let's go login!
                        </p>
                    </div>

                    {status && (
                        <div className="mb-4 md:mb-6 font-medium text-xs md:text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-2 md:p-3 rounded-lg md:rounded-xl border border-green-200 dark:border-green-800 text-center animate-pulse">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4 md:space-y-5">
                        <div>
                            <InputLabel htmlFor="email" value="Email Address" className="text-slate-600 dark:text-slate-300 font-bold ml-1 mb-1 text-xs md:text-sm" />
                            {/* PERBAIKAN: Padding form dikecilkan di HP (py-2 px-3) */}
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="block w-full border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-blue-500 dark:focus:ring-cyan-400 rounded-lg md:rounded-xl shadow-inner py-2 px-3 md:py-3 md:px-4 text-sm md:text-base transition-colors"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData("email", e.target.value)}
                                placeholder="nama@siswa.com"
                            />
                            <InputError message={errors.email} className="mt-1 ml-1 text-xs" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Password" className="text-slate-600 dark:text-slate-300 font-bold ml-1 mb-1 text-xs md:text-sm" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="block w-full border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-blue-500 dark:focus:ring-cyan-400 rounded-lg md:rounded-xl shadow-inner py-2 px-3 md:py-3 md:px-4 text-sm md:text-base transition-colors"
                                autoComplete="current-password"
                                onChange={(e) => setData("password", e.target.value)}
                                placeholder="••••••••"
                            />
                            <InputError message={errors.password} className="mt-1 ml-1 text-xs" />
                        </div>

                        <div className="flex justify-between items-center text-xs md:text-sm px-1 pt-1">
                            <label className="flex items-center cursor-pointer group">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData("remember", e.target.checked)}
                                    className="w-4 h-4 text-blue-500 dark:text-cyan-500 focus:ring-blue-500 dark:focus:ring-cyan-500 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                                />
                                <span className="ms-2 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                                    Ingat Saya
                                </span>
                            </label>

                            <div className="text-slate-400 dark:text-slate-500 italic">
                                Lupa sandi? Hubungi Guru.
                            </div>
                        </div>

                        <div className="pt-2 md:pt-4">
                            <PrimaryButton
                                className="w-full justify-center py-2.5 md:py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 dark:from-cyan-600 dark:to-blue-700 border-none rounded-lg md:rounded-xl text-sm md:text-base font-bold text-white shadow-lg shadow-blue-200 dark:shadow-cyan-900/40 transition-all transform active:scale-95"
                                disabled={processing}
                            >
                                {processing ? "Memproses..." : "Mulai Belajar!"}
                            </PrimaryButton>
                        </div>

                        <div className="mt-4 md:mt-6 text-center text-xs md:text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4 md:pt-6">
                            Belum punya akun?{" "}
                            <Link href={route("register")} className="text-blue-600 dark:text-cyan-400 font-bold hover:underline transition-colors">
                                Daftar Sekarang
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            <div className="absolute bottom-4 md:bottom-6 text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-mono tracking-widest uppercase">
                &copy; 2025 NetLearn - By Dzulfikri Najmul Falah
            </div>
        </div>
    );
}
