# FotoMiranda

Website for a wedding, baptism and event photographer in Santa Maria da Feira (Portugal). The app lives in `` (Next.js 16, React 19, Tailwind 4, TypeScript). The git repo root is one level above it.

@root/AGENTS.md

## Commands (run from ``)

- `npm run dev` / `npm run build && npm start`
- `npm run lint` and `npx tsc --noEmit` — both must pass before a change is done
- `npm test` runs Vitest; today it only covers the contact route (`app/api/contact/route.test.ts`)

## Layout

- `app/[lang]/` — the only page, in `pt` (default) and `en`. All copy is in `app/[lang]/dictionaries.ts`; `en` is typed against `pt`, so a missing key fails the type-check.
- `app/api/contact/route.ts` — contact form: validation, Turnstile check, then Resend.
- `components/` — `Gallery` (filters, paging, `<dialog>` lightbox), `VideoEmbed` (click-to-load YouTube), `ContactForm`, `Reveal` (scroll fade-in).
- `lib/site.ts` — phones, email, address, social links, site URL. `lib/photos.ts` — reads the gallery from Supabase (cached, tag `photos`).
- `app/admin/` — login + gallery manager (upload, drag to reorder, category, delete). Supabase Auth, sign-ups off; every action calls `requireUser()`.
- `proxy.ts` — redirects `/` to `/pt` or `/en` by browser language (Next 16 name for middleware).
- Env vars and how to add photos or videos: see `README.md`.

## Design rules

The look follows the `minimalist-ui` skill. Load it before changing any UI.

- Warm off-white canvas, `#111` text, `#787774` muted text, borders `1px solid #EAEAEA`.
- Newsreader for headings, Geist for body, Geist Mono for small labels. No Inter, Roboto or Open Sans.
- Radius 12px on cards, 8px on photos, 6px on buttons. Pills only for small tags.
- No gradients, no heavy shadows, no emojis, no icon libraries. Icons are inline Phosphor SVG paths.
- Motion only via `transform` and `opacity`, and always switched off for `prefers-reduced-motion`.
- Decisions already made: no shadcn, no dark mode.
- Copy is European Portuguese (not Brazilian). Keep the plain, specific tone of the existing text.

## Gotchas

- `cacheComponents` is on: file or network reads during prerender must sit inside a `"use cache"` function (see `lib/photos.ts`) or the build fails.
- `NEXT_PUBLIC_*` variables are baked in at build time. After changing one, rebuild.
- Photos live in Supabase (table `photos` + public bucket `gallery`); schema in `supabase/migrations/`.
- Gallery photos are only 800 px wide, so the lightbox caps their size. Do not stretch them; ask the client for larger originals instead.
- Videos live on YouTube (unlisted). Never commit MP4s; `../.gitignore` blocks `public/video/*.mp4`.
- Never `rm -rf .next` while `next dev` is running (the user usually has it on port 3000): the open browser tab keeps stale, half-updated styles and the page looks broken. Check for a running dev server first (`lsof -i :3000`); to test a production build, use a different folder or ask the user to stop dev.
- zsh expands brackets: quote paths like `"root/app/[lang]/page.tsx"` in shell commands.
- Headless Chrome screenshots cannot scroll or click: lazy images and scroll-reveal sections stay blank. Use `--force-prefers-reduced-motion` for layout checks, and treat clicks (lightbox, form) as untested until seen in a real browser.
- The contact form's `from` address is Resend's shared one, which only delivers to the Resend account owner until a domain is verified.

## Working agreements

- Do not push or rewrite git history without being asked.
- Keep changes small: reuse what exists, add no dependency for a few lines, and say what was not checked.
