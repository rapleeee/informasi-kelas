"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import CountdownTimer from "@/components/countdown/CountdownTimer";
import SearchNIS from "@/components/publik/SearchNIS";
import { Sparkles, GraduationCap } from "lucide-react";

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
      <div className="min-h-dvh journey-bg flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#6594B1] border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── COUNTDOWN MODE ─────────────────────────────────────────────────────
  if (!isLive) {
    return (
      <div className="min-h-dvh journey-bg relative overflow-hidden flex flex-col">
        <StarsBg />

        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 py-16 text-center">
          {/* School badge */}
          <p className="journey-school animate-fade-in-up">
            SMK Informatika Pesat
          </p>

          {/* Title */}
          <h1 className="journey-title animate-fade-in-up delay-100">
            JOURNEY BEGINS IN
          </h1>

          {/* Countdown */}
          <div className="mt-10 md:mt-14 animate-fade-in-up delay-200">
            <CountdownTimer
              targetDate={targetDate}
              onExpired={() => setIsLive(true)}
            />
          </div>


          {/* Subtitle card */}
          <div className="journey-subtitle-card animate-fade-in-up delay-400 mt-4 md:mt-6">
            <p className="journey-subtitle-text">
              Perjalanan selanjutnya lebih menantang,
             <br />
              <span className="font-bold">Cek lagi ya website ini untuk informasi terbaru. Semoga sukses!</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 text-center pb-6">
          <p className="text-[#6594B1]/60 text-xs tracking-wider">
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
        </div>      </div>
    );
  }

  // ── LIVE MODE ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-gradient-page relative overflow-x-hidden">
      <div
        className="particles-bg"
        aria-hidden="true"
        style={{ position: "fixed" }}
      >
        {STARS.slice(0, 20).map((s, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${s.left}%`,
              width: `${s.size * 2 + 2}px`,
              height: `${s.size * 2 + 2}px`,
              animationDuration: `${s.duration + 8}s`,
              animationDelay: `${s.delay}s`,
              opacity: s.opacity * 0.6,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-dvh px-4 py-12 md:py-20">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-primary mb-6 shadow-lg glow-primary">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-2">
            SMK Informatika Pesat
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight">
            {pengaturan?.judulPengumuman ?? "Pengumuman Pembagian Kelas"}
          </h1>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto text-sm md:text-base leading-relaxed">
            {pengaturan?.deskripsiSingkat ??
              "Pengumuman resmi pembagian kelas Tahun Pelajaran 2026/2027."}
          </p>
        </header>

        <section className="w-full max-w-2xl">
          <div className="flex justify-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 glass px-5 py-2.5 rounded-full font-semibold text-sm border border-primary/30">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="gradient-text">Pengumuman Resmi Telah Dibuka!</span>
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
          </div>
          <div className="text-center mb-8 animate-fade-in-up delay-100">
            <p className="text-muted-foreground text-sm md:text-base">
              Masukkan{" "}
              <span className="text-foreground font-semibold">
                Nomor Induk Siswa (NIS)
              </span>{" "}
              kamu untuk melihat informasi kelas.
            </p>
          </div>
          <SearchNIS />
        </section>

        <footer className="mt-auto pt-16 text-center animate-fade-in">
          <p className="text-muted-foreground text-xs">
            © 2026 SMK Informatika Pesat. Semua hak dilindungi.
          </p>
        </footer>
      </div>
    </div>
  );
}
