"use client";

import Link from "next/link";

function getDominantSentiment(sentiments: any[]): "Positif" | "Negatif" | "Netral" | null {
    if (!sentiments?.length) return null;
    return sentiments.reduce((prev: any, curr: any) =>
        curr.percentage > prev.percentage ? curr : prev,
    ).type;
}

const sentimentBadge: Record<string, string> = {
    Positif: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/25",
    Negatif: "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/25",
    Netral: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/25",
};

export default function NewsCard({ data }: any) {
    const sentiment = getDominantSentiment(data.sentiments);

    return (
        <div className="group relative flex flex-col bg-white dark:bg-[#0c0c20] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-600 dark:hover:border-blue-500/40 hover:shadow-2xl hover:-translate-y-1 shadow-lg shadow-gray-100/60 dark:shadow-none">
            <div className="flex flex-col flex-1 p-6">
                {/* Kategori + Sentimen */}
                <div className="flex justify-between items-center gap-2 mb-4">
                    <span className="bg-gray-900 dark:bg-white text-white dark:text-black font-black text-[10px] px-3 py-1.5 rounded-md uppercase tracking-[0.2em]">
                        {data.category}
                    </span>
                    {sentiment && (
                        <span className={`text-[9px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-md border ${sentimentBadge[sentiment]}`}>
                            {sentiment}
                        </span>
                    )}
                </div>

                {/* Sumber · Waktu */}
                <p className="text-[10px] text-gray-400 dark:text-white/50 font-bold uppercase tracking-widest mb-4">
                    {data.source} <span className="text-gray-300 dark:text-white/20">·</span> {data.time}
                </p>

                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white leading-snug mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 tracking-tight line-clamp-2">
                    {data.title}
                </h2>

                <p className="text-sm text-gray-600 dark:text-white/60 line-clamp-2 mb-6 font-normal leading-relaxed">
                    {data.description}
                </p>

                <Link
                    href={`/news/${data.id}`}
                    className="block w-full mt-auto py-3.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.25em] hover:bg-blue-600 dark:hover:bg-gray-200 transition-all duration-300 active:scale-95 text-center"
                >
                    Analisis Lengkap →
                </Link>
            </div>
        </div>
    );
}
