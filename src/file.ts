/* eslint-disable @typescript-eslint/no-unsafe-return */

import scoreinfo from './scoreinfo'

const FILE_URL_MODULE_ID = 'iNJA'

type FileType = 'img' | 'mp3' | 'midi'

const getApiUrl = (id: number, type: FileType, index: number): string => {
  // proxy
  return `https://musescore.now.sh/api/jmuse?id=${id}&type=${type}&index=${index}`
}

interface Module {
  (module, exports, __webpack_require__): void;
}

/**
 * Retrieve (webpack_require) a module from the page's webpack package
 * 
 * I know this is super hacky.
 */
const webpackHook = (moduleId: string, moduleOverrides: { [id: string]: Module } = {}, globalWebpackJson = window['webpackJsonpmusescore']) => {
  const moduleLookup = (id: string) => {
    const pack = globalWebpackJson.find(x => x[1][id])
    return pack[1][id]
  }

  const t = Object.assign((id: string, override = true) => {
    const r: any = {}
    const m: Module = (override && moduleOverrides[id])
      ? moduleOverrides[id]
      : moduleLookup(id)
    m(r, r, t)
    if (r.exports) return r.exports
    return r
  }, {
    d (exp, name, fn) {
      return Object.prototype.hasOwnProperty.call(exp, name) ||
        Object.defineProperty(exp, name, { enumerable: true, get: fn })
    },
    n (e) {
      return e.__esModule ? () => e.default : () => e
    },
    r (r) {
      Object.defineProperty(r, '__esModule', { value: true })
    },
    e () {
      return Promise.resolve()
    },
  })

  return t(moduleId)
}

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

  const fn: (id: number, index: number, cb: (url: string) => any) => string = fileUrlModule.default

  return new Promise((resolve) => {
    return fn(scoreinfo.id, index, resolve)
  })
}
