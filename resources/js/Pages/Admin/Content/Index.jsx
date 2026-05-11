import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { FaPlus, FaFolder, FaBook, FaFileAlt, FaLayerGroup, FaPenNib, FaVideo, FaMicrochip, FaUserTie, FaNetworkWired, FaCode } from 'react-icons/fa';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ContentIndex({ courses }) {
    // State Modal
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showWeekModal, setShowWeekModal] = useState(false);
    const [showLessonModal, setShowLessonModal] = useState(false);

    const [selectedId, setSelectedId] = useState(null); // ID Course/Week yg dipilih

    const iconMap = {
        'FaNetworkWired': FaNetworkWired,
        'FaCode': FaCode,
        'FaPenNib': FaPenNib,
        'FaVideo': FaVideo,
        'FaMicrochip': FaMicrochip,
        'FaUserTie': FaUserTie,
        'FaBook': FaBook,
    };

    const themeMap = {
        'blue': 'from-blue-500 to-cyan-400 shadow-blue-200',
        'purple': 'from-purple-500 to-pink-400 shadow-purple-200',
        'green': 'from-emerald-500 to-teal-400 shadow-emerald-200',
        // Tambahan:
        'orange': 'from-orange-400 to-yellow-400 shadow-orange-200',
        'red': 'from-red-500 to-rose-400 shadow-red-200',
        'teal': 'from-teal-500 to-cyan-500 shadow-teal-200',
    };

    // --- FORM 1: COURSE ---
    const courseForm = useForm({
        title: '',
        description: '',
        category: 'network', // Default
        color_theme: 'blue'
    });

    const submitCourse = (e) => {
        e.preventDefault();
        courseForm.post(route('admin.course.store'), {
            onSuccess: () => { setShowCourseModal(false); courseForm.reset(); }
        });
    };

    // --- FORM 2: WEEK ---
    const weekForm = useForm({ title: '', description: '' });
    const submitWeek = (e) => {
        e.preventDefault();
        weekForm.post(route('admin.week.store', selectedId), {
            onSuccess: () => { setShowWeekModal(false); weekForm.reset(); }
        });
    };

    // --- FORM 3: LESSON ---
    const lessonForm = useForm({ title: '', slug: '', xp_reward: 100 });
    const submitLesson = (e) => {
        e.preventDefault();
        lessonForm.post(route('admin.lesson.store', selectedId), {
            onSuccess: () => { setShowLessonModal(false); lessonForm.reset(); }
        });
    };

    // Auto Slug
    const handleTitleChange = (e) => {
        const val = e.target.value;
        lessonForm.setData({
            ...lessonForm.data,
            title: val,
            slug: val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8 font-sans text-slate-800">
            <Head title="Manajemen Kurikulum" />

            <div className="max-w-5xl mx-auto">
                {/* Header Utama */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Manajemen Kurikulum</h1>
                        <Link href={route('admin.dashboard')} className="text-sm font-bold text-slate-500 hover:text-net-blue">
                            &larr; Kembali ke Dashboard Siswa
                        </Link>
                    </div>

                    {/* TOMBOL TAMBAH COURSE */}
                    <button
                        onClick={() => setShowCourseModal(true)}
                        className="bg-net-teal text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-teal-600 transition flex items-center gap-2"
                    >
                        <FaPlus /> Buat Mata Pelajaran Baru
                    </button>
                </div>

                {/* LIST COURSES */}
                <div className="space-y-10">
                    {courses.map(course => (
                        <div key={course.id} className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">

                            {/* HEADER COURSE */}
                            <div className={`px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r ${course.color_theme === 'purple' ? 'from-purple-50 to-white' : 'from-blue-50 to-white'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl text-white shadow-sm ${course.color_theme === 'purple' ? 'bg-purple-500' : 'bg-net-blue'}`}>
                                        <FaLayerGroup size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">{course.title}</h2>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider">{course.category} • {course.weeks.length} Minggu</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setSelectedId(course.id); setShowWeekModal(true); }}
                                    className="bg-white border border-slate-300 text-slate-600 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition"
                                >
                                    <FaPlus /> Tambah Minggu
                                </button>
                            </div>

                            {/* LIST WEEKS */}
                            <div className="p-6 space-y-8 bg-slate-50/50">
                                {course.weeks.length > 0 ? course.weeks.map(week => (
                                    <div key={week.id} className="relative pl-6 border-l-4 border-slate-300 hover:border-net-blue transition-colors">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-700">
                                                    {week.title}
                                                </h3>
                                                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-mono">Minggu {week.week_number}</span>
                                            </div>
                                            <button
                                                onClick={() => { setSelectedId(week.id); setShowLessonModal(true); }}
                                                className="text-net-blue hover:underline text-xs font-bold flex items-center gap-1"
                                            >
                                                <FaPlus /> Tambah Materi (Lesson)
                                            </button>
                                        </div>

                                        {/* LIST LESSONS */}
                                        <div className="space-y-2">
                                            {week.lessons.map(lesson => (
                                                <div key={lesson.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-slate-100 p-2 rounded text-slate-400">
                                                            <FaBook />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-700">{lesson.title}</div>
                                                            <div className="text-xs text-slate-400">{lesson.modules.length} Modul • +{lesson.xp_reward} XP</div>
                                                        </div>
                                                    </div>

                                                    {/* TOMBOL ATUR KONTEN */}
                                                    <Link
                                                        href={route('admin.lesson.modules', lesson.id)}
                                                        className="text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded font-bold text-slate-600 hover:text-white hover:bg-slate-600 transition flex items-center gap-2"
                                                    >
                                                        <FaFileAlt /> Atur Konten
                                                    </Link>
                                                </div>
                                            ))}
                                            {week.lessons.length === 0 && (
                                                <div className="text-xs text-slate-400 italic bg-slate-100/50 p-2 rounded border border-dashed border-slate-200">
                                                    Belum ada materi di minggu ini.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-slate-400 italic">
                                        Belum ada jadwal minggu untuk mata pelajaran ini.
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* === MODAL 1: TAMBAH COURSE === */}
            <Modal show={showCourseModal} onClose={() => setShowCourseModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold mb-4 text-slate-800">Buat Mata Pelajaran Baru</h2>
                    <form onSubmit={submitCourse} className="space-y-4">
                        <div>
                            <InputLabel value="Nama Mata Pelajaran" />
                            <TextInput
                                className="w-full mt-1"
                                value={courseForm.data.title}
                                onChange={e => courseForm.setData('title', e.target.value)}
                                placeholder="Contoh: Desain Grafis Dasar"
                                required
                            />
                        </div>
                        <div>
                            <InputLabel value="Deskripsi Singkat" />
                            <TextInput
                                className="w-full mt-1"
                                value={courseForm.data.description}
                                onChange={e => courseForm.setData('description', e.target.value)}
                                placeholder="Penjelasan singkat..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Kategori Materi" />
                                <select
                                    className="w-full border-slate-300 rounded-md mt-1 focus:ring-net-blue focus:border-net-blue"
                                    value={courseForm.data.category}
                                    onChange={e => courseForm.setData('category', e.target.value)}
                                >
                                    <option value="network">Jaringan (Network)</option>
                                    <option value="programming">Pemrograman (Coding)</option>
                                    <option value="design">Desain Grafis / UI/UX</option>
                                    <option value="multimedia">Multimedia & Video</option>
                                    <option value="hardware">Hardware & IoT</option>
                                    <option value="softskill">Soft Skill / Umum</option>
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Tema Warna Kartu" />
                                <select
                                    className="w-full border-slate-300 rounded-md mt-1 focus:ring-net-blue focus:border-net-blue"
                                    value={courseForm.data.color_theme}
                                    onChange={e => courseForm.setData('color_theme', e.target.value)}
                                >
                                    <option value="blue">Biru (Network)</option>
                                    <option value="purple">Ungu (Coding)</option>
                                    <option value="green">Hijau (Science)</option>
                                    <option value="orange">Oranye (Creative)</option>
                                    <option value="red">Merah (Hardware)</option>
                                    <option value="teal">Teal (Modern)</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <PrimaryButton disabled={courseForm.processing}>Simpan Course</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* === MODAL 2: TAMBAH WEEK === */}
            <Modal show={showWeekModal} onClose={() => setShowWeekModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold mb-4">Tambah Minggu Baru</h2>
                    <form onSubmit={submitWeek} className="space-y-4">
                        <div>
                            <InputLabel value="Judul Minggu" />
                            <TextInput
                                className="w-full mt-1"
                                value={weekForm.data.title}
                                onChange={e => weekForm.setData('title', e.target.value)}
                                placeholder="Contoh: Konsep Routing"
                                required
                            />
                        </div>
                        <div className="flex justify-end pt-4">
                            <PrimaryButton disabled={weekForm.processing}>Simpan Minggu</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* === MODAL 3: TAMBAH LESSON === */}
            <Modal show={showLessonModal} onClose={() => setShowLessonModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold mb-4">Tambah Level Pelajaran</h2>
                    <form onSubmit={submitLesson} className="space-y-4">
                        <div>
                            <InputLabel value="Judul Pelajaran" />
                            <TextInput
                                className="w-full mt-1"
                                value={lessonForm.data.title}
                                onChange={handleTitleChange}
                                required
                            />
                        </div>
                        <div>
                            <InputLabel value="Slug URL (Otomatis)" />
                            <TextInput
                                className="w-full mt-1 bg-slate-100 text-slate-500"
                                value={lessonForm.data.slug}
                                readOnly
                            />
                        </div>
                        <div>
                            <InputLabel value="Hadiah XP" />
                            <TextInput
                                type="number"
                                className="w-full mt-1"
                                value={lessonForm.data.xp_reward}
                                onChange={e => lessonForm.setData('xp_reward', e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex justify-end pt-4">
                            <PrimaryButton disabled={lessonForm.processing}>Simpan Level</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

        </div>
    );
}
