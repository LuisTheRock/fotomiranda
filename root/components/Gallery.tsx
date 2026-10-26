"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Category = "casamento" | "casal" | "bebes";
export type Photo = { src: string; category: Category; alt: string; blur: string };

const PAGE = 12;

export default function Gallery({ photos, t }: { photos: Photo[]; t: Dictionary["gallery"] }) {
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [visible, setVisible] = useState(PAGE);
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef(0);

  const shown = photos.filter((p) => filter === "all" || p.category === filter);
  const filters: ["all" | Category, string][] = [
    ["all", t.all],
    ["casamento", t.casamento],
    ["casal", t.casal],
    ["bebes", t.bebes],
  ];

  const show = (i: number) => {
    setOpen(i);
    dialog.current?.showModal();
  };
  const step = (d: number) => setOpen((i) => (i === null ? i : (i + d + shown.length) % shown.length));
  const current = open === null ? null : shown[open];

  return (
    <>
      <div className="flex flex-wrap gap-2" role="tablist">
        {filters.map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={filter === key}
            onClick={() => {
              setFilter(key);
              setVisible(PAGE);
            }}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              filter === key ? "border-ink bg-ink text-white" : "border-line bg-surface text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="mt-8 columns-1 gap-3 sm:columns-2 lg:columns-3">
        {shown.slice(0, visible).map((p, i) => (
          <li key={p.src} className="mb-3 break-inside-avoid">
            <button
              onClick={() => show(i)}
              className="card block w-full overflow-hidden"
              style={{ borderRadius: 8 }}
            >
              <Image
                src={p.src}
                alt={p.alt}
                width={800}
                height={533}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="h-auto w-full"
                placeholder="blur"
                blurDataURL={p.blur}
              />
            </button>
          </li>
        ))}
      </ul>

      {visible < shown.length && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <span className="font-mono text-xs text-muted">
            {String(visible).padStart(2, "0")} / {String(shown.length).padStart(2, "0")}
          </span>
          <button onClick={() => setVisible((v) => v + PAGE)} className="rounded-md border border-line bg-surface px-5 py-3 text-sm transition-colors hover:bg-bone active:scale-[0.98]">
            {t.more}
          </button>
        </div>
      )}

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        className="lightbox"
      >
        {current && (
          <div
            className="flex h-full flex-col"
            onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            }}
          >
            <div className="flex items-center justify-between px-6 py-5 font-mono text-xs text-muted">
              <span>
                {String((open ?? 0) + 1).padStart(2, "0")} / {String(shown.length).padStart(2, "0")}
              </span>
              <button onClick={() => dialog.current?.close()} aria-label={t.close} className="lb-btn">
                <svg viewBox="0 0 256 256" width="16" height="16" fill="currentColor" aria-hidden>
                  <path d="M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128 50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z" />
                </svg>
              </button>
            </div>

            <div
              className="relative min-h-0 flex-1 px-6 sm:px-20"
              onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
            >
              <button onClick={() => step(-1)} aria-label={t.prev} className="lb-btn absolute left-4 top-1/2 -translate-y-1/2 sm:left-6">
                <Arrow />
              </button>
              <div className="lb-stage" onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}>
                <div className="lb-frame">
                  <Image key={current.src} src={current.src} alt={current.alt} fill sizes="100vw" quality={90} placeholder="blur" blurDataURL={current.blur} className="lb-photo" />
                </div>
              </div>
              <button onClick={() => step(1)} aria-label={t.next} className="lb-btn absolute right-4 top-1/2 -translate-y-1/2 sm:right-6">
                <Arrow flip />
              </button>
            </div>

            <div className="flex items-center justify-between px-6 py-5 text-xs text-muted">
              <span className="tag">{t[current.category]}</span>
              <span className="hidden items-center gap-2 sm:flex">
                <kbd className="kbd">←</kbd>
                <kbd className="kbd">→</kbd>
                <kbd className="kbd">Esc</kbd>
              </span>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

function Arrow({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 256 256" width="16" height="16" fill="currentColor" aria-hidden style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M224 128a8 8 0 0 1-8 8H59.31l58.35 58.34a8 8 0 0 1-11.32 11.32l-72-72a8 8 0 0 1 0-11.32l72-72a8 8 0 0 1 11.32 11.32L59.31 120H216a8 8 0 0 1 8 8Z" />
    </svg>
  );
}
