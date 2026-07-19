// Single source of truth for content languages in the Studio.
// To add Traditional Chinese later, add: {id: 'zhHant', title: '中文（繁體）'}
// and mirror it in the site repo (src/i18n/locales.ts).
export const supportedLanguages = [
  {id: 'en', title: 'English', isDefault: true},
  {id: 'ja', title: '日本語'},
  {id: 'zh', title: '中文（简体）'},
] as const

export const defaultLanguage = supportedLanguages.find((l) => 'isDefault' in l && l.isDefault)!
