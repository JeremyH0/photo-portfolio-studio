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
- Site: https://nickhuangphoto.com (Cloudflare Pages project `nickhuangphoto`
  in Nick's own Cloudflare account; Jeremy is a Super Administrator member)
- Studio: https://photo-portfolio-ludvuc61.sanity.studio
- Sanity project: `ludvuc61` / dataset `production`
- GitHub: `JeremyH0/photo-portfolio` and `JeremyH0/photo-portfolio-studio`

## Sanity data model
- `photo` document: image (hotspot enabled; `metadata` includes `exif`, never
  `location`), title, optional caption, category reference (labelled
  "Album"), `takenAt` "Date taken" (date), orderRank (drag-sortable)
- **Date taken**: `TakenAtInput` (`schemaTypes/components/`) fills it from the
  asset's `metadata.exif.DateTimeOriginal` once per image (clearing it sticks)
  and offers "Use that date" when they differ. Sanity strips EXIF from the
  stored file and only extracts it when the image field asks, so photos
  uploaded before 2026-10-29 had none: `backfill-taken-dates.ts` filled 240
  from the AirDropped originals in `../Nick's-Photos` (Sony A7 III EXIF). 9
  have no camera date (iPhone IMG_8157–8164 + an Instagram download) and
  stay empty. **Re-uploading an identical file reuses the old asset** (sha1
  dedupe), which has no EXIF — the field then says "no camera date". The site
  doesn't use takenAt yet (Jeremy: wait until every photo has a date).
- `category` document: title, slug, orderRank (drag-sortable) — doubles as
  the site's "album" concept
- `siteSettings` singleton: photographerName, bio, contact email, social links
- Languages: `schemaTypes/supportedLanguages.ts` is the single source of
  truth — currently `en` (default), `ja`, `zh` (Simplified), `zhHant`
  (Traditional/Taiwan). title/caption/bio are localized objects
  (localeString/localeText types generated from that file).
- **To add a language**: edit `supportedLanguages.ts` here, AND
  `src/i18n/locales.ts` + `astro.config.mjs` (`i18n.locales`) in the site repo.
  Each locale entry needs a matching `sanityKey` if the site's `LocaleCode`
  differs from the Studio field id (e.g. site code `zh-tw` ↔ Sanity key `zhHant`).

## Current status (2026-10-29)
Built, deployed, and running on **Nick's real content**: 248 published photos
across four albums — Landscape (127), Portrait (90), Street (23), Black &
White (8) — and Nick now adds/removes photos himself.
Imported in bulk from a local folder tree (`scripts/import-nick-photos.ts`);
every title was written per-photo by vision subagents looking at the actual
image, since Nick supplied only camera filenames — those live in
`scripts/photo-titles/all-titles.json`. The 12 `photo-seed-*` picsum
placeholders are gone.

**Album order** (what visitors see): Landscape → Portrait → Street →
Black & White. Both `photo` and `category` documents carry an `orderRank` and
are drag-sortable (`orderableDocumentListDeskItem` in `sanity.config.ts`).
**Studio menu** (Nick asked to find photos per album): *Photos by album* —
built live from the categories (async child, so new albums appear with no
code change), one orderable list per album filtered by `category._ref`, its
**+** opens the `photo-in-album` template that pre-fills the album; *All
photos* — recently added first, sortable by date taken; *Albums (names &
order)*; *Site Settings*. `tidyMenu()` strips the plugin's "Reset Order" and
"Toggle Increments" (one mis-click re-ranks everything) from every list.
Filtered lists still rank globally — fine, the site orders within an album.
`@sanity/icons` v5 has no root exports: import each icon from its subpath
(`@sanity/icons/Folder`). Photo order is
randomized *within* each album so near-identical burst shots aren't adjacent.

