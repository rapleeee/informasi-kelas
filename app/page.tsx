"use client";

import { useEffect, useState, useMemo } from "react";
import CountdownTimer from "@/components/countdown/CountdownTimer";
import SearchNIS from "@/components/publik/SearchNIS";
import { GraduationCap } from "lucide-react";
import dynamic from "next/dynamic";

const LottiePlayer = dynamic(
  () => import("@/components/shared/LottiePlayer"),
  { ssr: false }
);


interface Pengaturan {
  tanggalPengumuman: string;
  jadwalDatang: string;
  judulPengumuman: string;
  deskripsiSingkat: string;
}

// ── Deterministic star positions (no hydration mismatch) ──────────────────
function lcg(seed: number) {
  return ((seed * 1664525 + 1013904223) >>> 0) / 4294967296;
}
const STARS = Array.from({ length: 120 }, (_, i) => {
  const r1 = lcg(i * 3 + 1);
  const r2 = lcg(i * 3 + 2);
  const r3 = lcg(i * 3 + 3);
  return {
    left: r1 * 100,
    top: r2 * 100,
    size: r3 * 1.8 + 0.4,
    opacity: 0.15 + r1 * 0.5,
    duration: 3 + r2 * 5,
    delay: r3 * 6,
  };
});

function StarsBg() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      {STARS.map((s, i) => (
        <div
          key={i}
          className="star-dot"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [pengaturan, setPengaturan] = useState<Pengaturan | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPengaturan() {
      try {
        const res = await fetch("/api/pengaturan");
        if (res.ok) {
          const data: Pengaturan = await res.json();
          setPengaturan(data);
          setIsLive(new Date() >= new Date(data.tanggalPengumuman));
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    fetchPengaturan();
  }, []);

  const targetDate = useMemo(
    () =>
      pengaturan
        ? new Date(pengaturan.tanggalPengumuman)
        : new Date("2026-07-13T00:00:00.000Z"),
    [pengaturan]
  );

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-dvh bg-pattern flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent animate-spin brutal-block rounded-none" />
      </div>
    );
  }

  // ── COUNTDOWN MODE ─────────────────────────────────────────────────────
  if (!isLive) {
    return (
      <div className="min-h-dvh bg-pattern relative overflow-hidden flex flex-col">
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 md:px-12 py-16 text-center">
          {/* School badge */}
          <div className="badge-brutal mb-4 animate-fade-in-up">
            SMK Informatika Pesat
          </div>

          {/* Title */}
          <h1 className="heading-brutal text-4xl md:text-6xl animate-fade-in-up delay-100 mb-8">
            JOURNEY BEGINS IN
          </h1>

          {/* Countdown */}
          <div className="animate-fade-in-up delay-200">
            <CountdownTimer
              targetDate={targetDate}
              onExpired={() => setIsLive(true)}
            />
          </div>

          {/* Subtitle card - Flat brutal block */}
          <div className="brutal-block p-6 mt-12 animate-fade-in-up delay-400 max-w-lg mx-auto">
            <p className="text-foreground text-sm md:text-base leading-relaxed">
              Siap untuk kelas barumu?
              <br />
              <span className="font-bold">
                Cek lagi ya website ini untuk informasi terbaru. Semangat menyambut kelas baru!
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 text-center pb-6">
          <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest">
            © 2026 SMK Informatika Pesat
          </p>
        </footer>

        {/* Lottie — pojok kanan bawah */}
        <div className="fixed bottom-6 right-6 z-20 pointer-events-none animate-fade-in delay-500">
          <LottiePlayer
            src="https://lottie.host/7ac2dcd0-53dc-4f5f-93d9-c7d7ccace550/q0N1pP9Luq.lottie"
            loop
            autoplay
            width={280}
            height={280}
          />
        </div>
      </div>
    );
  }

  // ── LIVE MODE ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-pattern relative overflow-x-hidden flex flex-col">

      {/* ── TOP BAR ── */}
      <header className="w-full border-b-[4px] border-border bg-white flex items-center justify-between px-6 md:px-12 py-4 shadow-[0_4px_0px_#000]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary border-[3px] border-border flex items-center justify-center shadow-[3px_3px_0px_#000]">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground leading-none">SMK</p>
            <p className="font-black uppercase leading-none text-sm">Informatika Pesat</p>
          </div>
        </div>
        <div className="badge-brutal text-xs">
          {pengaturan?.judulPengumuman ?? "Pengumuman Kelas"}
        </div>
      </header>

      {/* ── HERO ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 py-16 text-center relative z-10">

        {/* Sticker / tag */}
        <div className="inline-block bg-secondary border-[3px] border-border px-4 py-1.5 text-sm font-black uppercase tracking-widest shadow-[4px_4px_0px_#000] mb-6 animate-fade-in-up">
          📢 INFO KELAS BARU TA. 2026/2027
        </div>

        {/* Big headline */}
        <h1 className="heading-brutal text-4xl sm:text-5xl md:text-7xl leading-none mb-4 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          CEK<br />
          <span className="text-primary">KELASMU</span><br />
          SEKARANG
        </h1>

        <p className="text-foreground font-bold max-w-sm mx-auto text-sm md:text-base leading-relaxed mb-10 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          {pengaturan?.deskripsiSingkat ?? "Masukkan NIS kamu dan temukan informasi kelas barumu untuk tahun ajaran 2026/2027."}
        </p>

        {/* Search box - the hero element */}
        <div className="w-full max-w-lg animate-slide-in" style={{ animationDelay: "300ms" }}>
          <SearchNIS />
        </div>

        {/* Jadwal note */}
        {/* <div className="mt-10 border-[3px] border-border bg-white shadow-[4px_4px_0px_#000] px-6 py-3 animate-fade-in-up inline-flex items-center gap-3" style={{ animationDelay: "400ms" }}>
          <span className="text-lg">📅</span>
          <p className="text-sm font-bold uppercase tracking-wider">
            Hari Pertama Datang Sekolah:{" "}
            <span className="text-secondary font-black">
              Kamis, 17 Juli 2026
            </span>
          </p>
        </div> */}
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t-[3px] border-border bg-white px-6 py-4 text-center">
        <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest">
          © 2026 SMK Informatika Pesat · Semangat Tahun Ajaran Baru!
        </p>
      </footer>
    </div>
  );
}