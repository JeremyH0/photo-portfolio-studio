# Owner's Guide — Nick's Photography Website

A plain-text copy of the handover guide given to Nick. Kept in the repo so it
survives independently of any shared link, and so whoever maintains the site
next can see exactly what the owner was told.

---

## The two links

- **Your site** — https://nickhuangphoto.com
- **Editor** — https://photo-portfolio-ludvuc61.sanity.studio

The editor is Sanity Studio. Everything on the site — photos, titles, album
names, bio — is edited there and nowhere else.

## Finding a photo

- **Photos by album** — one list per album (Landscape, Portrait, …), with the
  number of photos in each. New albums show up here by themselves.
- **All photos** — every photo, most recently added first. The sort button at the
  top of the list can sort by date taken instead.
- The 🔍 search at the top left finds a photo by its title.

## Adding a photo

1. Open the editor → **Photos by album** → the album it belongs in.
2. Click **+** at the top of the list. The album is already filled in.
3. Drag the image file onto the image box. Add an English title (the only
   required text). Caption and translations are optional — blank translations
   fall back to English.
4. **Date taken** fills itself in from the camera info in the file. If it
   stays empty (some phone or Instagram images have no camera date), pick the
   date yourself, or leave it empty.
5. Click **Publish**. The site updates itself within a minute or two. New
   photos appear at the end of their album.

Nothing is live until Publish is pressed — until then it's a private draft, so
a half-finished edit can never break the public site.

## Other changes

- **Reorder photos** — drag them up/down inside their album; that order is
  what visitors see. **Reorder or rename albums** — Albums (names & order).
- **Move a photo to another album** — open it and change **Album**.
- **Fix a date** — open the photo and change **Date taken**. If the camera
  date differs, a "Use that date" button appears next to it.
- **Remove a photo** — open it, ⋯ menu next to Publish → Delete (permanent).
  To take it off the site but keep it, choose **Unpublish** instead.
- **New album** — Albums (names & order) → +, add a title, click Generate for
  the slug. Appears at the end; only shows on the site once it has ≥1 photo.
  An album that still has photos can't be deleted — move or delete them first.
- **Name, bio, contact email** — Site Settings.

## Running costs

| Service | Purpose | Cost |
| --- | --- | --- |
| Cloudflare Pages | Serves the site | Free |
| Sanity | Stores photos and text | Free |
| nickhuangphoto.com | Your web address (Cloudflare) | ~$10–11/yr, renews automatically each October |

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
