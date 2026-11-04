import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContactForm from "@/components/ContactForm";
import Gallery from "@/components/Gallery";
import VideoEmbed from "@/components/VideoEmbed";
import { getPhotos } from "@/lib/photos";
import { ADDRESS, EMAIL, FACEBOOK, GEO, INSTAGRAM, MAP, PHONES, SITE_URL } from "@/lib/site";
import { getDictionary, hasLocale } from "./dictionaries";

const VIDEOS = [
  // file: poster image in public/video/<file>.jpg; youtubeId: the unlisted YouTube video
  { file: "amandine-bryan", names: "Amandine & Bryan", youtubeId: "LfEeKR8dseU" },
  { file: "daniela-emanuel", names: "Daniela & Emanuel", youtubeId: "Rq2E_eQ2LN0" },
];

// one container, one section gap, one 12-column grid for the whole page
const wrap = "mx-auto w-full max-w-[var(--container)] px-[var(--gutter)]";
const band = `${wrap} py-[var(--section-gap-s)]`;
const grid = "grid grid-cols-12 gap-x-[var(--gap-columns)] gap-y-[var(--space-lg)]";
const link = "underline decoration-rule underline-offset-4 transition-colors hover:decoration-accent";

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const other = lang === "pt" ? "en" : "pt";
  const sections = [
    ["#galeria", t.nav.gallery],
    ["#servicos", t.nav.services],
    ["#equipa", t.nav.team],
  ];

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
      <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur">
        <div className={`${wrap} flex h-16 items-center justify-between`}>
          <a href="#" aria-label="FotoMiranda">
            <Image src="/logo.png" alt="FotoMiranda" width={120} height={43} className="mix-blend-multiply" priority />
          </a>
          <nav className="flex items-center gap-6">
            {sections.map(([href, label]) => (
              <a key={href} href={href} className="hidden text-ink-2 hover:text-ink md:block">{label}</a>
            ))}
            <Link href={`/${other}`} hrefLang={other} scroll={false} className="text-muted hover:text-ink">
              {other}
            </Link>
            <a href="#contacto" className="btn">{t.nav.cta}</a>
          </nav>
        </div>
        {/* phones: section links as equal columns split by hairlines, no sideways scroll */}
        <nav className="grid border-t border-rule text-center text-muted md:hidden" style={{ gridTemplateColumns: `repeat(${sections.length}, 1fr)` }}>
          {sections.map(([href, label]) => (
            <a key={href} href={href} className="border-l border-rule py-3 transition-colors first:border-l-0 hover:bg-paper-2 hover:text-ink active:bg-paper-2">{label}</a>
          ))}
        </nav>
      </header>

      <main>
        {/* Hero: the poster head beside the couple */}
        <section className={`${wrap} pt-[var(--space-2xl)] md:pt-[var(--space-3xl)]`}>
          <div className={`${grid} items-center`}>
            <div className="col-span-12 lg:col-span-7">
              <h1 className="max-w-none font-script text-display font-semibold leading-[1.1]">{t.hero.title}</h1>
              <p className="lead mt-8 text-ink-2">{t.hero.body}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#contacto" className="btn">{t.hero.cta}</a>
                <a href="#galeria" className="btn-line">{t.hero.secondary}</a>
              </div>
            </div>
            <figure className="col-span-12 lg:col-span-5">
              <Image src="/hero/1.jpg" alt={t.hero.alt} width={1772} height={1181} sizes="(min-width:1024px) 42vw, 100vw" className="rounded-[var(--radius-photo-lg)] aspect-[4/5] w-full object-cover" priority />
              <figcaption className="mt-3 text-sm text-muted">{t.hero.eyebrow}</figcaption>
            </figure>
          </div>
        </section>

        {/* Services: a sheet of rows under hairlines */}
        <section id="servicos" className={band}>
          <h2>{t.services.title}</h2>
          <ul className="mt-[var(--space-2xl)] border-t border-rule">
            {t.services.items.map((s) => (
              <li key={s.title} className={`${grid} border-b border-rule py-[var(--space-xl)]`}>
                <p className="tag col-span-12 lg:col-span-2">{s.tag}</p>
                <h3 className="col-span-12 text-3xl lg:col-span-4">{s.title}</h3>
                <p className="col-span-12 text-lg text-ink-2 lg:col-span-6">{s.body}</p>
              </li>
            ))}
            <li className={`${grid} border-b border-rule py-[var(--space-xl)]`}>
              <p className="tag col-span-12 lg:col-span-2">{t.services.deliveryTitle}</p>
              <p className="lead col-span-12 lg:col-span-6 lg:col-start-7">{t.services.delivery}</p>
            </li>
          </ul>
        </section>

        {/* Gallery: if Supabase is down the page still renders, without photos (the catch stays outside the cached call so an empty list is not cached) */}
        <section id="galeria" className="border-t border-rule">
          <div className={band}>
            <div className={grid}>
              <h2 className="col-span-12 lg:col-span-7">{t.gallery.title}</h2>
              <p className="col-span-12 text-muted lg:col-span-4 lg:col-start-9 lg:self-end">{t.gallery.body}</p>
            </div>
            <div className="mt-[var(--space-2xl)]">
              <Gallery photos={await getPhotos(lang).catch(() => [])} t={t.gallery} />
            </div>
          </div>
        </section>

        {/* About: an olive band */}
        <section className="bg-olive text-olive-ink">
          <div className={band}>
            <div className={grid}>
              <h2 className="col-span-12 lg:col-span-5">{t.about.title}</h2>
              <div className="col-span-12 space-y-5 lg:col-span-6 lg:col-start-7">
                {t.about.paragraphs.map((p, i) => <p key={p} className={i === 0 ? "lead" : "text-lg"}>{p}</p>)}
              </div>
            </div>
          </div>
        </section>

        {/* Team: a sheet, the portraits small */}
        <section id="equipa" className={band}>
          <div className={grid}>
            <h2 className="col-span-12 lg:col-span-7">{t.team.title}</h2>
            <p className="col-span-12 text-muted lg:col-span-4 lg:col-start-9 lg:self-end">{t.team.body}</p>
          </div>
          <ul className="mt-[var(--space-2xl)] border-t border-rule lg:grid lg:grid-cols-3 lg:gap-x-[var(--gap-columns)] lg:border-b">
            {team.map((m) => (
              <li key={m.name} className={`${grid} items-center border-b border-rule py-[var(--space-lg)] lg:flex lg:flex-col lg:items-start lg:gap-y-[var(--space-md)] lg:border-b-0 lg:py-[var(--space-xl)]`}>
                <Image src={m.src} alt={m.name} width={600} height={600} sizes="(min-width:1024px) 30vw, 200px" className="print-news col-span-4 aspect-square w-full object-cover sm:col-span-2" />
                <div className="col-span-8 sm:col-span-10">
                  <h3 className="text-title">{m.name}</h3>
                  <p className="mt-1 text-muted">{m.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Videos */}
        <section className={`${band} border-t border-rule`}>
          <h2 className="max-w-[24ch]">{t.videos.title}</h2>
          <div className="mt-[var(--space-2xl)] grid gap-[var(--gap-columns)] md:grid-cols-2">
            {VIDEOS.map((v) => (
              <figure key={v.file}>
                <VideoEmbed file={v.file} youtubeId={v.youtubeId} label={`${t.videos.play} ${v.names}`} />
                <figcaption className="mt-3 text-sm text-muted">{v.names}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Testimonial: an olive band */}
        <section className="bg-olive text-olive-ink">
          <div className={`${band} ${grid}`}>
            <h2 className="col-span-12 text-title">{t.testimonial.title}</h2>
            <blockquote className="col-span-12 m-0 text-display-s font-light leading-tight lg:col-span-10">“{t.testimonial.quote}”</blockquote>
          </div>
        </section>

        {/* Contact */}
        <section id="contacto" className={band}>
          <div className={grid}>
            <div className="col-span-12 lg:col-span-5">
              <h2>{t.contact.title}</h2>
              <p className="mt-6 text-ink-2">{t.contact.body}</p>
              <dl className="mt-[var(--space-xl)] space-y-6">
                <div>
                  <dt className="text-sm text-muted">Email</dt>
                  <dd className="mt-1 text-lg"><a href={`mailto:${EMAIL}`} className={link}>{EMAIL}</a></dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">{t.contact.phones}</dt>
                  <dd className="mt-1 flex flex-wrap gap-x-6 text-lg">
                    {PHONES.map((p) => <a key={p} href={`tel:${p.replace(/ /g, "")}`} className={link}>{p}</a>)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">{t.contact.address}</dt>
                  <dd className="mt-1 text-lg">
                    {ADDRESS}
                    <br />
                    <a href={MAP} target="_blank" rel="noopener noreferrer" className={link}>{t.contact.map}</a>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">{t.contact.social}</dt>
                  <dd className="mt-1 flex flex-wrap gap-x-6 text-lg">
                    <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className={link}>Instagram</a>
                    <a href={FACEBOOK} target="_blank" rel="noopener noreferrer" className={link}>Facebook</a>
                  </dd>
                </div>
              </dl>
            </div>
            <div className="card col-span-12 p-8 md:p-10 lg:col-span-6 lg:col-start-7">
              <ContactForm t={t.contact} />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-rule">
        <div className={`${wrap} py-[var(--space-xl)] text-sm text-muted`}>© FotoMiranda. {t.footer.rights}</div>
      </footer>
    </>
  );
}
