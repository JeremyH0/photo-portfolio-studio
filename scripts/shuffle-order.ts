/**
 * One-off: randomize photo display order WITHIN each category, so visually
 * similar burst-sequence shots (common straight off a camera) aren't shown
 * back-to-back. Categories stay in the same relative block order; only the
 * photos inside each one get shuffled. Re-running reshuffles again.
 *
 * Run from the studio repo:  npx sanity exec scripts/shuffle-order.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-07-01'})

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function run() {
  const categories = await client.fetch<{_id: string; title: string}[]>(
    `*[_type == "category"] | order(_id) {_id, "title": title.en}`,
  )

  let index = 0
  const tx = client.transaction()

  for (const cat of categories) {
    const photoIds = await client.fetch<string[]>(
      `*[_type == "photo" && references($catId)]._id`,
      {catId: cat._id},
    )
    const shuffled = shuffle(photoIds)
    for (const id of shuffled) {
      const orderRank = `0|a${String(index).padStart(5, '0')}:`
      tx.patch(id, {set: {orderRank}})
      index++
    }
    console.log(`  ${cat.title}: shuffled ${shuffled.length} photos`)
  }

  await tx.commit()
  console.log(`\nDone. Reordered ${index} photos.`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
