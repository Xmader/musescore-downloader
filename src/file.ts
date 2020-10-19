/* eslint-disable @typescript-eslint/no-unsafe-return */

import scoreinfo from './scoreinfo'

const AUTH_MODULE_ID = 'FNf8'

type FileType = 'img' | 'mp3' | 'midi'

const getApiUrl = (type: FileType, index: number): string => {
  // proxy
  return `https://musescore.now.sh/api/jmuse?id=${scoreinfo.id}&type=${type}&index=${index}`
}

/**
 * Retrieve (webpack_require) a module from the page's webpack package
 * 
 * I know this is super hacky.
 */
const webpackHook = (moduleId: string, globalWebpackJson = window['webpackJsonpmusescore']) => {
  const pack = globalWebpackJson.find(x => x[1][moduleId])

  const t = Object.assign((id: string) => {
    const r: any = {}
    pack[1][id](r, r, t)
    if (r.exports) return r.exports
    return r
  }, {
    d (exp, name, fn) {
      return Object.defineProperty(exp, name, { value: fn })
    },
    n (e) {
      return () => e
    },
  })

  return t(moduleId)
}

const getApiAuth = (type: FileType, index: number): string => {
  const authModule = webpackHook(AUTH_MODULE_ID)
  const fn: (id: number, type: string, index: number) => string = authModule.a()
  return fn(scoreinfo.id, type, index)
}

export const getFileUrl = async (type: FileType, index = 0): Promise<string> => {
  const url = getApiUrl(type, index)
  const auth = getApiAuth(type, index)

  const r = await fetch(url, {
    headers: {
      Authorization: auth,
    },
  })

  const { info } = await r.json()
  return info.url as string
}
