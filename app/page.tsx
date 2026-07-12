"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import CountdownTimer from "@/components/countdown/CountdownTimer";
import SearchNIS from "@/components/publik/SearchNIS";
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
    <div className="min-h-dvh bg-pattern relative overflow-x-hidden">
      <div className="relative z-10 flex flex-col items-center min-h-dvh px-6 md:px-12 py-12 md:py-20">

        {/* Header */}
        <header className="text-center mb-10 animate-slide-in">
          <div className="inline-flex items-center justify-center w-16 h-16 brutal-block bg-white mb-6">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>

          <div className="badge-brutal mb-4 block w-fit mx-auto">
            SMK Informatika Pesat
          </div>

          <h1 className="heading-brutal text-3xl md:text-5xl leading-tight">
            {pengaturan?.judulPengumuman ?? "Cek kelas kamu, yuk!"}
          </h1>

          <p className="mt-4 text-foreground font-medium max-w-md mx-auto text-sm md:text-base leading-relaxed">
            {pengaturan?.deskripsiSingkat ??
              "Masukin NIS kamu, kelas kamu langsung muncul."}
          </p>
        </header>

        {/* Folder kiri - Search NIS - Folder kanan */}
        <section className="w-full max-w-4xl">
          <div className="flex items-center justify-center gap-6 md:gap-16 animate-slide-in delay-100">
            <div
              style={{ height: "260px", position: "relative" }}
              className="hidden sm:block shrink-0 opacity-80"
            >
              <Folder size={1.5} color="var(--primary)" />
            </div>

            <div className="w-full max-w-sm">
              <SearchNIS />
            </div>

            <div
              style={{ height: "260px", position: "relative" }}
              className="hidden sm:block shrink-0 opacity-80"
            >
              <Folder size={1.5} color="var(--primary)" />
            </div>
          </div>
        </section>

        {/* Catatan jadwal datang ke sekolah */}
        <div className="brutal-block p-4 mt-12 text-center max-w-md animate-slide-in delay-200">
          <p className="text-sm font-medium">
            Datang ya di sekolah hari {" "}
            <span className="font-bold text-secondary uppercase bg-foreground text-white px-1">
              {pengaturan?.jadwalDatang ?? "Rabu, 15 Juli 2026"}
            </span>
            <br />
            Dan mulai perjalanan kamu!
          </p>
        </div>

        <footer className="mt-auto pt-16 text-center animate-fade-in">
          <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest">
            © 2026 SMK Informatika Pesat
          </p>
          <p className="text-muted-foreground font-bold text-sm tracking-widest">
            Designed by <a href="sekelikmedia.com">sekelikmedia</a>
          </p>
        </footer>
      </div>
    </div>
  );
}