import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'

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
            orderableDocumentListDeskItem({
              type: 'photo',
              title: 'Photos',
              S,
              context,
            }),
            S.documentTypeListItem('category').title('Categories'),
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    // The singleton is edited via the pinned entry above, never created ad hoc.
    templates: (templates) => templates.filter((t) => t.schemaType !== 'siteSettings'),
  },

  document: {
    actions: (actions, {schemaType}) =>
      schemaType === 'siteSettings'
        ? actions.filter(({action}) => action !== 'delete' && action !== 'duplicate')
        : actions,
  },
})
