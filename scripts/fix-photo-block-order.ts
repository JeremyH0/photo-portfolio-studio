/**
 * One-off fix: shuffle-order.ts (run right after the bulk import) laid out
 * photo orderRank in category blocks ordered by category _id — alphabetical,
 * so "Black & White" came first, before categories themselves had an
 * orderRank of their own to sort by. That's why the gallery's "All" view
 * showed Black & White photos before Landscape/Portrait/Street even after
 * the category *switcher* was fixed to show Black & White last.
 *
 * This re-lays the photo blocks out in the now-correct category order
 * (orderRank asc, i.e. whatever's set in the Studio's Categories panel)
 * WITHOUT re-shuffling photos within each category — their existing
 * internal (already-shuffled) order is preserved, only which block comes
 * first/last changes.
 *
 * Run from the studio repo:  npx sanity exec scripts/fix-photo-block-order.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-07-01'})

async function run() {
  const categories = await client.fetch<{_id: string; title: string}[]>(
    `*[_type == "category"] | order(orderRank asc) {_id, "title": title.en}`,
  )

  let index = 0
  const tx = client.transaction()

  for (const cat of categories) {
    // Preserve each category's current internal order (the earlier shuffle).
    const photoIds = await client.fetch<string[]>(
      `*[_type == "photo" && references($catId)] | order(orderRank asc)._id`,
      {catId: cat._id},
    )
    for (const id of photoIds) {
      tx.patch(id, {set: {orderRank: `0|a${String(index).padStart(5, '0')}:`}})
      index++
    }
    console.log(`  ${cat.title}: ${photoIds.length} photos`)
  }

  await tx.commit()
  console.log(`\nDone. Re-laid out ${index} photos in category order:`, categories.map((c) => c.title).join(' -> '))
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
