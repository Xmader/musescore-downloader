/* eslint-disable no-extend-native */

import scoreinfo from './scoreinfo'
import { webpackHook } from './webpack-hook'
import { hookNative } from './anti-detection'

const FILE_URL_MODULE_ID = 'iNJA'
const MAGIC_REG = /^\d+(img|mp3|midi)\d(.+)$/

type FileType = 'img' | 'mp3' | 'midi'

const getApiUrl = (id: number, type: FileType, index: number): string => {
  // proxy
  return `https://musescore.now.sh/api/jmuse?id=${id}&type=${type}&index=${index}`
}

/**
 * I know this is super hacky.
 */
let magic: Promise<string> | string = new Promise((resolve) => {
  hookNative(String.prototype, 'charCodeAt', (_fn, detach) => {
    return function (i: number) {
      const m = this.match(MAGIC_REG)
      if (m) {
        resolve(m[2])
        magic = m[2]
        detach()
      }
      return _fn.call(this, i) as number
    }
  })
})

export const getFileUrl = async (type: FileType, index = 0): Promise<string> => {
  const fileUrlModule = webpackHook(FILE_URL_MODULE_ID, {
    '6Ulw' (_, r, t) { // override
      t.d(r, 'a', () => {
        return type
      })
    },
    'VSrV' (_, r, t) { // override
      t.d(r, 'b', () => {
        return getApiUrl
      })
    },
  })

  const fn: (id: number, index: number, cb: (url: string) => any, magic: string) => string = fileUrlModule.a

  if (typeof magic !== 'string') {
    // force to retrieve the MAGIC
    const el = document.querySelectorAll('.SD7H- > button')[3] as HTMLButtonElement
    el.click()
    magic = await magic
  }

  return new Promise((resolve) => {
    return fn(scoreinfo.id, index, resolve, magic as string)
  })
}
