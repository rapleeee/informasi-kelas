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
    <div className="mt-8 animate-scale-in">
      {/* Confetti-style header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-sm text-green-400 font-medium border border-green-500/30 mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
          </span>
          Data Ditemukan
        </div>
        <p className="text-muted-foreground text-sm">
          Selamat! Berikut informasi kelas kamu.
        </p>
      </div>

      {/* Card Hasil */}
      <div className="glass-strong rounded-2xl overflow-hidden max-w-lg mx-auto animate-pulse-glow">
        {/* Header card */}
        <div className="bg-gradient-primary p-5 text-white text-center">
          <div className="text-3xl mb-2">🎓</div>
          <h2 className="text-xl font-bold">{siswa.namaLengkap}</h2>
          <p className="text-white/70 text-sm mt-1">NIS: {siswa.nis}</p>
        </div>

        {/* Body card */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm">🏫</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Kelas</p>
              <p className="font-semibold text-foreground">{siswa.kelas}</p>
              <p className="text-sm text-muted-foreground">{siswa.jurusan}</p>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm">📅</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Jadwal Datang ke Sekolah</p>
              <p className="font-semibold text-foreground">{siswa.jadwalDatang}</p>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Quotes */}
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
            <p className="text-xs text-accent uppercase tracking-wider mb-2 font-medium">
              💬 Kata Motivasi
            </p>
            <p className="text-foreground italic leading-relaxed text-sm">
              &ldquo;{quote.content}&rdquo;
            </p>
            <p className="text-muted-foreground text-xs mt-2 font-medium">
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
    <div className="w-full max-w-lg mx-auto animate-fade-in-up delay-300">
      {/* Form Pencarian */}
      <form onSubmit={handleSearch} className="relative">
        <div className="glass rounded-2xl p-2 flex gap-2">
          <input
            id="nis-input"
            type="text"
            value={nis}
            onChange={(e) => setNis(e.target.value)}
            placeholder="Masukkan Nomor Induk Siswa (NIS)..."
            className="flex-1 bg-transparent px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none text-sm font-medium"
            disabled={loading}
            autoComplete="off"
          />
          <button
            id="btn-cari-nis"
            type="submit"
            disabled={loading || !nis.trim()}
            className="flex items-center gap-2 bg-gradient-primary text-white px-5 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? "Mencari..." : "Cek"}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-6 animate-scale-in glass rounded-2xl p-6 text-center border border-destructive/30">
          <div className="text-4xl mb-3">😕</div>
          <h3 className="font-semibold text-foreground mb-1">NIS Tidak Ditemukan</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Pastikan NIS yang kamu masukkan sudah benar.
          </p>
        </div>
      )}

      {/* Hasil */}
      {result && <HasilPencarian result={result} />}
    </div>
  );
}
