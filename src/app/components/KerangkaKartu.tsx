// Kerangka (skeleton) satu kartu berita.
//
// Bentuknya sengaja meniru NewsCard baris demi baris — blok gambar 16:9, baris
// badge, judul dua baris, lalu ringkasan — supaya tata letak tidak melompat
// begitu data datang. Dulu bentuk ini disalin di tiga tempat (feed, trending,
// profil) dan sudah sempat ketinggalan zaman dua kali: saat tombol di kaki
// kartu dihapus, dan saat blok gambar ditambahkan.
export default function KerangkaKartu({ besar = false }: { besar?: boolean }) {
    return (
        <div className="bg-white dark:bg-[#0c0c20] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden animate-pulse shadow-lg shadow-gray-100/60 dark:shadow-none">
            <div className="aspect-[16/9] w-full bg-gray-200 dark:bg-white/10" />
            {/* Ukurannya mengikuti varian NewsCard yang sama — kalau kerangka
                sorotan tetap seukuran kartu kecil, tata letak melompat begitu
                data datang. */}
            <div className={`space-y-3 ${besar ? "p-6 sm:p-8" : "p-6"}`}>
                <div className="flex justify-between">
                    <div className="h-6 w-20 bg-gray-200 dark:bg-white/10 rounded-md" />
                    <div className="h-5 w-14 bg-gray-200 dark:bg-white/10 rounded-md" />
                </div>
                <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-2/5" />
                <div className={`bg-gray-200 dark:bg-white/10 rounded w-full mt-3 ${besar ? "h-8" : "h-5"}`} />
                <div className={`bg-gray-200 dark:bg-white/10 rounded w-4/5 ${besar ? "h-8" : "h-5"}`} />
                <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-full mt-3" />
                <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-3/4" />
                {besar && <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-2/3" />}
            </div>
        </div>
    );
}
