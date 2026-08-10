// Perbandingan framing antar portal.
//
// Satu klaster = satu peristiwa yang diliput banyak portal. Dengan
// membandingkan JUDUL yang dipilih tiap portal untuk peristiwa yang sama, kita
// bisa menunjukkan perbedaan penekanan tanpa memanggil AI sama sekali. Lapisan
// AI (opsional) hanya merangkum temuan ini menjadi kalimat.

// Kata yang terlalu umum untuk dianggap "penekanan khas". Termasuk kata fungsi
// bahasa Indonesia dan kata redaksional yang muncul di hampir semua judul.
const STOPWORDS = new Set([
  "yang", "untuk", "dengan", "dari", "pada", "dalam", "akan", "telah", "sudah",
  "tidak", "bukan", "adalah", "atau", "dan", "juga", "agar", "karena", "oleh",
  "para", "saat", "ini", "itu", "bagi", "kepada", "hingga", "serta", "lebih",
  "masih", "bisa", "dapat", "harus", "usai", "soal", "jadi", "ada", "buat",
  "tapi", "namun", "hanya", "sampai", "antara", "setelah", "sebelum", "atas",
  "bawah", "kata", "ungkap", "sebut", "tegas", "jelas", "beber", "ujar",
  "diduga", "terkait", "berikut", "simak", "video", "foto", "live", "update",
  "resmi", "kabar", "berita", "hari", "tahun", "bulan", "pekan", "waktu",
  "orang", "warga", "pihak", "kasus", "hal", "cara", "apa", "siapa", "kenapa",
  "mengapa", "bagaimana", "mana", "kini", "baru", "lagi", "pun", "per", "ke",
  "di", "se", "nya", "yg", "dgn", "the", "of", "in", "on", "and", "for",
]);

function tokenize(teks: string): string[] {
  return (teks || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
}

export type SudutPortal = {
  portal: string;
  judul: string[]; // judul berita portal ini untuk peristiwa yang sama
  penekanan: string[]; // kata yang HANYA muncul di portal ini
  jumlah: number;
};

export type AnalisisFraming = {
  bisaDibandingkan: boolean; // butuh >= 2 portal
  jumlahPortal: number;
  portal: SudutPortal[];
  kataBersama: string[]; // kata yang muncul di SEMUA portal — inti peristiwa
  alasan?: string; // kenapa tidak bisa dibandingkan
};

/**
 * Bandingkan sudut pemberitaan antar portal untuk satu klaster.
 * `sources` berasal dari transformCluster (sudah dedup per URL).
 */
export function analisisFraming(
  sources: { portal: string; title: string }[],
): AnalisisFraming {
  // Kelompokkan judul per portal.
  const perPortal = new Map<string, string[]>();
  for (const s of sources || []) {
    const portal = (s.portal || "").trim();
    const judul = (s.title || "").trim();
    if (!portal || !judul) continue;
    const arr = perPortal.get(portal) || [];
    arr.push(judul);
    perPortal.set(portal, arr);
  }

  if (perPortal.size < 2) {
    return {
      bisaDibandingkan: false,
      jumlahPortal: perPortal.size,
      portal: [],
      kataBersama: [],
      alasan:
        perPortal.size === 0
          ? "Belum ada judul sumber yang tersimpan untuk peristiwa ini."
          : "Peristiwa ini baru diliput satu portal, jadi belum ada sudut pandang untuk dibandingkan.",
    };
  }

  // Himpunan kata per portal.
  const kataPerPortal = new Map<string, Set<string>>();
  for (const [portal, daftarJudul] of perPortal) {
    kataPerPortal.set(portal, new Set(daftarJudul.flatMap(tokenize)));
  }

  // Kata yang muncul di SEMUA portal = inti peristiwa yang disepakati bersama.
  const semuaSet = [...kataPerPortal.values()];
  const kataBersama = [...semuaSet[0]].filter((w) =>
    semuaSet.every((s) => s.has(w)),
  );

  // Penekanan khas = kata yang muncul di portal ini dan TIDAK di portal lain
  // mana pun. Inilah sinyal perbedaan framing yang paling mudah dipertanggung-
  // jawabkan: tidak menebak maksud redaksi, hanya menunjukkan pilihan katanya.
  const portal: SudutPortal[] = [...perPortal.entries()].map(([nama, judul]) => {
    const milikSendiri = kataPerPortal.get(nama)!;
    const lain = new Set(
      [...kataPerPortal.entries()]
        .filter(([n]) => n !== nama)
        .flatMap(([, s]) => [...s]),
    );
    const penekanan = [...milikSendiri].filter((w) => !lain.has(w));
    return { portal: nama, judul, penekanan: penekanan.slice(0, 6), jumlah: judul.length };
  });

  // Portal dengan penekanan khas terbanyak ditampilkan lebih dulu.
  portal.sort((a, b) => b.penekanan.length - a.penekanan.length || a.portal.localeCompare(b.portal));

  return {
    bisaDibandingkan: true,
    jumlahPortal: perPortal.size,
    portal,
    kataBersama: kataBersama.slice(0, 8),
  };
}

// Prompt untuk sintesis AI. Sengaja meminta AI HANYA membandingkan judul yang
// diberikan — bukan menambah pengetahuan luar — supaya hasilnya bisa diverifikasi
// pembaca terhadap daftar judul yang tampil di layar.
export function promptFraming(judulKlaster: string, analisis: AnalisisFraming): string {
  const daftar = analisis.portal
    .map((p) => `- ${p.portal}: ${p.judul.map((j) => `"${j}"`).join(" | ")}`)
    .join("\n");

  return `Peristiwa: "${judulKlaster}"

Judul yang dipakai tiap portal untuk peristiwa yang SAMA:
${daftar}

Bandingkan sudut pemberitaannya. Dasarkan HANYA pada judul di atas — jangan menambahkan informasi dari luar dan jangan menebak motif redaksi. Bila perbedaannya memang tipis, katakan begitu; jangan mengarang perbedaan.`;
}
