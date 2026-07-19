import {defineType} from 'sanity'
import {supportedLanguages} from '../supportedLanguages'

const localeFieldsets = [
  {
    title: 'Translations',
    name: 'translations',
    options: {collapsible: true, collapsed: false},
  },
]

// Non-default languages are grouped in a collapsible fieldset so the
// editor always sees the English field first.
const makeFields = (type: 'string' | 'text') =>
  supportedLanguages.map((lang) => ({
    name: lang.id,
    title: lang.title,
    type,
    ...(type === 'text' ? {rows: 4} : {}),
    ...('isDefault' in lang && lang.isDefault ? {} : {fieldset: 'translations'}),
  }))

export const localeString = defineType({
  name: 'localeString',
  title: 'Localized string',
  type: 'object',
  fieldsets: localeFieldsets,
  fields: makeFields('string'),
})

export const localeText = defineType({
  name: 'localeText',
  title: 'Localized text',
  type: 'object',
  fieldsets: localeFieldsets,
  fields: makeFields('text'),
})
