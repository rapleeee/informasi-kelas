"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import CountdownTimer from "@/components/countdown/CountdownTimer";
import SearchNIS from "@/components/publik/SearchNIS";
// TODO: sesuaikan path import Folder ini dengan lokasi file Folder kamu yang sebenarnya
import Folder from "@/components/Folder";
import { GraduationCap } from "lucide-react";

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
              Siap untuk kelas barumu?,
             <br />
              <span className="font-bold">Cek lagi ya website ini untuk informasi terbaru. Semangat menyambut kelas baru!</span>
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
    <div className="min-h-dvh bg-[#EEEEEE] relative overflow-x-hidden">
      <div className="relative z-10 flex flex-col items-center min-h-dvh px-4 py-12 md:py-20">
        {/* Header */}
        <header className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white border border-[#6594B1]/20 mb-5">
            <GraduationCap className="w-7 h-7 text-[#213C51]" />
          </div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#6594B1] font-semibold mb-2">
            SMK Informatika Pesat
          </p>
          <h1 className="text-2xl md:text-4xl font-bold text-[#213C51] leading-tight">
            {pengaturan?.judulPengumuman ?? "Cek kelas kamu, yuk!"}
          </h1>
          <p className="mt-3 text-[#213C51]/60 max-w-md mx-auto text-sm md:text-base leading-relaxed">
            {pengaturan?.deskripsiSingkat ??
              "Masukin NIS kamu, kelas kamu langsung muncul."}
          </p>
        </header>

        {/* Folder kiri - Search NIS - Folder kanan */}
        <section className="w-full max-w-4xl">
          <div className="flex items-center justify-center gap-6 md:gap-16 animate-fade-in-up delay-100">
            <div
              style={{ height: "260px", position: "relative" }}
              className="hidden sm:block shrink-0"
            >
              <Folder size={1.5} color="#6594B1" />
            </div>

            <div className="w-full max-w-sm">
              <SearchNIS />
            </div>

            <div
              style={{ height: "260px", position: "relative" }}
              className="hidden sm:block shrink-0"
            >
              <Folder size={1.5} color="#6594B1" />
            </div>
          </div>
        </section>

        {/* Catatan jadwal datang ke sekolah */}
        <p className="mt-10 text-xs text-[#213C51]/50 text-center max-w-md leading-relaxed animate-fade-in delay-200">
          Jangan lupa dateng ke sekolah{" "}
          <span className="font-semibold text-[#213C51]">
            {pengaturan?.jadwalDatang ?? "Rabu, 15 Juli 2026"}
          </span>{" "}
          ya, biar makin jelas info kelasnya!
        </p>

        <footer className="mt-auto pt-16 text-center animate-fade-in">
          <p className="text-[#213C51]/40 text-xs">
            © 2026 SMK Informatika Pesat
          </p>
        </footer>
      </div>
    </div>
  );
}