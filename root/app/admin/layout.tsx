import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "../globals.css";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const serif = Newsreader({ variable: "--font-newsreader", subsets: ["latin"] });

// The Supabase auth client reads Date.now(); dev validation flags that as a blocking route. The admin
// is behind a login and never prefetched, so it can block on the server.
export const instant = false;

export const metadata: Metadata = { title: "Administração | FotoMiranda", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${sans.variable} ${mono.variable} ${serif.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
