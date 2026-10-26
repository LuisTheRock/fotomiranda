import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import { getDictionary, hasLocale, locales } from "./dictionaries";
import "../globals.css";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const serif = Newsreader({ variable: "--font-newsreader", subsets: ["latin"] });

export const generateStaticParams = () => locales.map((lang) => ({ lang }));

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = getDictionary(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/${lang}`, languages: { pt: "/pt", en: "/en" } },
    openGraph: { title: meta.title, description: meta.description, images: ["/hero/1.jpg"], locale: lang },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html lang={lang} className={`${sans.variable} ${mono.variable} ${serif.variable} antialiased`}>
      <body>
        {/* Reveal hides content until JS runs it in; without JS, show it */}
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
