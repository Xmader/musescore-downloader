
import isNodeJs from 'detect-node'

import en from './en'
import es from './es'
import it from './it'
import zh from './zh'

export interface LOCALE {
  'PROCESSING' (): string;
  'BTN_ERROR' (): string;

  'DEPRECATION_NOTICE' (btnName: string): string;

  'DOWNLOAD' (fileType: string): string;
  'DOWNLOAD_AUDIO' (fileType: string): string;

  'IND_PARTS' (): string;
  'IND_PARTS_TOOLTIP' (): string;

  'VIEW_IN_LIBRESCORE' (): string;

  'FULL_SCORE' (): string;
}

const locales = (<L extends { [n: string]: LOCALE } /** type checking */> (l: L) => Object.freeze(l))({
  en,
  es,
  it,
  zh,
})

// detect browser language
const lang = (() => {
  let userLangs: readonly string[]
  if (!isNodeJs) {
    userLangs = navigator.languages
  } else {
    const env = process.env
    const l = env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE || ''
    userLangs = [l.slice(0, 2)]
  }

  const names = Object.keys(locales)
  const _lang = userLangs.find(l => {
    // find the first occurrence of valid languages
    return names.includes(l)
  })
  return _lang || 'en'
})()

export type STR_KEYS = keyof LOCALE
export type ALL_LOCALES = typeof locales
export type LANGS = keyof ALL_LOCALES

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function i18n<K extends STR_KEYS, L extends LANGS = 'en'> (key: K) {
  const locale = locales[lang] as ALL_LOCALES[L]
  return locale[key]
}
