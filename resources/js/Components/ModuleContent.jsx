import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw'; // <--- INI OBAT BINGUNGNYA
import 'katex/dist/katex.min.css';

export default function ModuleContent({ content }) {
    return (
        <div className="w-full max-w-none">
            <article className="prose prose-lg prose-slate dark:prose-invert max-w-none
                prose-img:rounded-xl prose-img:shadow-lg prose-img:mx-auto
                prose-table:border-collapse prose-td:border prose-td:border-slate-300 dark:prose-td:border-slate-600 prose-td:p-3 prose-th:p-3">

                <ReactMarkdown
                    children={content}
                    remarkPlugins={[remarkGfm, remarkMath]}
                    // Tambahkan rehypeRaw di sini supaya HTML (Tabel) terbaca!
                    rehypePlugins={[rehypeKatex, rehypeRaw]}
                />
            </article>
        </div>
    );
}
