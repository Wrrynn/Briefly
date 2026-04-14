export default function Navbar({ onRefresh }: any) {
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow">
      <div>
        <h1 className="text-xl font-bold">
          ⚡ News Aggregator AI
        </h1>
        <p className="text-sm text-gray-500">
          Analisis Sentimen & Prediksi Dampak
        </p>
      </div>

      <button
        onClick={onRefresh}
        className="
          bg-blue-500 text-white px-4 py-2 rounded-lg
          transition-all duration-300 ease-in-out
          hover:bg-blue-600 active:scale-95
"
      >
        Refresh
      </button>
    </div>
  );
}