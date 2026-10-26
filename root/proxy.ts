import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (/^\/(pt|en)(\/|$)/.test(pathname)) return;
  // Portuguese is the default; English only when the browser asks for it first.
  const lang = request.headers.get("accept-language")?.toLowerCase().startsWith("en") ? "en" : "pt";
  request.nextUrl.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
