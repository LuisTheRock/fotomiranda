"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/app/[lang]/dictionaries";

declare global {
  interface Window {
    turnstile?: { reset: () => void };
    onTurnstileOk?: () => void;
    onTurnstileGone?: () => void;
  }
}

export default function ContactForm({ t }: { t: Dictionary["contact"] }) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "fail">(
    "idle",
  );
  // Send stays disabled until Turnstile has a token, so a fast submit cannot go out empty
  const gated = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const [verified, setVerified] = useState(!gated);
  const [missing, setMissing] = useState<string[]>([]);

  useEffect(() => {
    window.onTurnstileOk = () => setVerified(true);
    window.onTurnstileGone = () => setVerified(false);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    // our own messages instead of the browser's pop-up; the server still validates everything
    const empty = ["name", "contact", "message"].filter(
      (n) => !String(data.get(n) ?? "").trim(),
    );
    setMissing(empty);
    if (empty.length) {
      (form.elements.namedItem(empty[0]) as HTMLElement | null)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      setStatus(res.ok ? "ok" : "fail");
      if (res.ok) form.reset();
    } catch {
      setStatus("fail");
    }
    if (gated) setVerified(false); // a token works once; the callback re-enables Send with the new one
    window.turnstile?.reset();
  }

  const field =
    "w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-ink";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <label className="block text-sm">
        {t.name}
        <input
          name="name"
          maxLength={50}
          autoComplete="name"
          className={`${field} mt-1 ${missing.includes("name") ? "!border-[#9f2f2d]" : ""}`}
          aria-invalid={missing.includes("name")}
          aria-describedby={missing.includes("name") ? "err-name" : undefined}
          onChange={() => setMissing((m) => m.filter((n) => n !== "name"))}
        />
        {missing.includes("name") && (
          <span
            id="err-name"
            role="alert"
            className="mt-1 block text-xs text-[#9f2f2d]"
          >
            {t.required}
          </span>
        )}
      </label>
      <label className="block text-sm">
        {t.contact}
        <input
          name="contact"
          maxLength={80}
          autoComplete="tel"
          className={`${field} mt-1 ${missing.includes("contact") ? "!border-[#9f2f2d]" : ""}`}
          aria-invalid={missing.includes("contact")}
          aria-describedby={
            missing.includes("contact") ? "err-contact" : undefined
          }
          onChange={() => setMissing((m) => m.filter((n) => n !== "contact"))}
        />
        {missing.includes("contact") && (
          <span
            id="err-contact"
            role="alert"
            className="mt-1 block text-xs text-[#9f2f2d]"
          >
            {t.required}
          </span>
        )}
      </label>
      <label className="block text-sm">
        {t.message}
        <textarea
          name="message"
          maxLength={1000}
          rows={5}
          className={`${field} mt-1 ${missing.includes("message") ? "!border-[#9f2f2d]" : ""}`}
          aria-invalid={missing.includes("message")}
          aria-describedby={
            missing.includes("message") ? "err-message" : undefined
          }
          onChange={() => setMissing((m) => m.filter((n) => n !== "message"))}
        />
        {missing.includes("message") && (
          <span
            id="err-message"
            role="alert"
            className="mt-1 block text-xs text-[#9f2f2d]"
          >
            {t.required}
          </span>
        )}
      </label>
      {/* honeypot: real visitors never see or fill this */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />
      <div
        className="cf-turnstile"
        data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        data-appearance="interaction-only"
        data-callback="onTurnstileOk"
        data-expired-callback="onTurnstileGone"
      />
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <button
        type="submit"
        disabled={status === "sending" || !verified}
        className="btn disabled:opacity-60"
      >
        {status === "sending" ? t.sending : t.send}
      </button>
      <p role="status" className="text-sm text-muted">
        {status === "ok" && t.ok}
        {status === "fail" && t.fail}
      </p>
    </form>
  );
}
