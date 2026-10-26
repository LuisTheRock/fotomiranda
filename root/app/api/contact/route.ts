// Sends via Resend's free tier (100/day). Needs RESEND_API_KEY, CONTACT_TO and TURNSTILE_SECRET_KEY in the environment.
// shortcut: sender is Resend's shared onboarding address, which only delivers to the account owner's email; verify a domain to change that.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { name, contact, message, website } = body ?? {};
  const token = body?.["cf-turnstile-response"];

  if (website) return Response.json({ ok: true }); // honeypot hit: pretend success
  if (![name, contact, message].every((v) => typeof v === "string" && v.trim())) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  if (name.length > 50 || contact.length > 80 || message.length > 1000) {
    return Response.json({ error: "too long" }, { status: 400 });
  }

  // Turnstile token proves a real browser filled the form; the honeypot alone does not stop bots posting straight to this URL.
  if (!process.env.TURNSTILE_SECRET_KEY) {
    console.error("contact: TURNSTILE_SECRET_KEY is not set");
    return Response.json({ error: "server misconfigured" }, { status: 500 });
  }
  const check = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: typeof token === "string" ? token : "" }),
    signal: AbortSignal.timeout(5000), // a hung call becomes the .catch below instead of a stuck form
  }).then((r) => r.json()).catch(() => null);
  if (!check?.success) {
    // visible in the logs so a wrong or missing site key does not silently block every visitor
    console.warn("contact: captcha rejected", check?.["error-codes"] ?? "no response from Cloudflare");
    return Response.json({ error: "captcha failed" }, { status: 403 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(5000),
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "FotoMiranda site <onboarding@resend.dev>",
      to: process.env.CONTACT_TO,
      subject: `Novo contacto: ${name}`,
      text: `Nome: ${name}\nContacto: ${contact}\n\n${message}`,
    }),
  }).catch(() => null); // timeout or network error: handled like a refusal below

  if (!res?.ok) {
    console.error("contact: Resend failed", res?.status ?? "no response", await res?.text());
    return Response.json({ error: "send failed" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
