import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fontClasses } from "@/lib/fonts";
import { SITE_URL } from "@/lib/site";
import { getDictionary, hasLocale, locales } from "./dictionaries";
import "../globals.css";

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
    <html lang={lang} className={`${fontClasses} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
