import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const valid = { name: "Ana", contact: "912 345 678", message: "Casamento em junho", "cf-turnstile-response": "tok" };

const post = (body: unknown) =>
  POST(new Request("http://x/api/contact", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }));

// Cloudflare and Resend are both plain fetch calls, told apart by URL.
function mockFetch({ captcha = true, resendOk = true, hang = "" } = {}) {
  const fn = vi.fn<typeof fetch>(async (url) => {
    if (hang && String(url).includes(hang)) throw new DOMException("timed out", "TimeoutError");
    return String(url).includes("cloudflare")
      ? Response.json({ success: captcha, "error-codes": captcha ? [] : ["invalid-input-response"] })
      : new Response("{}", { status: resendOk ? 200 : 401 });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

beforeEach(() => {
  vi.stubEnv("TURNSTILE_SECRET_KEY", "secret");
  vi.stubEnv("RESEND_API_KEY", "re_key");
  vi.stubEnv("CONTACT_TO", "geral@fotomiranda.com");
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/contact", () => {
  it("rejects a body that is not JSON or has empty fields", async () => {
    const fetchMock = mockFetch();
    expect((await post("not json")).status).toBe(400);
    expect((await post({ ...valid, message: "   " })).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects fields over the length limits", async () => {
    mockFetch();
    expect((await post({ ...valid, name: "a".repeat(51) })).status).toBe(400);
    expect((await post({ ...valid, message: "a".repeat(1001) })).status).toBe(400);
  });

  it("drops honeypot hits quietly without calling any service", async () => {
    const fetchMock = mockFetch();
    const res = await post({ ...valid, website: "http://spam" });
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails closed when the captcha secret is not configured", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    const fetchMock = mockFetch();
    expect((await post(valid)).status).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 403 and sends no email when the captcha fails", async () => {
    const fetchMock = mockFetch({ captcha: false });
    expect((await post(valid)).status).toBe(403);
    expect(fetchMock).toHaveBeenCalledTimes(1); // only Cloudflare, never Resend
    expect(console.warn).toHaveBeenCalled();
  });

  it("sends the email to CONTACT_TO when everything is valid", async () => {
    const fetchMock = mockFetch();
    expect((await post(valid)).status).toBe(200);
    const sent = JSON.parse(fetchMock.mock.calls[1][1]!.body as string);
    expect(sent.to).toBe("geral@fotomiranda.com");
    expect(sent.text).toContain("Casamento em junho");
  });

  it("returns 502 and logs when Resend refuses the email", async () => {
    mockFetch({ resendOk: false });
    expect((await post(valid)).status).toBe(502);
    expect(console.error).toHaveBeenCalled();
  });

  it("answers 403 when Cloudflare times out", async () => {
    mockFetch({ hang: "cloudflare" });
    expect((await post(valid)).status).toBe(403);
  });

  it("answers 502 when Resend times out", async () => {
    mockFetch({ hang: "resend" });
    expect((await post(valid)).status).toBe(502);
    expect(console.error).toHaveBeenCalled();
  });
});
