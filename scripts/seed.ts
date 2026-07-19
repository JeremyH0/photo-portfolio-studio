/**
 * Seed the dataset with placeholder stock photos (picsum.photos, free license)
 * until the real photos arrive. Deterministic _ids make it safe to re-run.
 *
 * Run from the studio repo:  npx sanity exec scripts/seed.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-07-01'})

type Locale = {en: string; ja: string; zh: string}

const categories: {id: string; slug: string; title: Locale}[] = [
  {id: 'category-landscape', slug: 'landscape', title: {en: 'Landscape', ja: '風景', zh: '风景'}},
  {id: 'category-street', slug: 'street', title: {en: 'Street', ja: 'ストリート', zh: '街头'}},
  {id: 'category-portrait', slug: 'portrait', title: {en: 'Portrait', ja: 'ポートレート', zh: '人像'}},
]

type SeedPhoto = {
  picsumId: number
  w: number
  h: number
  category: string
  title: Locale
  caption?: Locale
}

const photos: SeedPhoto[] = [
  {picsumId: 1036, w: 2000, h: 1333, category: 'category-landscape', title: {en: 'Winter Ridge', ja: '冬の稜線', zh: '冬日山脊'}, caption: {en: 'First light on fresh snow.', ja: '新雪に差す朝の光。', zh: '晨光洒在新雪上。'}},
  {picsumId: 1015, w: 2000, h: 1333, category: 'category-landscape', title: {en: 'River Valley', ja: '川の谷', zh: '河谷'}},
  {picsumId: 1018, w: 1400, h: 1750, category: 'category-landscape', title: {en: 'Alpine Lake', ja: '高原の湖', zh: '高山湖泊'}},
  {picsumId: 1021, w: 2000, h: 1333, category: 'category-landscape', title: {en: 'Sea of Clouds', ja: '雲海', zh: '云海'}},
  {picsumId: 1022, w: 2000, h: 1250, category: 'category-landscape', title: {en: 'Northern Lights', ja: 'オーロラ', zh: '极光'}},
  {picsumId: 1016, w: 1400, h: 1750, category: 'category-landscape', title: {en: 'Canyon Walls', ja: '峡谷', zh: '峡谷'}},
  {picsumId: 429, w: 2000, h: 1333, category: 'category-street', title: {en: 'Crossing', ja: '交差点', zh: '路口'}},
  {picsumId: 1044, w: 1400, h: 1750, category: 'category-street', title: {en: 'Night Windows', ja: '夜の窓', zh: '夜窗'}},
  {picsumId: 122, w: 2000, h: 1333, category: 'category-street', title: {en: 'Harbor Morning', ja: '港の朝', zh: '清晨海港'}},
  {picsumId: 1005, w: 1400, h: 1750, category: 'category-portrait', title: {en: 'Quiet Gaze', ja: '静かな眼差し', zh: '静静的凝视'}},
  {picsumId: 1011, w: 2000, h: 1333, category: 'category-portrait', title: {en: 'On the Water', ja: '水の上で', zh: '水上'}},
  {picsumId: 1027, w: 1400, h: 1750, category: 'category-portrait', title: {en: 'Ink and Light', ja: '墨と光', zh: '墨与光'}},
]

async function uploadImage(url: string, filename: string) {
  const res = await fetch(url, {redirect: 'follow'})
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  return client.assets.upload('image', buffer, {filename})
}

async function run() {
  console.log('Seeding categories…')
  for (const cat of categories) {
    await client.createIfNotExists({
      _id: cat.id,
      _type: 'category',
      title: {_type: 'localeString', ...cat.title},
      slug: {_type: 'slug', current: cat.slug},
    })
    console.log(`  ✓ ${cat.slug}`)
  }

  console.log('Seeding photos…')
  for (const [i, p] of photos.entries()) {
    const docId = `photo-seed-${p.picsumId}`
    const existing = await client.getDocument(docId)
    if (existing) {
      console.log(`  – ${p.title.en} (exists, skipped)`)
      continue
    }
    const url = `https://picsum.photos/id/${p.picsumId}/${p.w}/${p.h}`
    const asset = await uploadImage(url, `seed-${p.picsumId}.jpg`)
    await client.create({
      _id: docId,
      _type: 'photo',
      image: {_type: 'image', asset: {_type: 'reference', _ref: asset._id}},
      title: {_type: 'localeString', ...p.title},
      ...(p.caption ? {caption: {_type: 'localeText', ...p.caption}} : {}),
      category: {_type: 'reference', _ref: p.category},
      orderRank: `0|a${String(i).padStart(5, '0')}:`,
    })
    console.log(`  ✓ ${p.title.en}`)
  }

  console.log('Seeding site settings…')
  await client.createIfNotExists({
    _id: 'siteSettings',
    _type: 'siteSettings',
    photographerName: 'Yuki Tanaka',
    bio: {
      _type: 'localeText',
      en: 'Photographer based in Hokkaido, Japan. Chasing quiet light in the mountains and on the street.',
      ja: '北海道を拠点とするフォトグラファー。山と街の静かな光を追いかけています。',
      zh: '常驻日本北海道的摄影师。追寻山间与街头的静谧光线。',
    },
    contactEmail: 'hello@example.com',
    socialLinks: [
      {_type: 'object', _key: 'instagram', label: 'Instagram', url: 'https://instagram.com'},
    ],
  })
  console.log('Done.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
