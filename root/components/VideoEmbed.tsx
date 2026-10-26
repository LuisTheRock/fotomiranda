"use client";

import { useState } from "react";

// Shows the local poster until the visitor presses play, so YouTube loads nothing before then.
// Without a youtubeId it falls back to the local MP4.
export default function VideoEmbed({
  file,
  youtubeId,
  label,
}: {
  file: string;
  youtubeId?: string;
  label: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (!youtubeId) {
    return (
      <video controls preload="none" poster={`/video/${file}.jpg`} aria-label={label} className="aspect-video w-full bg-ink object-cover">
        <source src={`/video/${file}.mp4`} type="video/mp4" />
      </video>
    );
  }

  return (
    <div className="relative aspect-video w-full bg-ink">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={label}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button onClick={() => setPlaying(true)} aria-label={label} className="group absolute inset-0 block w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/video/${file}.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
          <span className="absolute inset-0 bg-ink/0 transition-colors duration-200 group-hover:bg-ink/10" />
          <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-md border border-line bg-surface text-ink transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
            <svg viewBox="0 0 256 256" width="20" height="20" fill="currentColor" aria-hidden>
              <path d="M240 128a15.74 15.74 0 0 1-7.6 13.51L88.32 229.65a16 16 0 0 1-16.2.3A15.86 15.86 0 0 1 64 216.13V39.87a15.86 15.86 0 0 1 8.12-13.82 16 16 0 0 1 16.2.3l144.08 88.14A15.74 15.74 0 0 1 240 128Z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
