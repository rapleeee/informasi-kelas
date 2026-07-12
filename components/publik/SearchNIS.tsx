"use client";

import { useState } from "react";
import { Search, Loader2, X, School, Calendar, Quote, GraduationCap, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";

const LottiePlayer = dynamic(() => import("@/components/shared/LottiePlayer"), { ssr: false });

interface SiswaData {
  nis: string;
  namaLengkap: string;
  kelas: string;
  jurusan: string;
  jadwalDatang: string;
}

interface QuoteData {
  content: string;
  author: string;
}

interface SearchResult {
  siswa: SiswaData;
  quote: QuoteData;
}

import { createPortal } from "react-dom";

function HasilModal({
  result,
  onClose,
}: {
  result: SearchResult;
  onClose: () => void;
}) {
  const { siswa } = result;

  // Format schedule text to remove time if present
  const jadwalTanpaJam = siswa.jadwalDatang.replace(/ pukul \d{2}\.\d{2} WIB/i, "").trim();

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative flex items-center justify-center w-full max-w-sm animate-slide-in my-auto" style={{ zIndex: 1 }}>

        {/* Lottie — Absolute positioned top-right overlapping */}
        <div className="absolute -top-20 -right-6 z-20 pointer-events-none drop-shadow-xl">
          <LottiePlayer
            src="https://lottie.host/aa051d62-7fc1-452a-8da3-63676422b5e2/tOgx5tnYTK.lottie"
            loop
            autoplay
            width={140}
            height={140}
          />
        </div>

        {/* ── CARD ── */}
        <div className="w-full border-[4px] border-border shadow-[8px_8px_0px_#000] bg-white overflow-hidden relative z-10">

          {/* Mac Window Chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-muted border-b-[3px] border-border">
            <button
              onClick={onClose}
              className="w-3.5 h-3.5 rounded-full bg-destructive border border-red-700 hover:brightness-90 transition-all"
              title="Tutup"
            />
            <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 border border-yellow-600" />
            <div className="w-3.5 h-3.5 rounded-full bg-success border border-green-700" />
            <div className="flex-1 mx-4">
              <div className="bg-white border-[2px] border-border px-3 py-0.5 text-xs font-bold text-muted-foreground text-center tracking-wider uppercase shadow-[1px_1px_0px_#000]">
                smk-pesat.sch.id
              </div>
            </div>
          </div>

          {/* Header — School name + greeting */}
          <div className="bg-primary px-6 pt-5 pb-6 text-primary-foreground border-b-[3px] border-border relative">
            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-1">
              SMK Informatika Pesat
            </p>
            <p className="text-xl font-black uppercase leading-none mb-3">
              Halo! 👋
            </p>
            <h2 className="text-3xl font-black uppercase leading-tight tracking-tight">
              {siswa.namaLengkap}
            </h2>
            <div className="mt-3 inline-block bg-white/20 border-[2px] border-white/40 px-3 py-1">
              <p className="text-xs font-black tracking-[0.15em] uppercase">
                NIS: {siswa.nis}
              </p>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 divide-x-[3px] divide-border border-b-[3px] border-border">
            {/* Kelas */}
            <div className="px-5 py-5 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <School className="w-5 h-5 text-primary" />
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Kelas
                </p>
              </div>
              <p className="font-black text-3xl text-primary leading-none">
                {siswa.kelas}
              </p>
            </div>

            {/* Jadwal */}
            <div className="px-5 py-5 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <School className="w-5 h-5 text-primary" />
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Masuk
                </p>
              </div>
              <p className="font-black text-sm text-foreground leading-snug">
                {jadwalTanpaJam}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 bg-white flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border-[3px] border-border bg-white font-black uppercase text-xs tracking-wider hover:bg-muted transition-colors shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              CEK LAGI
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-primary border-[3px] border-border text-white font-black uppercase text-xs tracking-wider hover:bg-primary/90 transition-colors shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            >
              SEMANGAT! 🎉
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function SearchNIS() {
  const [nis, setNis] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
        quoteRes.ok
          ? quoteRes.json()
          : Promise.resolve({ content: "Semangat!", author: "SMK Informatika Pesat" }),
      ]);

      setResult({ siswa, quote });
      setModalOpen(true);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setModalOpen(false);
    setNis("");
    setResult(null);
    setError(null);
  }

  return (
    <>
      {/* ─── Form ────────────────────────────────────────── */}
      <div className="w-full max-w-md mx-auto">
        <form onSubmit={handleSearch}>
          <div className="flex shadow-[6px_6px_0px_#000] border-[3px] border-border">
            <input
              id="nis-input"
              type="text"
              value={nis}
              onChange={(e) => setNis(e.target.value)}
              placeholder="Masukkan NIS kamu..."
              className="flex-1 bg-white px-5 py-4 text-base font-bold placeholder:text-muted-foreground focus:outline-none border-r-[3px] border-border"
              disabled={loading}
              autoComplete="off"
            />
            <button
              id="btn-cari-nis"
              type="submit"
              disabled={loading || !nis.trim()}
              className="bg-secondary text-foreground font-black uppercase tracking-wider px-6 py-4 flex items-center gap-2 hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              {loading ? "CARI..." : "CEK"}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-6 animate-slide-in bg-destructive border-[3px] border-border text-white p-5 shadow-[6px_6px_0px_#000]">
            <div className="flex items-start gap-3">
              <div className="text-3xl leading-none">😕</div>
              <div>
                <h3 className="font-black uppercase tracking-wider mb-1">Tidak Ditemukan</h3>
                <p className="font-bold text-sm">{error}</p>
                <p className="text-xs mt-2 bg-white text-destructive inline-block px-2 py-1 font-bold border-2 border-border/50">
                  Cek kembali NIS yang kamu masukkan
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Result Modal ─────────────────────────────────── */}
      {modalOpen && result && (
        <HasilModal result={result} onClose={handleClose} />
      )}
    </>
  );
}
