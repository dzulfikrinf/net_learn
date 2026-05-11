import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FaArrowLeft, FaGripVertical, FaPlus, FaPencilAlt, FaTrash } from 'react-icons/fa';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ManageModules({ lesson, modules: initialModules = [] }) {
    // --- STATE UTAMA ---
    const [modules, setModules] = useState(initialModules);
    const [isSavingOrder, setIsSavingOrder] = useState(false);

    // --- STATE MODAL ---
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // --- FORM INERTIA ---
    const { data, setData, post, put, processing, reset, errors } = useForm({
        type: 'text',
        content: '',
        order: modules.length + 1,
        quiz_question: '',
        quiz_answer: '',
        quiz_options: '',
    });

    // Sinkronisasi state lokal jika props berubah (misal setelah add/delete)
    useEffect(() => {
        setModules(initialModules);
    }, [initialModules]);

    // ===========================
    // BAGIAN 1: DRAG & DROP LOGIC
    // ===========================
    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(modules);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setModules(items); // Update UI Instan
        saveOrder(items);  // Update Database Background
    };

    const saveOrder = (newModules) => {
        setIsSavingOrder(true);
        // Kirim array ID yang sudah urut ke backend
        const orderedIds = newModules.map(m => m.id);

        // Pastikan Anda punya route ini di web.php untuk reorder (Opsional, tapi bagus utk UX)
        // Jika belum ada, urutan hanya tersimpan visual sampai di-refresh
        // router.post(route('admin.modules.reorder', lesson.id), { orderedIds }, { ... });

        setTimeout(() => setIsSavingOrder(false), 500); // Simulasi delay
    };

    // ===========================
    // BAGIAN 2: CRUD LOGIC
    // ===========================

    // A. BUKA MODAL TAMBAH
    const openCreateModal = () => {
        setIsEditing(false);
        setEditId(null);
        reset();
        setData(prev => ({ ...prev, order: modules.length + 1 }));
        setShowModal(true);
    };

    // B. BUKA MODAL EDIT
    const openEditModal = (module) => {
        setIsEditing(true);
        setEditId(module.id);

        let moduleData = {};
        try {
            moduleData = typeof module.data === 'string' ? JSON.parse(module.data) : module.data;
        } catch (e) {}

        setData({
            type: module.type,
            content: module.content,
            order: module.order,
            quiz_question: moduleData?.question || '',
            quiz_answer: moduleData?.answer || '',
            quiz_options: moduleData?.options ? moduleData.options.join(',') : '',
        });

        setShowModal(true);
    };

    // C. HAPUS MODULE
    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus quest ini?')) {
            router.delete(route('admin.module.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
                    // Update state lokal manual agar mulus (opsional, karena useEffect sudah handle)
                    setModules(prev => prev.filter(m => m.id !== id));
                }
            });
        }
    };

    // D. SUBMIT FORM (CREATE / UPDATE)
    const handleSubmit = (e) => {
        e.preventDefault();

        let finalData = null; // Default null

        // JIKA QUIZ: Buat Object (JANGAN JSON.stringify)
        if (data.type === 'quiz') {
            finalData = {
                question: data.quiz_question,
                // Tambahkan pengaman jika opsi kosong
                options: data.quiz_options ? data.quiz_options.split(',').map(o => o.trim()) : [],
                answer: data.quiz_answer
            };
        }

        // JIKA SIMULATOR: (Contoh, jika nanti butuh config tambahan)
        if (data.type.includes('simulator')) {
            finalData = { mode: 'manual' }; // Contoh default config
        }

        // Payload dikirim sebagai Object biasa
        const payload = {
            type: data.type,
            content: data.content,
            order: data.order,
            data: finalData // Ini dikirim sebagai Object/Array ke Laravel
        };

        if (isEditing) {
            router.put(route('admin.module.update', editId), payload, {
                onSuccess: () => { setShowModal(false); reset(); }
            });
        } else {
            router.post(route('admin.module.store', lesson.id), payload, {
                onSuccess: () => { setShowModal(false); reset(); }
            });
        }
    };

    // Helper UI
    const getTypeLabel = (type) => {
        if(type === 'text') return { label: 'Bacaan', color: 'bg-blue-100 text-blue-700 border-blue-200' };
        if(type === 'quiz') return { label: 'Kuis', color: 'bg-orange-100 text-orange-700 border-orange-200' };
        if(type.includes('simulator')) return { label: 'Simulator', color: 'bg-teal-100 text-teal-700 border-teal-200' };
        return { label: 'Lainnya', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8 font-sans text-slate-800">
            <Head title={`Atur Quest: ${lesson.title}`} />

            <div className="max-w-4xl mx-auto">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Link href={route('admin.content.index')} className="text-slate-500 hover:text-net-blue flex items-center gap-2 mb-2 text-sm font-bold">
                            <FaArrowLeft /> Kembali ke Kurikulum
                        </Link>
                        <h1 className="text-2xl font-bold">
                            Atur Quest: <span className="text-net-blue">{lesson.title}</span>
                        </h1>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="bg-net-blue text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <FaPlus /> Tambah Quest Baru
                    </button>
                </div>

                {/* LIST MODULES (DRAGGABLE) */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="modules-list">
                            {(provided) => (
                                <ul {...provided.droppableProps} ref={provided.innerRef} className="divide-y divide-slate-100">
                                    {modules.map((mod, index) => {
                                        const typeInfo = getTypeLabel(mod.type);
                                        return (
                                            <Draggable key={mod.id} draggableId={mod.id.toString()} index={index}>
                                                {(provided, snapshot) => (
                                                    <li
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`flex items-center p-4 gap-4 bg-white hover:bg-slate-50 transition group ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-200 z-10' : ''}`}
                                                    >
                                                        {/* HANDLE */}
                                                        <div {...provided.dragHandleProps} className="text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing p-2">
                                                            <FaGripVertical />
                                                        </div>

                                                        {/* NOMOR */}
                                                        <div className="text-slate-400 font-mono w-6 font-bold">{index + 1}.</div>

                                                        {/* KONTEN UTAMA */}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wide border ${typeInfo.color}`}>
                                                                    {typeInfo.label}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm font-medium text-slate-700 line-clamp-1">
                                                                {mod.type === 'quiz'
                                                                    ? `Q: ${mod.data?.question || (typeof mod.data === 'string' && JSON.parse(mod.data).question) || 'Soal Kuis'}`
                                                                    : mod.content ? mod.content.replace(/<[^>]*>?/gm, '').substring(0, 80) + '...' : '(Konten Visual)'
                                                                }
                                                            </div>
                                                        </div>

                                                        {/* TOMBOL AKSI (EDIT & HAPUS) */}
                                                        <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                                                            <button
                                                                onClick={() => openEditModal(mod)}
                                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                                                title="Edit"
                                                            >
                                                                <FaPencilAlt />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(mod.id)}
                                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                                                title="Hapus"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </li>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>

                    {modules.length === 0 && (
                        <div className="p-10 text-center text-slate-400">Belum ada materi di level ini.</div>
                    )}
                </div>
            </div>

            {/* === MODAL FORM (Sama seperti sebelumnya) === */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold mb-4 text-slate-800">
                        {isEditing ? 'Edit Quest' : 'Tambah Quest Baru'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <InputLabel value="Tipe Konten" />
                            <select
                                className="w-full border-slate-300 rounded-md mt-1"
                                value={data.type}
                                onChange={e => setData('type', e.target.value)}
                            >
                                <option value="text">Bacaan (Teks/HTML)</option>
                                <option value="video">Video (Youtube Embed)</option>
                                <option value="quiz">Kuis Pilihan Ganda</option>
                                <option value="simulator_cidr">Simulator CIDR</option>
                                <option value="simulator_flsm">Simulator FLSM</option>
                                <option value="simulator_vlsm">Simulator VLSM</option>
                            </select>
                        </div>

                        <div>
                            <InputLabel value={data.type === 'quiz' ? 'Instruksi Kuis' : 'Isi Konten (HTML Allowed)'} />
                            <textarea
                                className="w-full border-slate-300 rounded-md mt-1 h-32"
                                value={data.content}
                                onChange={e => setData('content', e.target.value)}
                                placeholder="Isi materi atau instruksi..."
                            />
                        </div>

                        {data.type === 'quiz' && (
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 space-y-3">
                                <div>
                                    <InputLabel value="Pertanyaan" />
                                    <TextInput className="w-full mt-1" value={data.quiz_question} onChange={e => setData('quiz_question', e.target.value)} />
                                </div>
                                <div>
                                    <InputLabel value="Pilihan (Pisahkan Koma)" />
                                    <TextInput className="w-full mt-1" value={data.quiz_options} onChange={e => setData('quiz_options', e.target.value)} placeholder="A, B, C" />
                                </div>
                                <div>
                                    <InputLabel value="Kunci Jawaban" />
                                    <TextInput className="w-full mt-1" value={data.quiz_answer} onChange={e => setData('quiz_answer', e.target.value)} />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-4 gap-2">
                            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold">Batal</button>
                            <PrimaryButton disabled={processing}>{isEditing ? 'Simpan Perubahan' : 'Simpan Quest'}</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}
