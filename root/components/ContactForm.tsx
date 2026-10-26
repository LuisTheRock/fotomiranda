"use client";

import { useState } from "react";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export default function ContactForm({ t }: { t: Dictionary["contact"] }) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "fail">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      setStatus(res.ok ? "ok" : "fail");
      if (res.ok) form.reset();
    } catch {
      setStatus("fail");
    }
  }

  const field = "w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-ink";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm">
        {t.name}
        <input name="name" required maxLength={50} autoComplete="name" className={`${field} mt-1`} />
      </label>
      <label className="block text-sm">
        {t.contact}
        <input name="contact" required maxLength={80} autoComplete="tel" className={`${field} mt-1`} />
      </label>
      <label className="block text-sm">
        {t.message}
        <textarea name="message" required maxLength={1000} rows={5} className={`${field} mt-1`} />
      </label>
      {/* honeypot: real visitors never see or fill this */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <button type="submit" disabled={status === "sending"} className="btn disabled:opacity-60">
        {status === "sending" ? t.sending : t.send}
      </button>
      <p role="status" className="text-sm text-muted">
        {status === "ok" && t.ok}
        {status === "fail" && t.fail}
      </p>
    </form>
  );
}
