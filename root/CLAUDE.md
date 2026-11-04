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
- `components/` — `Gallery` (filters, paging, `<dialog>` lightbox), `VideoEmbed` (click-to-load YouTube), `ContactForm`.
- `lib/site.ts` — phones, email, address, social links, site URL. `lib/photos.ts` — reads the gallery from Supabase (cached, tag `photos`).
- `app/admin/` — login + gallery manager (upload, drag to reorder, category, delete). Supabase Auth, sign-ups off; every action calls `requireUser()`.
- `proxy.ts` — redirects `/` to `/pt` or `/en` by browser language (Next 16 name for middleware).
- Env vars and how to add photos or videos: see `README.md`.

## Design rules

The look is a custom vintage theme (derived from Hallmark's Darkroom): ivory paper, photographs as prints on a white mat, light only, no dark mode. Tokens live in `app/tokens.css`, base rules in `app/base.css`, shared controls in `app/globals.css`.

- Ivory paper ground, charcoal-brown ink, taupe rules, olive-green bands (`--color-olive`, cream text), one oxblood accent (ivory and olive palette from the client's Pinterest reference) (`--color-accent`) for the primary button, hover and focus only.
- Cormorant Garamond for headings and buttons (500/600), Lora for everything read. Dancing Script (the logo's script) only on the hero headline. Fonts load in `lib/fonts.ts`. No mono.
- Labels, captions and tags: body face, sentence case, untracked. Never uppercase-tracked labels.
- Soft corners (`--radius-*` tokens: 10px cards, 6px photos and buttons). Tan hairlines between rows, a double rule under the header. Shadow only on `.print`. No gradients, no emojis, no icon libraries (inline Phosphor SVG paths).
- Photographs stay in colour; never tinted. Colours and fonts only through tokens, never literals.
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
