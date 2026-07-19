import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {defineField, defineType} from 'sanity'

export const photo = defineType({
  name: 'photo',
  title: 'Photo',
  type: 'document',
  orderings: [orderRankOrdering],
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localeString',
      validation: (rule) =>
        rule.custom((value?: {en?: string}) => (value?.en ? true : 'English title is required')),
    }),
    defineField({
      name: 'caption',
      title: 'Caption (optional)',
      type: 'localeText',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}],
      validation: (rule) => rule.required(),
    }),
    orderRankField({type: 'photo'}),
  ],
  preview: {
    select: {title: 'title.en', subtitle: 'category.title.en', media: 'image'},
  },
})
