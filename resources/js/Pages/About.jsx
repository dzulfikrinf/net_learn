import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaGithub, FaLinkedin, FaEnvelope, FaCode, FaLaptopCode, FaHeart, FaInstagram } from 'react-icons/fa';

export default function About() {
    // Daftar Tech Stack yang kamu gunakan (Bisa disesuaikan)
    const techStacks = [
        { name: 'Laravel', icon: '🐘', color: 'text-red-500' },
        { name: 'React.js', icon: '⚛️', color: 'text-cyan-400' },
        { name: 'Inertia.js', icon: '🔗', color: 'text-purple-500' },
        { name: 'Tailwind CSS', icon: '🌊', color: 'text-teal-400' },
        { name: 'Framer Motion', icon: '✨', color: 'text-pink-500' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300 selection:bg-net-blue selection:text-white">
            <Head title="Tentang Developer" />

            {/* HEADER */}
            <header className="h-16 flex items-center px-4 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <Link
                    href={route('course.map', 'jarkom')}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-net-blue dark:hover:text-cyan-400"
                >
                    <FaArrowLeft /> Kembali
                </Link>
            </header>

            {/* MAIN CONTENT */}
            <main className="max-w-4xl mx-auto px-4 py-12 md:py-20 relative">
                {/* Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-2xl overflow-hidden -z-10 pointer-events-none opacity-30 dark:opacity-20">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                    <div className="absolute top-20 right-10 w-64 h-64 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-40 w-64 h-64 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">

                    {/* LEFT COLUMN: KARTU PROFIL */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="md:col-span-5"
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 dark:border-slate-700 text-center relative overflow-hidden group">
                            {/* Accent line top */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-net-blue to-cyan-400"></div>

                            {/* FOTO PROFIL */}
                            <div className="w-32 h-32 mx-auto rounded-full p-1 bg-gradient-to-tr from-net-blue to-teal-400 mb-6 shadow-lg group-hover:scale-105 transition-transform duration-500">
                                <img
                                    src="/images/Me.jpeg" // Ganti dengan path foto aslimu, misal: "/images/profile.jpg"
                                    alt="Foto Developer"
                                    className="w-full h-full object-cover rounded-full border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-700"
                                />
                            </div>

                            <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-1">Dzulfikri Najmul Falah</h1>
                            <p className="text-net-blue dark:text-cyan-400 font-bold text-sm mb-4 uppercase tracking-widest">Fullstack Developer</p>

                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                                Mahasiswa tingkat akhir yang memiliki ketertarikan di bidang Web Development dan Jaringan Komputer.
                            </p>

                            {/* SOCIAL MEDIA LINKS */}
                            <div className="flex justify-center gap-4">
                                <a href="https://github.com/dzulfikrinf" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-800 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                                    <FaGithub size={18} />
                                </a>
                                <a href="https://linkedin.com/in/dzulfikrinf" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                                    <FaLinkedin size={18} />
                                </a>
                                <a href="mailto:dzulfikrinfalah@gmail.com" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                                    <FaEnvelope size={18} />
                                </a>
                                <a href="https://instagram.com/dzulfikrinf" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-pink-500 hover:text-white dark:hover:bg-pink-500 transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                                    <FaInstagram size={18} />
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN: CERITA & TECH STACK */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="md:col-span-7 space-y-6"
                    >
                        {/* KARTU CERITA */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4 dark:text-white">
                                <FaLaptopCode className="text-net-blue dark:text-cyan-400" /> Tentang NetLearn
                            </h2>
                            <div className="space-y-4 text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                                <p>
                                    <strong>NetLearn</strong> dibangun sebagai solusi untuk mempermudah siswa dalam memahami konsep Jaringan Komputer, khususnya pada materi perhitungan IP Address dan Subnetting (FLSM & VLSM) yang seringkali dianggap sulit.
                                </p>
                                <p>
                                    Aplikasi ini merupakan bagian dari tugas akhir/skripsi saya. Dengan mengusung konsep <em>Gamification</em> dan dibantu oleh asisten virtual <strong>NetBot</strong>, saya berharap proses belajar jaringan bisa menjadi pengalaman yang lebih interaktif, visual, dan menyenangkan.
                                </p>
                            </div>
                        </div>

                        {/* KARTU TECH STACK */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 dark:text-white">
                                <FaCode className="text-net-teal dark:text-teal-400" /> Teknologi yang Digunakan
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {techStacks.map((tech, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold shadow-sm">
                                        <span className={tech.color}>{tech.icon}</span>
                                        <span className="text-slate-700 dark:text-slate-300">{tech.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FOOTER KECIL */}
                        <div className="text-center md:text-left text-xs text-slate-400 dark:text-slate-500 pt-4 flex items-center justify-center md:justify-start gap-1">
                            Dibuat di Indonesia © {new Date().getFullYear()}
                        </div>
                    </motion.div>

                </div>
            </main>
        </div>
    );
}