**Publishing is automatic**: a Sanity webhook (id `HTc6TcvEedjJSPmO`, dataset
`production`, fires on create/update/delete) POSTs to a Cloudflare Pages
deploy hook (named "Nick" on the `nickhuangphoto` project — re-pointed
2026-10-10 when the project moved to Nick's account), so publishing in the Studio rebuilds the live site within a
minute or two — no git push needed for content-only changes. Verify with
`npx sanity hooks list` if it's ever in doubt.

**Handover docs for Nick** (non-technical owner's guide — the two links, how
to add a photo, costs, troubleshooting):
- `HANDOVER.md` in this repo — plain text, version-controlled.
- Published page (styled to match the site; this is the link to send Nick):
  https://claude.ai/code/artifact/70fb7cc8-c3fa-4e26-8c85-29630349c6d6

### Still pending
- Real photographer name/bio/contact email in Site Settings — still the
  placeholder generic bio / `hello@example.com` (name is now "Nick Huang",
  set 2026-10-16). Swap these
  before calling the site launched.
- "Snowlit Path" (`drafts.91fca8bc-…`, Landscape, added 2026-10-24) is
  still an unpublished draft — Nick may have forgotten to press Publish.
- Nick IS a Sanity member: the project has two, Jeremy and "黃于展"
  (Administrator) — checked 2026-10-16 via the projects API; Jeremy to confirm
  that account is Nick's. Jeremy sent him a plain-text "how to edit" message.
- The published handover page above still shows the old
  `photo-portfolio-d1s.pages.dev` link (HANDOVER.md is current) — republish
  it from HANDOVER.md if Jeremy asks.
- Domain: Nick had to click Cloudflare's "Verify your contact information"
  email by ~2026-10-24 (registered 2026-10-09) or the domain is suspended.
  If the site suddenly stops resolving, check `whois nickhuangphoto.com` for
  `clientHold` first. FortiGuard (Jeremy's network) blocks it as a "Newly
  Registered Domain" until ~early Nov 2026 or a re-categorisation request at
  fortiguard.com/webfilter.

## Scripts
Run from this repo: `npx sanity exec scripts/<name>.ts --with-user-token`
(top-level `await` doesn't compile there — wrap in `main()`). **Bulk patches
fire the deploy webhook once per published document**: pause it first
(sanity.io/manage → API → Webhooks; the hooks API field is
`isDisabledByUser`). It wasn't paused for the 2026-10-29 backfill — Cloudflare
answered most of the ~240 deliveries 304 and rebuilt a handful of times.

| Script | What it does |
| --- | --- |
| `import-nick-photos.ts` | Bulk-imports a local folder tree (one subfolder per album) — uploads assets, creates `photo` docs, matches/creates categories by slug. Titles come from `photo-titles/`. Deterministic IDs (hash of relative path) so re-running skips what exists. Supports `-- --dry-run`. |
| `backfill-taken-dates.ts` | Fills empty `takenAt` from EXIF in the local originals (matched by import ID, then filename; drafts included). Safe to re-run; supports `-- --dry-run`. |
| `shuffle-order.ts` | Re-randomizes photo order within each album. Safe to re-run any time. |
| `order-categories.ts` | Seeded the album display order. Edit the array and re-run to change it in bulk (or just drag in the Studio). |
| `fix-photo-block-order.ts` | Re-lays photo `orderRank` so albums appear in category order in the gallery's "All" view, *without* reshuffling within albums. Run if "All" ever groups albums wrongly. |
| `delete-seed-photos.ts` | Deleted the 12 picsum placeholders. Historical — kept as a record. |
| `seed.ts` | Original picsum placeholder seed. Historical — its documents no longer exist. |
| `add-zh-hant.ts` | One-off: added zhHant translations to the seeded content. Historical. |

## Gotchas worth not rediscovering
- **Sanity's default sort is by `_id`**, not creation order. That's why Black
  & White sorted first before categories had an `orderRank` —
  `category-black-and-white` precedes `category-landscape` alphabetically.
  Any list the site renders needs an explicit `order()` in the GROQ query.
- **Category order and photo order are separate things.** Fixing the album
  *switcher* order does nothing to the photo grid's "All" view, which sorts
  by each photo's own `orderRank`. Both were wrong once, for this reason.
- **New photos added in the Studio land at the end of the "All" view**, not
  inside their album's block, because `orderRank` is global across photos.
  Expected behaviour, not a bug — they still group correctly when filtered.
- **Git pushes can fail with `403 ... denied to pmsadmin-hc`.** This machine
  has two GitHub accounts in the keychain; `JeremyH0` is the one with write
  access. Check `gh auth status` and switch the active account if rejected.
- The scratchpad is wiped between sessions — anything worth keeping goes in a
  repo or a published artifact, not `/tmp`.

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
