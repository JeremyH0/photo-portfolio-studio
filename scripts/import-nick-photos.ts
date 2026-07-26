/**
 * Bulk-import Nick's real photos from a local folder tree into Sanity.
 *
 * Expects a source directory with one subfolder per album/category (e.g.
 * "landscape", "portrait", "Street", "Black & White"), each full of JPGs.
 * Titles come from scripts/gen-titles/*_titles.json (filename -> title
 * maps produced separately — see that folder's README-less convention: one
 * JSON file per source subfolder batch, keyed by "<folder>/<filename>").
 *
 * Categories are matched to existing Sanity categories by slug; anything
 * not already in the dataset gets created. Deterministic doc IDs (hash of
 * the relative path) make this safe to re-run — already-imported photos
 * are skipped.
 *
 * Run from the studio repo:
 *   npx sanity exec scripts/import-nick-photos.ts --with-user-token -- --dry-run
 *   npx sanity exec scripts/import-nick-photos.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'
import {createHash} from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const client = getCliClient({apiVersion: '2026-07-01'})

const SOURCE_DIR = "/Users/Jeremy/NisekoDigital/Nick's-Photos"
const TITLES_DIR = path.join(import.meta.dirname, 'photo-titles')
const DRY_RUN = process.argv.includes('--dry-run')

// Exact byte-duplicate files found alongside their originals — skipped.
const SKIP_FILES = new Set([
  "portrait/2025.07.14-1195 2.JPG",
  "portrait/2025.07.14-1172 2.JPG",
  "portrait/2025.07.14-1171 2.JPG",
  "portrait/2025.07.14-1179 2.JPG",
])

// Folder name -> existing category slug (reuse) or a new one to create.
const CATEGORY_SLUGS: Record<string, string> = {
  landscape: 'landscape',
  portrait: 'portrait',
  Street: 'street',
  'Black & White': 'black-and-white',
}

function shortHash(input: string): string {
  return createHash('md5').update(input).digest('hex').slice(0, 12)
}

function loadTitles(): Map<string, string> {
  const titles = new Map<string, string>()
  if (!fs.existsSync(TITLES_DIR)) return titles
  for (const file of fs.readdirSync(TITLES_DIR)) {
    if (!file.endsWith('.json')) continue
    const data = JSON.parse(fs.readFileSync(path.join(TITLES_DIR, file), 'utf-8'))
    for (const [relPath, title] of Object.entries(data)) {
      titles.set(relPath, title as string)
    }
  }
  return titles
}

function fallbackTitle(filename: string): string {
  return path
    .basename(filename, path.extname(filename))
    .replace(/[_-]+/g, ' ')
    .trim()
}

async function ensureCategory(folder: string, slug: string): Promise<string> {
  const existing = await client.fetch<{_id: string} | null>(
    `*[_type == "category" && slug.current == $slug][0]{_id}`,
    {slug},
  )
  if (existing) return existing._id

  const id = `category-${slug}`
  if (!DRY_RUN) {
    await client.createIfNotExists({
      _id: id,
      _type: 'category',
      title: {_type: 'localeString', en: folder},
      slug: {_type: 'slug', current: slug},
    })
  }
  console.log(`  + new category: ${folder} (${slug})`)
  return id
}

async function uploadImage(absPath: string): Promise<string> {
  const buffer = fs.readFileSync(absPath)
  const asset = await client.assets.upload('image', buffer, {filename: path.basename(absPath)})
  return asset._id
}

async function run() {
  const titles = loadTitles()
  console.log(`Loaded ${titles.size} generated titles.`)

  const folders = Object.keys(CATEGORY_SLUGS)
  const categoryIds: Record<string, string> = {}

  console.log('\nResolving categories…')
  for (const folder of folders) {
    categoryIds[folder] = await ensureCategory(folder, CATEGORY_SLUGS[folder])
  }

  let index = 0
  let created = 0
  let skipped = 0
  let missingTitle = 0

  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Importing photos…`)
  for (const folder of folders) {
    const dir = path.join(SOURCE_DIR, folder)
    const files = fs
      .readdirSync(dir)
      .filter((f) => /\.jpe?g$/i.test(f))
      .sort((a, b) => a.localeCompare(b))

    for (const filename of files) {
      const relPath = `${folder}/${filename}`
      if (SKIP_FILES.has(relPath)) {
        index++
        continue
      }

      const docId = `photo-nick-${shortHash(relPath)}`
      const title = titles.get(relPath)
      if (!title) missingTitle++
      const finalTitle = title ?? fallbackTitle(filename)

      const existing = DRY_RUN ? null : await client.getDocument(docId)
      if (existing) {
        skipped++
        index++
        continue
      }

      const orderRank = `0|a${String(index).padStart(5, '0')}:`

      if (DRY_RUN) {
        console.log(`  would create: [${folder}] "${finalTitle}" <- ${filename}`)
      } else {
        const assetId = await uploadImage(path.join(dir, filename))
        await client.create({
          _id: docId,
          _type: 'photo',
          image: {_type: 'image', asset: {_type: 'reference', _ref: assetId}},
          title: {_type: 'localeString', en: finalTitle},
          category: {_type: 'reference', _ref: categoryIds[folder]},
          orderRank,
        })
        console.log(`  ✓ [${folder}] ${finalTitle}`)
      }
      created++
      index++
    }
  }

  console.log(`\nDone. ${created} ${DRY_RUN ? 'would be created' : 'created'}, ${skipped} already existed (skipped), ${missingTitle} used a fallback filename-based title.`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
