/**
 * Fill each photo's "Date taken" (`takenAt`) from the camera date in Nick's
 * original files.
 *
 * The copies in Sanity carry no EXIF (it was lost on upload, before the image
 * field extracted it), but the AirDropped originals in SOURCE_DIR still do.
 * Photos are matched by the deterministic ID import-nick-photos.ts derived
 * from each file's relative path, then by original filename for photos Nick
 * uploaded himself. Only empty dates are filled; drafts are patched too so
 * publishing one never drops the date.
 *
 * Every patch to a published photo fires the Sanity → Cloudflare deploy
 * webhook (one queued message per document, delivered ~1/s; Cloudflare
 * answers the duplicates 304 but still builds a few times). Pause it first in
 * sanity.io/manage → API → Webhooks (the hooks API field is
 * `isDisabledByUser`, not `isDisabled`) and re-enable it after.
 *
 * Run from the studio repo:
 *   npx sanity exec scripts/backfill-taken-dates.ts --with-user-token -- --dry-run
 *   npx sanity exec scripts/backfill-taken-dates.ts --with-user-token
 */
import exifr from 'exifr'
import {getCliClient} from 'sanity/cli'
import {createHash} from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

// raw: drafts too (the default 'published' perspective hides them).
const client = getCliClient({apiVersion: '2026-07-01'}).withConfig({perspective: 'raw'})

const SOURCE_DIR = "/Users/Jeremy/NisekoDigital/Nick's-Photos"
const DRY_RUN = process.argv.includes('--dry-run')

// Must match import-nick-photos.ts.
const shortHash = (input: string) => createHash('md5').update(input).digest('hex').slice(0, 12)

type Photo = {_id: string; filename?: string; takenAt?: string}

function walk(dir: string): string[] {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(abs)
    return /\.jpe?g$/i.test(entry.name) ? [abs] : []
  })
}

/** EXIF DateTimeOriginal as YYYY-MM-DD (camera local time, as shot). */
async function cameraDate(file: string): Promise<string | undefined> {
  const tags = await exifr.parse(file, {pick: ['DateTimeOriginal', 'CreateDate'], reviveValues: false})
  const raw: string | undefined = tags?.DateTimeOriginal ?? tags?.CreateDate
  const m = raw?.match(/^(\d{4})[:-](\d{2})[:-](\d{2})/)
  return m && m[1] !== '0000' ? `${m[1]}-${m[2]}-${m[3]}` : undefined
}

async function main() {
  const byId = new Map<string, string>()
  const byName = new Map<string, string | null>() // null = name not unique
  for (const abs of walk(SOURCE_DIR)) {
    const date = await cameraDate(abs)
    if (!date) continue
    const rel = path.relative(SOURCE_DIR, abs)
    byId.set(`photo-nick-${shortHash(rel)}`, date)
    const name = path.basename(abs).normalize('NFC')
    byName.set(name, byName.has(name) && byName.get(name) !== date ? null : date)
  }

  const photos = await client.fetch<Photo[]>(
    `*[_type == "photo"]{_id, "filename": image.asset->originalFilename, takenAt}`,
  )

  let tx = client.transaction()
  let filled = 0
  const missing: string[] = []
  for (const photo of photos) {
    if (photo.takenAt) continue
    const date =
      byId.get(photo._id.replace(/^drafts\./, '')) ??
      (photo.filename ? byName.get(photo.filename.normalize('NFC')) : undefined)
    if (!date) {
      missing.push(`${photo._id} (${photo.filename ?? 'no file'})`)
      continue
    }
    tx = tx.patch(photo._id, (p) => p.set({takenAt: date}))
    filled++
  }

  console.log(`${photos.length} photo documents, ${filled} to fill, ${missing.length} without a camera date`)
  if (missing.length) console.log(missing.map((m) => `  - ${m}`).join('\n'))
  if (DRY_RUN || !filled) return
  await tx.commit({visibility: 'async'})
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
