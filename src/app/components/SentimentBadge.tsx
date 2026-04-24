export default function SentimentBadge({ sentiment }: any) {
  const color =
    sentiment === "Positif"
      ? "bg-green-100 text-green-600"
      : sentiment === "Negatif"
      ? "bg-red-100 text-red-600"
      : "bg-gray-100 text-gray-600";

  return (
    <span className={`px-2 py-1 text-xs rounded ${color}`}>
      {sentiment}
    </span>
  );
}