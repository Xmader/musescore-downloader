/* eslint-disable no-extend-native */

import scoreinfo from './scoreinfo'
import { webpackHook } from './webpack-hook'

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
  // reserve for future hook update
  const target = String.prototype
  const method = 'charCodeAt'
  const _fn = target[method]

  // This script can run before anything on the page,  
  // so setting this function to be non-configurable and non-writable is no use.
  const hookFn = function (i: number) {
    const m = this.match(MAGIC_REG)
    if (m) {
      resolve(m[2])
      magic = m[2]
      target[method] = _fn // detach
    }
    return _fn.call(this, i) as number
  }
  target[method] = hookFn

  // make hooked methods "native"
  const _toString = Function.prototype['toString']
  Function.prototype.toString = function s () {
    if (this === hookFn || this === s) {
      // "function () {\n    [native code]\n}"
      return _toString.call(parseInt) as string
    }
    return _toString.call(this) as string
  }
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
