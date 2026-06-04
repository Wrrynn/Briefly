import type { NewsItem } from "@/app/data/mockNews";

export default function NewsContent({ news }: { news: NewsItem }) {
  const paragraphs = news.fullContent?.split("\n\n") || [news.description];

  return (
    <article className="prose prose-lg dark:prose-invert max-w-none pb-20">
      <div className="space-y-6">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className="text-[17px] md:text-[19px] leading-[1.8] text-gray-800 dark:text-white/80 font-medium transition-colors duration-500"
          >
            {p}
          </p>
        ))}
      </div>
    </article>
  );
}
