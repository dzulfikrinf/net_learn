import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

// --- PERBAIKAN DISINI: Cek dulu sebelum register ---
if (!Quill.imports['modules/imageResize']) {
    Quill.register('modules/imageResize', ImageResize);
}
// --------------------------------------------------

export default function CreateModule({ lesson, nextOrder }) {
    const [selectedType, setSelectedType] = useState('text');

    const { data, setData, post, processing, errors } = useForm({
        type: 'text',
        content: '',
        data: {},
        order: nextOrder
    });

    const handleTypeChange = (e) => {
        const type = e.target.value;
        setSelectedType(type);

        let initialData = {};
        if (type === 'quiz') {
            initialData = { question: '', options: ['', '', '', ''], answer: '' };
        } else if (type === 'simulator_vlsm') {
            initialData = { network: '192.168.10.0/24' };
        }

        setData(prev => ({
            ...prev,
            type: type,
            content: '',
            data: initialData
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.module.store', lesson.id));
    };

    // Konfigurasi Toolbar
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link', 'image', 'video'],
            ['clean']
        ],
        // Aktifkan Image Resize
        imageResize: {
            parchment: Quill.import('parchment'),
            modules: ['Resize', 'DisplaySize']
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8 font-sans text-slate-800">
            <Head title="Tambah Materi" />

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link href={route('admin.dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-net-blue font-bold transition">
                        <FaArrowLeft /> Batal
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Tambah Modul: <span className="text-net-blue">{lesson.title}</span>
                    </h1>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
                    <form onSubmit={submit} className="space-y-6">

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Tipe Konten</label>
                            <select
                                value={data.type}
                                onChange={handleTypeChange}
                                className="w-full border-slate-300 rounded-lg shadow-sm focus:border-net-blue focus:ring-net-blue py-3"
                            >
                                <option value="text">📄 Materi Bacaan (Artikel/Video)</option>
                                <option value="quiz">❓ Kuis Pilihan Ganda</option>
                                <option value="simulator_vlsm">🛠️ Simulator VLSM</option>
                                <option value="code_editor">💻 Latihan Coding</option>
                            </select>
                        </div>

                        {selectedType === 'text' && (
                            <div className="animate-fade-in">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Isi Materi</label>
                                <div className="bg-white">
                                    <ReactQuill
                                        theme="snow"
                                        value={data.content}
                                        onChange={(value) => setData('content', value)}
                                        modules={quillModules}
                                        className="h-80 mb-16"
                                        placeholder="Tulis materi di sini, paste gambar, atau embed video youtube..."
                                    />
                                </div>
                                {errors.content && <div className="text-red-500 text-sm mt-1">{errors.content}</div>}
                            </div>
                        )}

                        {selectedType === 'quiz' && (
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Pertanyaan</label>
                                    <input
                                        type="text"
                                        className="w-full border-slate-300 rounded-lg focus:border-net-blue focus:ring-net-blue"
                                        value={data.data.question || ''}
                                        onChange={e => setData('data', { ...data.data, question: e.target.value })}
                                        placeholder="Contoh: Apa kepanjangan IP?"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[0, 1, 2, 3].map((idx) => (
                                        <div key={idx}>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Opsi {String.fromCharCode(65 + idx)}</label>
                                            <input
                                                type="text"
                                                className="w-full border-slate-300 rounded-lg focus:border-net-blue focus:ring-net-blue"
                                                value={data.data.options?.[idx] || ''}
                                                onChange={e => {
                                                    const newOpts = [...(data.data.options || [])];
                                                    newOpts[idx] = e.target.value;
                                                    setData('data', { ...data.data, options: newOpts });
                                                }}
                                                placeholder={`Jawaban ${idx + 1}`}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Kunci Jawaban</label>
                                    <input
                                        type="text"
                                        className="w-full border-green-300 rounded-lg focus:border-green-500 focus:ring-green-500 bg-green-50"
                                        value={data.data.answer || ''}
                                        onChange={e => setData('data', { ...data.data, answer: e.target.value })}
                                        placeholder="Copy paste jawaban yang benar persis ke sini"
                                    />
                                </div>
                            </div>
                        )}

                        {selectedType === 'simulator_vlsm' && (
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 text-blue-800 animate-fade-in">
                                <h3 className="font-bold text-lg mb-2">ℹ️ Info Simulator</h3>
                                <p className="text-sm">
                                    Modul ini akan menampilkan alat interaktif VLSM secara layar penuh.
                                    Tidak ada konfigurasi tambahan yang diperlukan.
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end pt-6 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-net-blue text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition flex items-center gap-2 transform hover:-translate-y-1"
                            >
                                <FaSave /> Simpan Materi
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
