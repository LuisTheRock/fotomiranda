# FotoMiranda

Website for FotoMiranda, a wedding, baptism and event photographer in Santa Maria da Feira, Portugal. Built with Next.js 16, Tailwind 4 and TypeScript. Pages: `/pt` (default) and `/en`.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:3000
npm run build && npm start   # production check
```

Next.js 16 differs from older versions. Before changing framework-level code, read the guides in `node_modules/next/dist/docs/` (see `AGENTS.md`).

## Environment variables

| Variable | What it is |
|---|---|
| `RESEND_API_KEY` | Resend API key. The contact form sends its email through Resend (free plan: 100 emails a day). |
| `CONTACT_TO` | Where the enquiries are delivered. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (free captcha for the form). |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key. |
| `NEXT_PUBLIC_SITE_URL` | Optional. Defaults to `https://www.fotomiranda.com`. Used for the sitemap, canonical links and share images. |

- Variables starting with `NEXT_PUBLIC_` are baked in at build time. After changing one, redeploy.
- With the form's shared sender (`onboarding@resend.dev`), Resend only delivers to the email of the account owner. To send anywhere else, verify a domain in Resend and change `from` in `app/api/contact/route.ts`.
- If the form shows "Não foi possível enviar", check the server logs. Messages starting with `contact:` say why (captcha rejected, Resend refused, missing secret).
- For local testing, `.env.example` has Cloudflare's always-pass Turnstile test keys.

## Set up the environment variables

### 1. Get the values

**Resend** (`RESEND_API_KEY`, `CONTACT_TO`)
1. Create a free account at resend.com.
2. Go to API Keys, click Create API Key and copy it. It starts with `re_` and is shown only once.
3. `CONTACT_TO` is the email where enquiries arrive. With the shared sender it must be the email the Resend account was created with. To send to any other address, verify the domain in Resend first.

**Cloudflare Turnstile** (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`)
1. Sign in at dash.cloudflare.com (free account) and open Turnstile.
2. Click Add widget and give it any name.
3. Add the hostnames `fotomiranda.com` and `www.fotomiranda.com`, plus `localhost` to test locally.
4. Choose the "Managed" widget type and create it.
5. Copy the Site Key (public) and the Secret Key (private).

### 2. Locally

From `root/`, run `cp .env.example .env.local` and fill in the four values:

```
RESEND_API_KEY=re_xxxxxxxx
CONTACT_TO=you@example.com
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAA...
TURNSTILE_SECRET_KEY=0x4AAAAAAA...
```

`.env.local` is git-ignored. Never put real keys in `.env.example`. Restart `npm run dev` after any change. To try the form without a Cloudflare account, use the test pair in `.env.example` (a real Resend key is still needed for the email).

### 3. On the live site (Vercel)

1. Project, Settings, Environment Variables.
2. Add the same four names and values for Production.
3. Redeploy. The two `NEXT_PUBLIC_` values are built into the site, so they only change with a new build.

### 4. Check it works

Send a test message through the form. If it says "Não foi possível enviar", look in the server logs for a line starting with `contact:`. It tells you whether the captcha was rejected, Resend refused the email, or a key is missing.

## Where things are

| To change | Edit |
|---|---|
| Any text, in Portuguese or English | `app/[lang]/dictionaries.ts` |
| Phones, email, address, map, social links | `lib/site.ts` (also feeds the search-engine data) |
| Page layout and sections | `app/[lang]/page.tsx` |
| Colours, fonts, motion | `app/globals.css` and the font setup in `app/[lang]/layout.tsx` |
| Contact form email | `app/api/contact/route.ts` |

## Add photos to the gallery

Put the files in `public/gallery/` named `<category>-<number>.jpg`, for example `casamento-30.jpg`. The categories are `casamento`, `casal` and `bebes`. The gallery sorts by category (weddings first), then by name, and shows 12 photos before "Mostrar mais". The blur preview is generated automatically at build.

Use photos at least 2000 px on the long edge. Smaller ones look soft in the viewer.

**A new category** (for example `batizado`): the build stops with a message naming the file until you do all of these:
1. Add it to `ORDER` in `lib/photos.ts` and to `Category` in `components/Gallery.tsx`.
2. Add its label and alt text under `gallery` in both languages in `dictionaries.ts`.
3. Add a button to the `filters` list in `components/Gallery.tsx`.

## Videos

The films live on YouTube as unlisted videos, so the site never serves video files. They are listed in `VIDEOS` at the top of `app/[lang]/page.tsx`: the `youtubeId` is the part after `youtu.be/` or `v=` in the link, and `file` names the poster image `public/video/<file>.jpg`. The player loads nothing from YouTube until a visitor presses play.

Do not put MP4 files in the repo. `.gitignore` already excludes `public/video/*.mp4`.

## Deploy

Any Node host works; Vercel is the simplest. Set the environment variables above, then deploy. Check the form once after the first deploy by sending a test message.
