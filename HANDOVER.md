# Owner's Guide — Nick's Photography Website

A plain-text copy of the handover guide given to Nick. Kept in the repo so it
survives independently of any shared link, and so whoever maintains the site
next can see exactly what the owner was told.

---

## The two links

- **Your site** — https://photo-portfolio-d1s.pages.dev
- **Editor** — https://photo-portfolio-ludvuc61.sanity.studio

The editor is Sanity Studio. Everything on the site — photos, titles, album
names, bio — is edited there and nowhere else.

## Adding a photo

1. Open the editor, choose **Photos**.
2. Click **Create new**.
3. Drag the image file onto the image box. Add an English title (the only
   required text). Caption and translations are optional — blank translations
   fall back to English.
4. Pick an album: Landscape, Portrait, Street, or Black & White.
5. Click **Publish**. The site updates itself within a minute or two. New
   photos appear at the end of the gallery.

Nothing is live until Publish is pressed — until then it's a private draft, so
a half-finished edit can never break the public site.

## Other changes

- **Reorder photos or albums** — drag up/down in the Photos or Categories list;
  that order is what visitors see.
- **Remove a photo** — open it, Delete. (Permanent. To hide without losing it,
  drag it to the end instead.)
- **New album** — Categories → Create new, add a title, click Generate for the
  slug. Appears at the end; only shows on the site once it has ≥1 photo.
- **Name, bio, contact email, Instagram link** — Site Settings.

## Running costs

| Service | Purpose | Cost |
| --- | --- | --- |
| Cloudflare Pages | Serves the site | Free |
| Sanity | Stores photos and text | Free |
| Custom domain | Optional | ~$10–20/yr |

Free tiers, not trials. Currently ~1.6 GB of a 100 GB asset allowance and a few
hundred of 10,000 allowed documents — thousands of photos of headroom.

## Troubleshooting

- **Change hasn't appeared** — wait ~2 min and refresh; the site rebuilds after
  each publish. Confirm Publish was pressed, not just save.
- **Photo looks stretched/oddly cropped** — open it in the editor and set the
  image hotspot; the site crops around that point.
- **Anything else** — ask Jeremy. Editor actions can't break the site's design
  or layout; worst case is wrong text or a misfiled photo.

## Technical summary

- **Site**: Astro (static output) + Tailwind + GSAP — repo `JeremyH0/photo-portfolio`
- **Editor**: Sanity Studio — repo `JeremyH0/photo-portfolio-studio`
- **Sanity project**: `ludvuc61`, dataset `production`
- **Hosting**: Cloudflare Pages, auto-deploys on push to `main`
- **Publishing**: a Sanity webhook (id `HTc6TcvEedjJSPmO`) hits a Cloudflare
  deploy hook on every create/update/delete, so content changes rebuild the
  site without a git push
- **Languages**: en (default), ja, zh (Simplified), zhHant (Traditional)

Fuller engineering notes live in `CLAUDE.md` in each repo.

## Still outstanding at handover

- Site Settings still holds placeholder photographer bio and contact email
  (`hello@example.com`) — replace with Nick's real details.
- No custom domain configured; site runs on the `.pages.dev` URL. If one is
  added later, update `site:` in the site repo's `astro.config.mjs` so
  canonical/hreflang tags follow.
