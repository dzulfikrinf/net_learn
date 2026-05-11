import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
// 1. IMPORT LIBRARY DRAG & DROP
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    FaPlus, FaTrash, FaPen, FaGamepad, FaMapMarkerAlt,
    FaLayerGroup, FaGripVertical, FaArrowLeft, FaMoon, FaSun
} from 'react-icons/fa';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function CourseManager({ course, weeks: initialWeeks }) {
    // --- STATE DARK MODE ---
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' ||
                   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
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

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    // --- STATE UTAMA (MENGGUNAKAN LOCAL STATE AGAR UI DRAG MULUS) ---
    const [weeks, setWeeks] = useState(initialWeeks);

    // Sinkronisasi jika data dari server berubah (misal setelah add/delete)
    useEffect(() => {
        setWeeks(initialWeeks);
    }, [initialWeeks]);

    // --- STATE MODAL STAGE ---
    const [showStageModal, setShowStageModal] = useState(false);
    const [isEditingStage, setIsEditingStage] = useState(false);
    const [stageId, setStageId] = useState(null);

    // --- STATE MODAL LEVEL ---
    const [showLevelModal, setShowLevelModal] = useState(false);
    const [isEditingLevel, setIsEditingLevel] = useState(false);
    const [levelId, setLevelId] = useState(null);
    const [selectedWeekId, setSelectedWeekId] = useState(null);

    // --- FORM INERTIA ---
    const stageForm = useForm({ title: '', description: '' });
    const levelForm = useForm({ title: '' });

    // ===========================
    // LOGIC DRAG & DROP STAGE
    // ===========================
    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        // 1. Reorder di Client Side (Biar UI instan berubah)
        const items = Array.from(weeks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setWeeks(items);

        // 2. Kirim Urutan Baru ke Server (Background Process)
        const orderedIds = items.map(item => item.id);
        router.post(route('admin.weeks.reorder', course.id), {
            weeks: orderedIds
        }, {
            preserveScroll: true, // Agar scroll tidak lompat
            preserveState: true   // Agar state modal dll tidak reset
        });
    };

    // ===========================
    // LOGIC STAGE (CRUD)
    // ===========================
    const openCreateStage = () => {
        setIsEditingStage(false);
        stageForm.reset();
        setShowStageModal(true);
    };

    const openEditStage = (week) => {
        setIsEditingStage(true);
        setStageId(week.id);
        stageForm.setData({ title: week.title, description: week.description });
        setShowStageModal(true);
    };

    const submitStage = (e) => {
        e.preventDefault();
        if (isEditingStage) {
            stageForm.put(route('admin.week.update', stageId), { onSuccess: () => setShowStageModal(false) });
        } else {
            stageForm.post(route('admin.week.store', course.id), { onSuccess: () => setShowStageModal(false) });
        }
    };

    const deleteStage = (id) => {
        if (confirm('BAHAYA: Menghapus Stage ini akan menghapus semua Level & Quest di dalamnya! Lanjutkan?')) {
            router.delete(route('admin.week.destroy', id));
        }
    };

    // ===========================
    // LOGIC LEVEL (CRUD)
    // ===========================
    const openCreateLevel = (weekId) => {
        setIsEditingLevel(false);
        setSelectedWeekId(weekId);
        levelForm.reset();
        setShowLevelModal(true);
    };

    const openEditLevel = (lesson) => {
        setIsEditingLevel(true);
        setLevelId(lesson.id);
        levelForm.setData({ title: lesson.title });
        setShowLevelModal(true);
    };

    const submitLevel = (e) => {
        e.preventDefault();
        if (isEditingLevel) {
            levelForm.put(route('admin.lesson.update', levelId), { onSuccess: () => setShowLevelModal(false) });
        } else {
            levelForm.post(route('admin.lesson.store', selectedWeekId), { onSuccess: () => setShowLevelModal(false) });
        }
    };

    const deleteLevel = (id) => {
        if (confirm('Yakin ingin menghapus Level ini?')) {
            router.delete(route('admin.lesson.destroy', id));
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-8 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
            <Head title={`Peta: ${course.title}`} />

            <div className="max-w-5xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <Link
                        href={route('admin.dashboard')}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-net-blue dark:text-slate-400 dark:hover:text-cyan-400 transition font-bold text-sm"
                    >
                        <FaArrowLeft /> Kembali ke Dashboard Guru
                    </Link>

                    {/* TOMBOL TOGGLE DARK MODE */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full transition-all duration-300 bg-white dark:bg-slate-800 text-slate-600 dark:text-yellow-400 shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                        title="Switch Theme"
                    >
                        {isDarkMode ? <FaSun /> : <FaMoon />}
                    </button>
                </div>

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                            <FaGamepad className="text-net-blue dark:text-cyan-400"/>
                            {course.title}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold mt-1 uppercase tracking-widest text-xs">World Map Editor</p>
                    </div>
                    <button
                        onClick={openCreateStage}
                        className="bg-net-blue hover:bg-blue-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 dark:shadow-cyan-500/20 hover:scale-105 transition flex items-center gap-2"
                    >
                        <FaPlus /> Buat Stage Baru
                    </button>
                </div>

                {/* --- AREA DRAG & DROP STAGE --- */}
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="stages-list">
                        {(provided) => (
                            <div
                                className="space-y-8"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {weeks.map((week, index) => (
                                    <Draggable key={week.id} draggableId={week.id.toString()} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative transition-all duration-300 ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-400 dark:ring-cyan-500 z-50 scale-[1.02]' : ''}`}
                                            >

                                                {/* STAGE HEADER */}
                                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex justify-between items-start border-b border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-start gap-4 w-full">

                                                        {/* HANDLE DRAG (Grip Icon) */}
                                                        <div
                                                            {...provided.dragHandleProps}
                                                            className="mt-3 text-slate-300 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400 cursor-grab active:cursor-grabbing transition-colors"
                                                        >
                                                            <FaGripVertical size={20} />
                                                        </div>

                                                        {/* ICON NOMOR STAGE */}
                                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-cyan-600 dark:to-blue-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
                                                            {index + 1}
                                                        </div>

                                                        {/* INFO STAGE */}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{week.title}</h2>
                                                                <button onClick={() => openEditStage(week)} className="text-slate-400 hover:text-net-blue dark:text-slate-500 dark:hover:text-cyan-400 transition-colors"><FaPen size={12}/></button>
                                                            </div>
                                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{week.description || 'Tidak ada deskripsi.'}</p>
                                                        </div>
                                                    </div>

                                                    {/* TOMBOL HAPUS */}
                                                    <button onClick={() => deleteStage(week.id)} className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition ml-4 mt-2">
                                                        <FaTrash />
                                                    </button>
                                                </div>

                                                {/* LIST LEVELS (LESSONS) - TIDAK DRAGGABLE */}
                                                <div className="p-6 bg-white dark:bg-slate-900">
                                                    <div className="space-y-3">
                                                        {week.lessons && week.lessons.length > 0 ? (
                                                            week.lessons.map((lesson) => (
                                                                <div key={lesson.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-cyan-500/50 transition duration-300 group gap-4 sm:gap-0">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="text-slate-300 dark:text-slate-500 group-hover:text-net-blue dark:group-hover:text-cyan-400 transition-colors"><FaLayerGroup /></div>
                                                                        <span className="font-bold text-slate-700 dark:text-slate-200">{lesson.title}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 self-end sm:self-auto">
                                                                        <Link
                                                                            href={route('admin.lesson.modules', lesson.id)}
                                                                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs sm:text-sm font-bold hover:bg-net-blue hover:text-white dark:hover:bg-cyan-600 dark:hover:border-cyan-500 dark:hover:text-white transition flex items-center gap-2"
                                                                        >
                                                                            <FaMapMarkerAlt /> Atur Quest
                                                                        </Link>
                                                                        <button onClick={() => openEditLevel(lesson)} className="p-2 text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-cyan-400 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
                                                                            <FaPen />
                                                                        </button>
                                                                        <button onClick={() => deleteLevel(lesson.id)} className="p-2 text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
                                                                            <FaTrash />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-sm italic border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                                                                Belum ada Level di Stage ini.
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => openCreateLevel(week.id)}
                                                        className="mt-4 w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-xl font-bold hover:border-net-blue dark:hover:border-cyan-500 hover:text-net-blue dark:hover:text-cyan-400 hover:bg-blue-50 dark:hover:bg-cyan-900/20 transition flex items-center justify-center gap-2"
                                                    >
                                                        <FaPlus /> Tambah Level Baru
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                {weeks.length === 0 && (
                    <div className="text-center py-20 opacity-50 dark:opacity-40">
                        <p className="font-bold text-slate-600 dark:text-slate-400">Dunia ini masih kosong. Mulai dengan membuat Stage.</p>
                    </div>
                )}
            </div>

            {/* === MODAL STAGE (WEEK) === */}
            <Modal show={showStageModal} onClose={() => setShowStageModal(false)}>
                <div className="p-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors">
                    <h2 className="text-lg font-bold mb-4">{isEditingStage ? 'Edit Stage' : 'Buat Stage Baru'}</h2>
                    <form onSubmit={submitStage} className="space-y-4">
                        <div>
                            <InputLabel value="Nama Stage" className="dark:text-slate-300" />
                            <TextInput
                                className="w-full mt-1 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                value={stageForm.data.title}
                                onChange={e => stageForm.setData('title', e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div>
                            <InputLabel value="Deskripsi Singkat" className="dark:text-slate-300" />
                            <TextInput
                                className="w-full mt-1 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                value={stageForm.data.description}
                                onChange={e => stageForm.setData('description', e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                            <button type="button" onClick={() => setShowStageModal(false)} className="px-4 py-2 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-700 dark:hover:text-slate-200 transition">Batal</button>
                            <PrimaryButton disabled={stageForm.processing} className="dark:bg-cyan-600 dark:hover:bg-cyan-500">Simpan</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* === MODAL LEVEL (LESSON) === */}
            <Modal show={showLevelModal} onClose={() => setShowLevelModal(false)}>
                <div className="p-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors">
                    <h2 className="text-lg font-bold mb-4">{isEditingLevel ? 'Edit Level' : 'Tambah Level Baru'}</h2>
                    <form onSubmit={submitLevel} className="space-y-4">
                        <div>
                            <InputLabel value="Nama Level" className="dark:text-slate-300" />
                            <TextInput
                                className="w-full mt-1 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                value={levelForm.data.title}
                                onChange={e => levelForm.setData('title', e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                            <button type="button" onClick={() => setShowLevelModal(false)} className="px-4 py-2 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-700 dark:hover:text-slate-200 transition">Batal</button>
                            <PrimaryButton disabled={levelForm.processing} className="dark:bg-cyan-600 dark:hover:bg-cyan-500">Simpan</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}
