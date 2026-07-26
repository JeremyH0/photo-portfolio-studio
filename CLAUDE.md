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

## Current status (2026-07-26)
All 6 build phases are done and deployed, and the site is running on
**Nick's real photos** — 254 of them, imported in bulk from a local folder
(`scripts/import-nick-photos.ts`, titles authored per-photo by vision
subagents and merged into `scripts/photo-titles/all-titles.json`) across
four albums: Landscape (133), Portrait (90), Street (23), Black & White (8,
a new category). The 12 `photo-seed-*` picsum placeholders are gone
(`scripts/delete-seed-photos.ts`). Display order was randomized within each
category (`scripts/shuffle-order.ts`) so near-identical burst shots aren't
shown back-to-back — re-run it any time to reshuffle. Photographer name/bio
in Site Settings is still placeholder ("Nick Studio" / generic bio/email)
and should be swapped for the real thing whenever Nick provides it.

The **Sanity → Cloudflare deploy webhook is now set up** (as of 2026-07-26,
webhook id `HTc6TcvEedjJSPmO`, dataset `production`, triggers on
create/update/delete, POSTs to a Cloudflare Pages deploy hook) — publishing
in the Studio rebuilds the live site automatically within a minute or two.
No more manual `git push`/dashboard-retry needed for content-only changes.
(Verify with `npx sanity hooks list` from this repo if it's ever in doubt.)

### Still pending
- Real photographer bio/contact email in Site Settings (see above).
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
