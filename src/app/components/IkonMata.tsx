// Ikon mata untuk penanda "jumlah dilihat". Dipakai di kartu berita dan di
// halaman detail, jadi disimpan sekali di sini agar bentuknya selalu sama.
export default function IkonMata({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 12S5.5 5.5 12 5.5 21.5 12 21.5 12 18.5 18.5 12 18.5 2.5 12 2.5 12z"
      />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}
