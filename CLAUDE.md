# Photography Portfolio — Project Context

## What this is
A photography portfolio website for a non-technical friend (hobbyist photographer).
Built by me (a web designer) as a showcase piece for my own portfolio.
Goal: stunning design, near-zero running costs, and a CMS so simple the
photographer cannot break anything.

## Stack (decided — do not suggest alternatives)
- **Astro** (static output) + **Tailwind CSS** + **GSAP** (animations)
- **Sanity** free tier = headless CMS (separate repo/studio)
- **Cloudflare Pages** hosting, auto-deploy from GitHub
- Sanity webhook → Cloudflare deploy hook: publishing in the Studio rebuilds the site

## Sanity data model
- `photo` document: image (hotspot enabled), title, optional caption,
  category reference, orderRank (drag-sortable in Studio)
- `siteSettings` singleton: bio, contact email, social links
- Env vars: SANITY_PROJECT_ID, SANITY_DATASET (set locally in .env and in Cloudflare)
- Multilingual (confirmed 2026-07-20): en, ja, zh (Simplified). zh-Hant
  (Taiwan) is possible later — locale lists in both repos are the single
  place to add it. title/caption/bio are localized objects (localeString/
  localeText types generated from schemaTypes/supportedLanguages.ts).

## Build phases
1. ✅ Setup: Sanity project, Astro project, GitHub repos, Cloudflare Pages
2. Sanity schemas
3. Data layer: @sanity/client, GROQ queries, @sanity/image-url helper
   (WebP srcsets + LQIP blur placeholders)
4. Gallery page design like a awwwward website 
5. GSAP polish (scroll reveals, transitions; respect prefers-reduced-motion)
   Page transitions: Barba.js + GSAP in the style of
   https://tympanus.net/codrops/2026/04/08/creating-custom-page-transitions-in-astro-with-barba-js-and-gsap/
6. Later: lightbox, about/contact page, SEO/OG images, mobile & perf pass

## Rules
- Images ALWAYS through the Sanity image pipeline (optimized WebP + lazy
  loading + LQIP). Never raw <img> with full-size sources.
- Keep the CMS schema minimal — the editor must not be able to break layouts.
- Static-first: no server runtime, no paid services, nothing that adds
  running costs beyond the domain.
- Performance target: Lighthouse ~100. This site is a portfolio piece.
- Design decisions are mine — propose, but ask before choosing aesthetics.
- Keep changes small and explain what you changed and why (I review everything).