import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContactForm from "@/components/ContactForm";
import Gallery from "@/components/Gallery";
import Reveal from "@/components/Reveal";
import VideoEmbed from "@/components/VideoEmbed";
import { getPhotos } from "@/lib/photos";
import { ADDRESS, EMAIL, FACEBOOK, GEO, INSTAGRAM, MAP, PHONES, SITE_URL } from "@/lib/site";
import { getDictionary, hasLocale } from "./dictionaries";

const VIDEOS = [
  // youtubeId: paste the unlisted video's ID here to switch from the local MP4 to YouTube
  { file: "amandine-bryan", names: "Amandine & Bryan", youtubeId: undefined as string | undefined },
  { file: "daniela-emanuel", names: "Daniela & Emanuel", youtubeId: undefined as string | undefined },
];

const section = "mx-auto w-full max-w-6xl px-6 py-24 md:py-32";
const eyebrow = "font-mono text-xs uppercase tracking-widest text-muted";

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const other = lang === "pt" ? "en" : "pt";

  const team = [
    { name: "Ricardo Miranda", role: t.team.lead, src: "/team/ricardo.jpg" },
    { name: "Eulália Miranda", role: t.team.leadF, src: "/team/eulalia.jpg" },
    { name: "Joaquim Miranda", role: t.team.video, src: "/team/joaquim.jpg" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Photographer",
            name: "FotoMiranda",
            url: `${SITE_URL}/${lang}`,
            image: `${SITE_URL}/hero/1.jpg`,
            email: EMAIL,
            telephone: PHONES.map((p) => `+351${p.replace(/ /g, "")}`),
            sameAs: [INSTAGRAM, FACEBOOK],
            address: { "@type": "PostalAddress", streetAddress: "R. Dr. Amorim, Nº 513, Mozelos", addressLocality: "Santa Maria da Feira", addressCountry: "PT" },
            geo: { "@type": "GeoCoordinates", latitude: GEO.lat, longitude: GEO.lng },
          }).replace(/</g, "\\u003c"),
        }}
      />
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href={`/${lang}`} aria-label="FotoMiranda">
            <Image src="/logo.png" alt="FotoMiranda" width={120} height={43} className="mix-blend-multiply" priority />
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <a href="#galeria" className="hidden text-muted hover:text-ink md:block">{t.nav.gallery}</a>
            <a href="#servicos" className="hidden text-muted hover:text-ink md:block">{t.nav.services}</a>
            <a href="#equipa" className="hidden text-muted hover:text-ink md:block">{t.nav.team}</a>
            <Link href={`/${other}`} hrefLang={other} scroll={false} className="font-mono text-xs uppercase text-muted hover:text-ink">
              {other}
            </Link>
            <a href="#contacto" className="btn !py-2">{t.nav.cta}</a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-20 md:pt-28">
          <Reveal>
            <p className={eyebrow}>{t.hero.eyebrow}</p>
            <h1 className="serif mt-5 max-w-4xl text-5xl md:text-7xl">{t.hero.title}</h1>
            <p className="mt-6 max-w-xl text-lg text-muted">{t.hero.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#contacto" className="btn">{t.hero.cta}</a>
              <a href="#galeria" className="rounded-md border border-line px-5 py-3 text-sm hover:bg-bone">{t.hero.secondary}</a>
            </div>
          </Reveal>
          <Reveal index={2} className="mt-16 grid grid-cols-6 gap-3">
            <div className="card col-span-6 overflow-hidden md:col-span-4">
              <Image src="/hero/1.jpg" alt={t.hero.alt} width={1772} height={1181} sizes="(min-width:768px) 66vw, 100vw" className="h-full w-full object-cover" priority />
            </div>
            <div className="col-span-6 grid grid-cols-2 gap-3 md:col-span-2 md:grid-cols-1">
              <div className="card overflow-hidden">
                <Image src="/hero/3.jpg" alt="" width={900} height={600} sizes="(min-width:768px) 33vw, 50vw" className="h-full w-full object-cover" />
              </div>
              <div className="card overflow-hidden">
                <Image src="/hero/4.jpg" alt="" width={900} height={600} sizes="(min-width:768px) 33vw, 50vw" className="h-full w-full object-cover" />
              </div>
            </div>
          </Reveal>
        </section>

        {/* Services */}
        <section id="servicos" className={section}>
          <Reveal>
            <h2 className="serif max-w-2xl text-4xl md:text-5xl">{t.services.title}</h2>
          </Reveal>
          <div className="mt-12 grid gap-3 md:grid-cols-6">
            {t.services.items.map((s, i) => (
              <Reveal key={s.title} index={i} className="card p-8 md:col-span-3">
                <span className="tag">{s.tag}</span>
                <h3 className="serif mt-5 text-2xl">{s.title}</h3>
                <p className="mt-3 text-muted">{s.body}</p>
              </Reveal>
            ))}
            <Reveal index={4} className="card bg-bone p-8 md:col-span-6">
              <p className={eyebrow}>{t.services.deliveryTitle}</p>
              <p className="serif mt-3 max-w-2xl text-2xl">{t.services.delivery}</p>
            </Reveal>
          </div>
        </section>

        {/* Gallery */}
        <section id="galeria" className="border-y border-line bg-surface">
          <div className={section}>
            <Reveal>
              <h2 className="serif max-w-3xl text-4xl md:text-5xl">{t.gallery.title}</h2>
              <p className="mb-10 mt-4 max-w-xl text-muted">{t.gallery.body}</p>
            </Reveal>
            <Gallery photos={await getPhotos(lang)} t={t.gallery} />
          </div>
        </section>

        {/* About */}
        <section className={section}>
          <div className="grid gap-12 md:grid-cols-5">
            <Reveal className="md:col-span-2">
              <h2 className="serif text-4xl md:text-5xl">{t.about.title}</h2>
            </Reveal>
            <Reveal index={1} className="space-y-5 text-lg text-[#2f3437] md:col-span-3">
              {t.about.paragraphs.map((p) => <p key={p}>{p}</p>)}
            </Reveal>
          </div>
        </section>

        {/* Team */}
        <section id="equipa" className="border-y border-line bg-surface">
          <div className={section}>
            <Reveal>
              <h2 className="serif text-4xl md:text-5xl">{t.team.title}</h2>
              <p className="mt-4 max-w-xl text-muted">{t.team.body}</p>
            </Reveal>
            <div className="mt-12 grid gap-3 sm:grid-cols-3">
              {team.map((m, i) => (
                <Reveal key={m.name} index={i} className="card overflow-hidden">
                  <Image src={m.src} alt={m.name} width={600} height={600} sizes="(min-width:640px) 33vw, 100vw" className="aspect-square w-full object-cover" />
                  <div className="p-6">
                    <h3 className="serif text-xl">{m.name}</h3>
                    <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted">{m.role}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Videos */}
        <section className={section}>
          <Reveal>
            <h2 className="serif max-w-3xl text-4xl md:text-5xl">{t.videos.title}</h2>
          </Reveal>
          <div className="mt-12 grid gap-3 md:grid-cols-2">
            {VIDEOS.map((v, i) => (
              <Reveal key={v.file} index={i} className="card overflow-hidden">
                <VideoEmbed file={v.file} youtubeId={v.youtubeId} label={`${t.videos.play} ${v.names}`} />
                <p className="p-5 font-mono text-xs uppercase tracking-wider text-muted">{v.names}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Testimonial */}
        <section className="border-y border-line bg-bone">
          <Reveal className="mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
            <p className={eyebrow}>{t.testimonial.title}</p>
            <blockquote className="serif mt-6 text-3xl md:text-4xl">“{t.testimonial.quote}”</blockquote>
          </Reveal>
        </section>

        {/* Contact */}
        <section id="contacto" className={section}>
          <div className="grid gap-16 md:grid-cols-2">
            <Reveal>
              <h2 className="serif text-4xl md:text-5xl">{t.contact.title}</h2>
              <p className="mt-4 max-w-md text-muted">{t.contact.body}</p>
              <dl className="mt-10 space-y-6 text-sm">
                <div>
                  <dt className={eyebrow}>Email</dt>
                  <dd className="mt-1"><a href={`mailto:${EMAIL}`} className="underline underline-offset-4">{EMAIL}</a></dd>
                </div>
                <div>
                  <dt className={eyebrow}>{t.contact.phones}</dt>
                  <dd className="mt-1 space-x-4">
                    {PHONES.map((p) => <a key={p} href={`tel:${p.replace(/ /g, "")}`} className="underline underline-offset-4">{p}</a>)}
                  </dd>
                </div>
                <div>
                  <dt className={eyebrow}>{t.contact.address}</dt>
                  <dd className="mt-1">{ADDRESS} · <a href={MAP} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{t.contact.map}</a></dd>
                </div>
                <div>
                  <dt className={eyebrow}>{t.contact.social}</dt>
                  <dd className="mt-1 space-x-4">
                    <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Instagram</a>
                    <a href={FACEBOOK} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Facebook</a>
                  </dd>
                </div>
              </dl>
            </Reveal>
            <Reveal index={1} className="card p-8 md:p-10">
              <ContactForm t={t.contact} />
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-10 text-center font-mono text-xs text-muted">
        © FotoMiranda. {t.footer.rights}
      </footer>
    </>
  );
}
