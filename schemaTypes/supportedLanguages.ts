// Single source of truth for content languages in the Studio.
// Mirrored in the site repo (src/i18n/locales.ts).
export const supportedLanguages = [
  {id: 'en', title: 'English', isDefault: true},
  {id: 'ja', title: '日本語'},
  {id: 'zh', title: '中文（简体）'},
  {id: 'zhHant', title: '中文（繁體）'},
] as const

export const defaultLanguage = supportedLanguages.find((l) => 'isDefault' in l && l.isDefault)!
