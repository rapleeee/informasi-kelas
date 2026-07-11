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
      className="flex flex-col items-center journey-unit"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="journey-number tabular-nums leading-none">
        {formatted}
      </span>
      <span className="journey-label">{label}</span>
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
    <div className="flex items-start justify-center gap-6 sm:gap-10 md:gap-16">
      {units.map(({ value, label, delay }) => (
        <CountdownUnit key={label} value={value} label={label} delay={delay} />
      ))}
    </div>
  );
}
