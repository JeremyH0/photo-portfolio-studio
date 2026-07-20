# Photography Portfolio — Project Context

## What this is
A photography portfolio website for Nick (a non-technical friend, hobbyist
photographer). Built by Jeremy (a web designer) as a showcase piece for his
own portfolio. Goal: stunning design, near-zero running costs, and a CMS so
simple the photographer cannot break anything.

Two repos:
- **This one** (`photo-portfolio-studio`) — Sanity Studio (the CMS)
- **`../photo-portfolio`** — the Astro site itself. Its `AGENTS.md` (=
  `CLAUDE.md`) has the site-specific design/build notes. Read both when
  picking up work — most day-to-day changes happen in the site repo.

## Stack (decided — do not suggest alternatives)
- **Astro** (static output) + **Tailwind CSS** + **GSAP** (animations, Barba.js transitions)
- **Sanity** free tier = headless CMS (this repo)
- **Cloudflare Pages** hosting, auto-deploy from GitHub on push to `main`

## Live URLs
- Site: https://photo-portfolio-d1s.pages.dev
- Studio: https://photo-portfolio-ludvuc61.sanity.studio
- Sanity project: `ludvuc61` / dataset `production`
- GitHub: `JeremyH0/photo-portfolio` and `JeremyH0/photo-portfolio-studio`

## Sanity data model
- `photo` document: image (hotspot enabled), title, optional caption,
  category reference, orderRank (drag-sortable in Studio)
- `category` document: title, slug — doubles as the site's "album" concept
- `siteSettings` singleton: photographerName, bio, contact email, social links
- Languages: `schemaTypes/supportedLanguages.ts` is the single source of
  truth — currently `en` (default), `ja`, `zh` (Simplified), `zhHant`
  (Traditional/Taiwan). title/caption/bio are localized objects
  (localeString/localeText types generated from that file).
- **To add a language**: edit `supportedLanguages.ts` here, AND
  `src/i18n/locales.ts` + `astro.config.mjs` (`i18n.locales`) in the site repo.
  Each locale entry needs a matching `sanityKey` if the site's `LocaleCode`
  differs from the Studio field id (e.g. site code `zh-tw` ↔ Sanity key `zhHant`).

## Current status (2026-07-21)
All 6 build phases are done and deployed. The site currently runs on
**placeholder content**: 12 picsum.photos stock images (seeded via
`scripts/seed.ts`, ids `photo-seed-*`), photographer name "Nick Studio",
email `hello@example.com`. **Swap these for Nick's real photos and bio
before calling this launched** — either have Nick self-serve in the Studio
(delete the seed docs, add real `photo` docs, edit Site Settings), or run a
similar seed script with real assets.

### Still pending
- **Sanity → Cloudflare deploy webhook** (Jeremy explicitly deferred this
  multiple times — always worth asking if it's been done yet before
  assuming). Without it, publishing in the Studio does NOT rebuild the
  site; someone has to `git push` or manually retry the Cloudflare deploy.
  Setup: Cloudflare dashboard → Workers & Pages → photo-portfolio →
  Settings → Builds & deployments → Deploy hooks → create one → paste its
  URL into a new webhook at sanity.io/manage/project/ludvuc61 → API →
  Webhooks (dataset `production`, trigger create/update/delete, POST).
- Real photos/content (see above).
- Custom domain not yet configured (site's `astro.config.mjs` `site:` value
  points at the `.pages.dev` URL; update it and hreflang/canonical follow
  automatically if a custom domain is added later).

## Rules
- Images ALWAYS through the Sanity image pipeline (optimized WebP + lazy
  loading + LQIP). Never raw `<img>` with full-size sources.
- Keep the CMS schema minimal — the editor must not be able to break layouts.
- Static-first: no server runtime, no paid services, nothing that adds
  running costs beyond the domain.
- Performance target: Lighthouse ~100. This site is a portfolio piece.
- Design decisions are Jeremy's — propose, but ask before committing to
  aesthetics. That said, Jeremy iterates fast and often points at a
  reference (a CodePen, a Codrops article) and says "adapt this" — when he
  does, fetch the actual source (WebFetch/a headless browser if blocked)
  and follow it closely rather than improvising something loosely inspired.
- Keep changes small and explain what changed and why (Jeremy reviews everything).
- **Before marking any visual/interactive change done**: build, then verify
  with Playwright (chromium is installed in the session scratchpad, not the
  repo — reinstall per-session with `npm i playwright && npx playwright
  install chromium` if starting fresh) across at least desktop + mobile
  viewports, screenshot key states, check for console/page errors. Jeremy
  has caught real bugs this way (double-init from Barba firing on initial
  load, native image-drag swallowing swipe gestures) — don't skip it.
- Commit + push both repos when done; Cloudflare deploys automatically on
  push to `main` (check status via `gh`-less method: GitHub check-runs API,
  see recent session history, or just look at the Cloudflare dashboard).
