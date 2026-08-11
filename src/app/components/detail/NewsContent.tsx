import type { NewsItem } from "@/app/data/mockNews";

export default function NewsContent({ news }: { news: NewsItem }) {
    const paragraphs = news.fullContent?.split("\n\n") || [news.description];

    return (
        // Kelas `prose prose-lg dark:prose-invert` sudah dibuang: plugin
        // @tailwindcss/typography tidak terpasang di proyek ini, jadi ketiganya
        // tidak berpengaruh apa pun. Gaya paragraf memang ditulis langsung di
        // bawah — kelas yang tidak aktif hanya menyesatkan yang mengedit nanti.
        <article className="max-w-none pb-20">
            <div className="space-y-6">
                {paragraphs.map((p, i) => (
                    <p
                        key={i}
                        className="text-[17px] md:text-[19px] leading-[1.8] text-gray-800 dark:text-white/80 font-medium text-justify transition-colors duration-500"
                    >
                        {p}
                    </p>
                ))}
            </div>
        </article>
    );
}
