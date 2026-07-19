/**
 * One-off: add Traditional Chinese (zhHant) translations to the seeded
 * placeholder content. Only sets zhHant keys — never touches other fields.
 *
 * Run:  npx sanity exec scripts/add-zh-hant.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-07-01'})

const categoryTitles: Record<string, string> = {
  'category-landscape': '風景',
  'category-street': '街頭',
  'category-portrait': '人像',
}

const photoTitles: Record<string, {title: string; caption?: string}> = {
  'photo-seed-1036': {title: '冬日山脊', caption: '晨光灑在新雪上。'},
  'photo-seed-1015': {title: '河谷'},
  'photo-seed-1018': {title: '高山湖泊'},
  'photo-seed-1021': {title: '雲海'},
  'photo-seed-1022': {title: '極光'},
  'photo-seed-1016': {title: '峽谷'},
  'photo-seed-429': {title: '路口'},
  'photo-seed-1044': {title: '夜窗'},
  'photo-seed-122': {title: '清晨海港'},
  'photo-seed-1005': {title: '靜靜的凝視'},
  'photo-seed-1011': {title: '水上'},
  'photo-seed-1027': {title: '墨與光'},
}

async function run() {
  for (const [id, title] of Object.entries(categoryTitles)) {
    await client.patch(id).set({'title.zhHant': title}).commit()
    console.log(`✓ ${id}`)
  }
  for (const [id, t] of Object.entries(photoTitles)) {
    const patch = client.patch(id).set({'title.zhHant': t.title})
    if (t.caption) patch.set({'caption.zhHant': t.caption})
    await patch.commit()
    console.log(`✓ ${id}`)
  }
  await client
    .patch('siteSettings')
    .set({'bio.zhHant': '常駐日本北海道的攝影師。追尋山間與街頭的靜謐光線。'})
    .commit()
  console.log('✓ siteSettings bio')
  console.log('Done.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
