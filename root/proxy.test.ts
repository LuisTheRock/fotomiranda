import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/proxy", () => ({ refreshSession: vi.fn(async () => new Response("refreshed")) }));
import { proxy } from "./proxy";

const go = (path: string, acceptLanguage?: string) =>
  proxy(new NextRequest(`http://x${path}`, { headers: acceptLanguage ? { "accept-language": acceptLanguage } : {} }));

describe("proxy", () => {
  it("sends / to Portuguese unless the browser asks for English first", async () => {
    expect((await go("/", "pt-PT,en;q=0.8"))?.headers.get("location")).toBe("http://x/pt");
    expect((await go("/", "en-US,en;q=0.9"))?.headers.get("location")).toBe("http://x/en");
    expect((await go("/", "fr"))?.headers.get("location")).toBe("http://x/pt");
    expect((await go("/"))?.headers.get("location")).toBe("http://x/pt");
  });

  it("keeps the path when it adds the language", async () => {
    expect((await go("/contacto", "en"))?.headers.get("location")).toBe("http://x/en/contacto");
  });

  it("leaves pages that already have a language alone", async () => {
    expect(await go("/pt")).toBeUndefined();
    expect(await go("/en/x", "pt")).toBeUndefined();
  });

  it("hands /admin to the session refresh, not the language rule", async () => {
    expect(await (await go("/admin/login"))?.text()).toBe("refreshed");
  });
});
