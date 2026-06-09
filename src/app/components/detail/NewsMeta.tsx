import type { NewsItem } from "@/app/data/mockNews";

export default function NewsMeta({ news }: { news: NewsItem }) {
  return (
    <div className="flex flex-wrap items-center gap-6 py-6 border-y border-gray-200 dark:border-white/[0.06] mb-10 transition-colors duration-500">
      <div>
        <p className="text-[11px] text-gray-500 dark:text-white/40 uppercase tracking-widest font-bold mb-0.5 transition-colors">Sumber</p>
        <p className="text-sm font-bold text-gray-900 dark:text-white/90 uppercase tracking-wide transition-colors">{news.source}</p>
      </div>

      <div className="w-[1px] h-8 bg-gray-200 dark:bg-white/10 hidden sm:block transition-colors" />

      <div>
        <p className="text-[11px] text-gray-500 dark:text-white/40 uppercase tracking-widest font-bold mb-0.5 transition-colors">Dipublikasikan</p>
        <p className="text-sm font-bold text-gray-900 dark:text-white/90 transition-colors">{news.publishedAt || "Baru saja"}</p>
      </div>
    </div>
  );
}