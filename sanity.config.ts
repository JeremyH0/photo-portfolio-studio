import {AddIcon} from '@sanity/icons/Add'
import {CogIcon} from '@sanity/icons/Cog'
import {FolderIcon} from '@sanity/icons/Folder'
import {ImagesIcon} from '@sanity/icons/Images'
import {ThListIcon} from '@sanity/icons/ThList'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool, type StructureBuilder, type StructureResolverContext} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'

type OrderableItem = ReturnType<typeof orderableDocumentListDeskItem>
type MenuItem = {action?: string; intent?: {type: string; params?: unknown}}

/**
 * The plugin's list menu also offers "Reset Order" (re-ranks every photo, one
 * mis-click scrambles the albums) and "Toggle Increments" (debug). Nick never
 * needs them. dropPlainCreate also removes its "Create new Photo", for lists
 * that offer "Add a photo to <album>" instead.
 */
function tidyMenu(item: OrderableItem, dropPlainCreate = false): OrderableItem {
  const child = item.child as {menuItems?: MenuItem[]}
  child.menuItems = child.menuItems?.filter(
    (m) =>
      m.action !== 'resetOrder' &&
      m.action !== 'showIncrements' &&
      !(dropPlainCreate && m.intent?.type === 'create' && !Array.isArray(m.intent.params)),
  )
  return item
}

type Album = {_id: string; title: string; count: number}

const ALBUMS_QUERY = `*[_type == "category" && !(_id in path("drafts.**"))] | order(orderRank) {
  _id,
  "title": coalesce(title.en, "Untitled album"),
  "count": count(*[_type == "photo" && category._ref == ^._id && !(_id in path("drafts.**"))])
}`

/**
 * One drag-sortable list per album, read live — a new album appears here
 * without any code change. "Add a photo" from inside an album pre-fills it
 * (the photo-in-album template below).
 */
async function photosByAlbum(S: StructureBuilder, context: StructureResolverContext) {
  const albums = await context.getClient({apiVersion: '2026-07-01'}).fetch<Album[]>(ALBUMS_QUERY)
  return S.list()
    .title('Photos by album')
    .items(
      albums.map((album) =>
        tidyMenu(
          orderableDocumentListDeskItem({
            type: 'photo',
            id: `album-${album._id}`,
            title: `${album.title} (${album.count})`,
            icon: FolderIcon,
            filter: 'category._ref == $albumId',
            params: {albumId: album._id},
            menuItems: [
              S.menuItem()
                .title(`Add a photo to ${album.title}`)
                .icon(AddIcon)
                .intent({type: 'create', params: [{type: 'photo', template: 'photo-in-album'}, {albumId: album._id}]})
                .serialize(),
            ],
            S,
            context,
          }),
          true,
        ),
      ),
    )
}

export default defineConfig({
  name: 'default',
  title: 'photo-portfolio-studio',

  projectId: 'ludvuc61',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Photos by album')
              .id('photos-by-album')
              .icon(FolderIcon)
              .child(() => photosByAlbum(S, context)),
            S.listItem()
              .title('All photos')
              .id('all-photos')
              .icon(ImagesIcon)
              .child(
                S.documentTypeList('photo')
                  .title('All photos — recently added first')
                  .defaultOrdering([{field: '_createdAt', direction: 'desc'}]),
              ),
            S.divider(),
            tidyMenu(
              orderableDocumentListDeskItem({
                type: 'category',
                id: 'albums',
                title: 'Albums (names & order)',
                icon: ThListIcon,
                S,
                context,
              }),
            ),
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .icon(CogIcon)
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    templates: (templates) => [
      // The singleton is edited via the pinned entry above, never created ad hoc.
      ...templates.filter((t) => t.schemaType !== 'siteSettings'),
      {
        id: 'photo-in-album',
        title: 'Photo in album',
        schemaType: 'photo',
        parameters: [{name: 'albumId', type: 'string'}],
        value: ({albumId}: {albumId: string}) => ({
          category: {_type: 'reference', _ref: albumId},
        }),
      },
    ],
  },

  document: {
    actions: (actions, {schemaType}) =>
      schemaType === 'siteSettings'
        ? actions.filter(({action}) => action !== 'delete' && action !== 'duplicate')
        : actions,
    // Only the plain "Photo" / "Album" choices in the global + menu; the
    // album template is reached from inside an album.
    newDocumentOptions: (prev) => prev.filter((item) => item.templateId !== 'photo-in-album'),
  },
})
