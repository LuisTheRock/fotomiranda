import { NextResponse, type NextRequest } from "next/server";
import { refreshSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (/^\/admin(\/|$)/.test(pathname)) return refreshSession(request);
  if (/^\/(pt|en)(\/|$)/.test(pathname)) return;
  // Portuguese is the default; English only when the browser asks for it first.
  const lang = request.headers.get("accept-language")?.toLowerCase().startsWith("en") ? "en" : "pt";
  request.nextUrl.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
