import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {defineField, defineType} from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  orderings: [orderRankOrdering],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localeString',
      validation: (rule) =>
        rule.custom((value?: {en?: string}) => (value?.en ? true : 'English title is required')),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Used in the website URL — generate it from the English title.',
      options: {source: 'title.en'},
      validation: (rule) => rule.required(),
    }),
    orderRankField({type: 'category'}),
  ],
  preview: {
    select: {title: 'title.en'},
  },
})
