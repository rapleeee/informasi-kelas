"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

interface SiswaData {
  nis: string;
  namaLengkap: string;
  kelas: string;
  jurusan: string;
  jadwalDatang: string;
}

interface Quote {
  content: string;
  author: string;
}

interface SearchResult {
  siswa: SiswaData;
  quote: Quote;
}

function HasilPencarian({ result }: { result: SearchResult }) {
  const { siswa, quote } = result;
  return (
    <div className="mt-8 animate-slide-in">
      {/* Brutalist status badge */}
      <div className="text-center mb-6">
        <div className="badge-brutal bg-success text-white mb-4 shadow-[2px_2px_0px_#000]">
          Data Ditemukan
        </div>
        <p className="text-foreground font-bold">
          Selamat! Berikut informasi kelas kamu.
        </p>
      </div>

      {/* Card Hasil - Brutal Flat */}
      <div className="brutal-card max-w-lg mx-auto">
        {/* Header card */}
        <div className="bg-primary p-5 text-primary-foreground text-center border-b-[3px] border-border">
          <div className="text-3xl mb-2">🎓</div>
          <h2 className="text-xl font-black uppercase tracking-wider">{siswa.namaLengkap}</h2>
          <p className="font-bold text-sm mt-1">NIS: {siswa.nis}</p>
        </div>

        {/* Body card */}
        <div className="p-6 space-y-4 bg-white">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-muted border-2 border-border flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[2px_2px_0px_#000]">
              <span className="text-sm">🏫</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1">Kelas</p>
              <p className="font-black text-xl text-primary">{siswa.kelas}</p>
              <p className="text-sm font-semibold text-muted-foreground">{siswa.jurusan}</p>
            </div>
          </div>

          <div className="h-1 bg-border w-full my-4" />

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-secondary border-2 border-border flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[2px_2px_0px_#000]">
              <span className="text-sm">📅</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1">Jadwal Datang</p>
              <p className="font-black text-foreground">{siswa.jadwalDatang}</p>
            </div>
          </div>

          <div className="h-1 bg-border w-full my-4" />

          {/* Quotes */}
          <div className="bg-muted border-[3px] border-border p-4 shadow-[4px_4px_0px_#000]">
            <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-2 bg-foreground text-white inline-block px-2 py-0.5">
              💬 Kata Motivasi
            </p>
            <p className="font-bold text-foreground leading-relaxed text-sm mt-2">
              &ldquo;{quote.content}&rdquo;
            </p>
            <p className="text-muted-foreground text-xs mt-3 font-black uppercase">
              — {quote.author}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchNIS() {
  const [nis, setNis] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!nis.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const [siswaRes, quoteRes] = await Promise.all([
        fetch(`/api/siswa/cari?nis=${encodeURIComponent(nis.trim())}`),
        fetch("/api/quotes"),
      ]);

      if (!siswaRes.ok) {
        const err = await siswaRes.json();
        setError(err.error ?? "Siswa tidak ditemukan");
        return;
      }

      const [siswa, quote] = await Promise.all([
        siswaRes.json(),
        quoteRes.ok ? quoteRes.json() : Promise.resolve({ content: "Semangat!", author: "SMK Informatika Pesat" }),
      ]);

      setResult({ siswa, quote });
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto animate-slide-in delay-300">
      {/* Form Pencarian */}
      <form onSubmit={handleSearch} className="relative group">
        <div className="flex gap-2 w-full">
          <input
            id="nis-input"
            type="text"
            value={nis}
            onChange={(e) => setNis(e.target.value)}
            placeholder="Masukkan NIS..."
            className="flex-1 brutal-input px-4 py-3 text-sm focus:border-border"
            disabled={loading}
            autoComplete="off"
          />
          <button
            id="btn-cari-nis"
            type="submit"
            disabled={loading || !nis.trim()}
            className="brutal-btn px-6 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? "CARI" : "CEK"}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-6 animate-slide-in brutal-card bg-destructive text-white p-6 text-center shadow-[4px_4px_0px_#000]">
          <div className="text-4xl mb-3">😕</div>
          <h3 className="font-black uppercase mb-1">NIS Tidak Ditemukan</h3>
          <p className="font-bold text-sm">{error}</p>
          <p className="text-xs mt-3 bg-white text-destructive inline-block px-2 py-1 font-bold border-2 border-border">
            Pastikan NIS yang kamu masukkan sudah benar.
          </p>
        </div>
      )}

      {/* Hasil */}
      {result && <HasilPencarian result={result} />}
    </div>
  );
}
