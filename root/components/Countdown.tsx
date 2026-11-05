"use client";
import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Countdown({ to, t }: { to: string; t: { title: string; days: string; hours: string; minutes: string } }) {
  // null until mounted: the server and the first client render match
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setMs(new Date(to).getTime() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [to]);

  if (ms !== null && ms <= 0) return null; // event has passed
  const left = Math.max(ms ?? 0, 0);
  const parts = [
    [Math.floor(left / 864e5), t.days],
    [Math.floor(left / 36e5) % 24, t.hours],
    [Math.floor(left / 6e4) % 60, t.minutes],
  ] as const;

  return (
    <div className="w-full max-w-xl rounded-[var(--radius-card)] border border-white/40 bg-black/25 px-6 py-8 text-center text-white backdrop-blur-md md:px-10 md:py-10">
      <p className="text-lg">{t.title}</p>
      <div className="mt-6 grid grid-cols-3 gap-2" role="timer" aria-label={t.title}>
        {parts.map(([n, label]) => (
          <div key={label} className="border-l border-white/30 first:border-l-0">
            <div className="font-display text-5xl font-medium tabular-nums md:text-6xl">{ms === null ? "--" : pad(n)}</div>
            <div className="mt-1 text-sm text-white/80">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
