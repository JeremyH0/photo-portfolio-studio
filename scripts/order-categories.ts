/**
 * One-off: set the initial category display order now that categories have
 * an orderRank field (see sanity.config.ts's orderableDocumentListDeskItem
 * for "category", which gives this a proper drag-and-drop view in Studio —
 * this script just seeds a sane starting point).
 *
 * Run from the studio repo:  npx sanity exec scripts/order-categories.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-07-01'})

// Desired order: existing three albums unchanged, Black & White moved last
// (it was sorting first only because Sanity falls back to _id order, and
// "category-black-and-white" < "category-landscape" alphabetically).
const orderedIds = [
  'category-landscape',
  'category-portrait',
  'category-street',
  'category-black-and-white',
]

async function run() {
  const tx = client.transaction()
  orderedIds.forEach((id, i) => {
    tx.patch(id, {set: {orderRank: `0|a${String(i).padStart(5, '0')}:`}})
  })
  await tx.commit()
  console.log(`Ordered ${orderedIds.length} categories:`, orderedIds.join(' -> '))
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
