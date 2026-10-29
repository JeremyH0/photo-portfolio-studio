import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {defineField, defineType} from 'sanity'
import {TakenAtInput} from './components/TakenAtInput'

export const photo = defineType({
  name: 'photo',
  title: 'Photo',
  type: 'document',
  orderings: [
    orderRankOrdering,
    {title: 'Date taken, newest first', name: 'takenDesc', by: [{field: 'takenAt', direction: 'desc'}]},
    {title: 'Date taken, oldest first', name: 'takenAsc', by: [{field: 'takenAt', direction: 'asc'}]},
    {title: 'Recently added', name: 'addedDesc', by: [{field: '_createdAt', direction: 'desc'}]},
  ],
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      // exif: keeps the camera info (date taken) that TakenAtInput reads.
      // No 'location' — GPS stays out of the dataset.
      options: {hotspot: true, metadata: ['blurhash', 'lqip', 'palette', 'exif']},
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
      title: 'Album',
      type: 'reference',
      to: [{type: 'category'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'takenAt',
      title: 'Date taken',
      type: 'date',
      description: 'Filled in automatically from the camera when the photo has that info. You can change it.',
      options: {dateFormat: 'D MMMM YYYY'},
      components: {input: TakenAtInput},
    }),
    orderRankField({type: 'photo'}),
  ],
  preview: {
    select: {title: 'title.en', album: 'category.title.en', takenAt: 'takenAt', media: 'image'},
    prepare: ({title, album, takenAt, media}) => ({
      title,
      subtitle: [album, takenAt?.slice(0, 4)].filter(Boolean).join(' · '),
      media,
    }),
  },
})
