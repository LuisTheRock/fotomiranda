import type { Metadata } from "next";
import { fontClasses } from "@/lib/fonts";
import "../globals.css";

// The Supabase auth client reads Date.now(); dev validation flags that as a blocking route. The admin
// is behind a login and never prefetched, so it can block on the server.
export const instant = false;

export const metadata: Metadata = { title: "Administração | FotoMiranda", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${fontClasses} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
