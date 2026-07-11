import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pengumuman Kelas | SMK Informatika Pesat",
  description:
    "Pengumuman resmi pembagian kelas Tahun Pelajaran 2026/2027 SMK Informatika Pesat. Masukkan NIS kamu untuk mengetahui informasi kelas.",
  keywords: ["SMK Informatika Pesat", "pengumuman kelas", "PPDB 2026"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
