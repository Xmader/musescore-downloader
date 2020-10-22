
import scoreinfo from './scoreinfo'
import { webpackHook } from './webpack-hook'

const FILE_URL_MODULE_ID = 'iNJA'

type FileType = 'img' | 'mp3' | 'midi'

const getApiUrl = (id: number, type: FileType, index: number): string => {
  // proxy
  return `https://musescore.now.sh/api/jmuse?id=${id}&type=${type}&index=${index}`
}

/**
 * I know this is super hacky.
 */
let magic: Promise<string> | string = new Promise((resolve) => {
  const reg = '^\\d+(img|mp3|midi)\\d(\\w+)$'

  const _encode = encodeURIComponent

  window.encodeURIComponent = (s) => {
    const m = s.toString().match(reg)
    if (m) {
      // the auth string will be encoded using `encodeURIComponent` before `md5`,
      // so hook here
      resolve(m[2])
      magic = m[2]
      window.encodeURIComponent = _encode // detach
    }
    return _encode(s)
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

  const fn: (id: number, index: number, cb: (url: string) => any, magic: string) => string = fileUrlModule.default

  if (typeof magic !== 'string') {
    // force to retrieve the MAGIC
    const el = document.querySelectorAll('._13vRI')[6] as HTMLButtonElement
    el.click()
    magic = await magic
  }

  return new Promise((resolve) => {
    return fn(scoreinfo.id, index, resolve, magic as string)
  })
}
