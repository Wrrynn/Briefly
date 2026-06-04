import type { NewsItem } from "@/app/data/mockNews";

export default function NewsHeader({ news }: { news: NewsItem }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 transition-colors">
          {news.category}
        </span>
        <span className="text-[11px] text-gray-500 dark:text-white/40 font-semibold tracking-wider transition-colors">
          {news.readTime} menit baca
        </span>
        <span className="text-gray-300 dark:text-white/20">•</span>
        <span className="text-[11px] text-gray-500 dark:text-white/40 font-semibold tracking-wider transition-colors">
          {news.time}
        </span>
      </div>

      {/* Teks diubah jadi text-gray-900 (Hitam pekat) di mode terang */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-gray-900 dark:text-white mb-6 transition-colors duration-500">
        {news.title}
      </h1>

      {/* Deskripsi diubah jadi text-gray-700 di mode terang */}
      <p className="text-lg md:text-xl text-gray-700 dark:text-white/60 leading-relaxed font-medium transition-colors duration-500">
        {news.description}
      </p>
    </div>
  );
}