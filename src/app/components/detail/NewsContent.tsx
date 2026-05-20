import type { NewsItem } from "@/app/data/mockNews";

export default function NewsContent({ news }: { news: NewsItem }) {
  const paragraphs = news.fullContent?.split("\n\n") || [news.description];

  return (
    <article className="prose prose-lg dark:prose-invert max-w-none pb-20">
      <div className="relative w-full h-[300px] md:h-[450px] rounded-[2rem] overflow-hidden mb-12 border border-gray-200 dark:border-white/10 shadow-lg transition-colors">
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

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