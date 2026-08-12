import Image from "next/image";

// Wordmark Briefly untuk permukaan yang MENGIKUTI TEMA (header beranda, navbar
// halaman detail, navbar profil).
//
// Dua berkas dirender sekaligus dan dipilih lewat varian `dark:` CSS, bukan
// state React — pola yang sama dengan ikon TombolTema. Dengan begitu wordmark
// sudah benar sejak paint pertama, tanpa menunggu JavaScript.
//
// PENTING: jangan pakai komponen ini di permukaan yang SELALU gelap (Landing,
// Footer, halaman auth). Di sana class `dark` bisa saja tidak ada — pengguna
// yang memilih tema terang lalu membuka Landing — dan wordmark navy akan
// tenggelam di latar navy. Permukaan seperti itu memakai berkas
// briefly-wordmark-dark@2x.png secara langsung.
//
// Kedua gambar memakai alt yang sama: yang tidak aktif disembunyikan dengan
// `display:none`, sehingga pembaca layar hanya menemui satu di antaranya.
export default function LogoBriefly({
    className = "h-9 w-auto",
    prioritas = false,
}: {
    className?: string;
    prioritas?: boolean;
}) {
    return (
        <>
            <Image
                src="/images/briefly-wordmark-light@2x.png"
                alt="Briefly"
                width={632}
                height={236}
                priority={prioritas}
                className={`${className} dark:hidden`}
            />
            <Image
                src="/images/briefly-wordmark-dark@2x.png"
                alt="Briefly"
                width={632}
                height={236}
                priority={prioritas}
                className={`hidden ${className} dark:block`}
            />
        </>
    );
}
