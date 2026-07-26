import {getCliClient} from 'sanity/cli'
const client = getCliClient({apiVersion: '2026-07-01'})

const ids = [
  "photo-seed-1005","photo-seed-1011","photo-seed-1015","photo-seed-1016",
  "photo-seed-1018","photo-seed-1021","photo-seed-1022","photo-seed-1027",
  "photo-seed-1036","photo-seed-1044","photo-seed-122","photo-seed-429",
]

async function run() {
  const tx = client.transaction()
  for (const id of ids) tx.delete(id)
  await tx.commit()
  console.log(`Deleted ${ids.length} placeholder photos.`)
}
run().catch((e) => { console.error(e); process.exit(1) })
