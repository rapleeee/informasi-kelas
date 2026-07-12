"use client";

import { useEffect, useState, useCallback } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: Date;
  onExpired?: () => void;
}

function CountdownUnit({
  value,
  label,
  delay,
}: {
  value: number;
  label: string;
  delay: number;
}) {
  const formatted = String(value).padStart(2, "0");

  return (
    <div
      className="flex flex-col items-center animate-slide-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="brutal-block bg-white px-3 py-4 md:px-6 md:py-8 shadow-[4px_4px_0px_#000] mb-3 min-w-[70px] md:min-w-[120px] text-center">
        <span className="text-3xl md:text-6xl font-black tabular-nums leading-none text-primary">
          {formatted}
        </span>
      </div>
      <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-foreground bg-secondary px-2 py-0.5 border-2 border-border shadow-[2px_2px_0px_#000]">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer({
  targetDate,
  onExpired,
}: CountdownTimerProps) {
  const calcTimeLeft = useCallback((): TimeLeft => {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => {
      const t = calcTimeLeft();
      setTimeLeft(t);
      if (
        t.days === 0 &&
        t.hours === 0 &&
        t.minutes === 0 &&
        t.seconds === 0
      ) {
        clearInterval(interval);
        onExpired?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [calcTimeLeft, onExpired]);

  const units = [
    { value: timeLeft.days, label: "DAYS", delay: 0 },
    { value: timeLeft.hours, label: "HOURS", delay: 100 },
    { value: timeLeft.minutes, label: "MINUTES", delay: 200 },
    { value: timeLeft.seconds, label: "SECONDS", delay: 300 },
  ];

  return (
    <div className="flex flex-wrap items-start justify-center gap-4 sm:gap-8 md:gap-16 max-w-full">
      {units.map(({ value, label, delay }) => (
        <CountdownUnit key={label} value={value} label={label} delay={delay} />
      ))}
    </div>
  );
}
