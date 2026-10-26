// Sends via Resend's free tier (100/day). Needs RESEND_API_KEY and CONTACT_TO in the environment.
// shortcut: sender is Resend's shared onboarding address, which only delivers to the account owner's email; verify a domain to change that.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { name, contact, message, website } = body ?? {};

  if (website) return Response.json({ ok: true }); // honeypot hit: pretend success
  if (![name, contact, message].every((v) => typeof v === "string" && v.trim())) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  if (name.length > 50 || contact.length > 80 || message.length > 1000) {
    return Response.json({ error: "too long" }, { status: 400 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "FotoMiranda site <onboarding@resend.dev>",
      to: process.env.CONTACT_TO,
      subject: `Novo contacto: ${name}`,
      text: `Nome: ${name}\nContacto: ${contact}\n\n${message}`,
    }),
  });

  return res.ok ? Response.json({ ok: true }) : Response.json({ error: "send failed" }, { status: 502 });
}
