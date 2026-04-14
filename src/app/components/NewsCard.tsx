import SentimentBadge from "./SentimentBadge";
import ImpactTag from "./ImpactTag";

export default function NewsCard({ data }: any) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden 
                    transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">

      {/* IMAGE */}
      <div className="overflow-hidden">
        <img
          src={data.image}
          className="w-full h-40 object-cover
                    transition-all duration-300 ease-in-out
                    hover:scale-105"
        />
      </div>

      <div className="p-4">
        <div className="flex justify-between text-xs text-gray-500">
          <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">
            {data.category}
          </span>
          <span>{data.time}</span>
        </div>

        <h2 className="font-semibold mt-2 hover:text-blue-500 transition-colors">
          {data.title}
        </h2>

        <p className="text-sm text-gray-600 mt-2">
          {data.description}
        </p>

        <p className="text-xs text-gray-400 mt-2">
          Sumber: {data.source}
        </p>

        <div className="mt-3">
          <span
            className={`px-2 py-1 text-xs rounded ${
              data.sentiment === "Positif"
                ? "bg-green-100 text-green-600"
                : data.sentiment === "Negatif"
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {data.sentiment}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {data.impact.map((imp: string, i: number) => (
            <span
              key={i}
              className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded 
                         hover:bg-green-200 transition"
            >
              {imp}
            </span>
          ))}
        </div>

        <button className="text-blue-500 text-sm mt-3 
                           transition-all duration-300 ease-in-out
                           hover:underline hover:text-blue-700 transition">
          Baca Selengkapnya →
        </button>
      </div>
    </div>
  );
}