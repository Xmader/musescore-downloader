/* eslint-disable no-extend-native */

import scoreinfo from './scoreinfo'
import { webpackHook, webpackGlobalOverride, ALL } from './webpack-hook'

let AUTH_MODULE_ID: string
const AUTH_FN = '+3],22,-1044525330)'
const MAGIC_ARG_INDEX = 1

type FileType = 'img' | 'mp3' | 'midi'

/**
 * I know this is super hacky.
 */
let magic: Promise<string> | string = new Promise((resolve) => {
  // todo: hook module by what it does, not what it is called
  webpackGlobalOverride(ALL, (n, r, t) => { // override
    const fn = n.exports
    if (typeof fn === 'function' && fn.toString().includes(AUTH_FN)) {
      AUTH_MODULE_ID = n.i
      n.exports = (...args) => {
        if (magic instanceof Promise) {
          magic = args[MAGIC_ARG_INDEX]
          resolve(magic)
        }
        return fn(...args) as string
      }
    }
  })
})

const getApiUrl = (type: FileType, index: number): string => {
  return `/api/jmuse?id=${scoreinfo.id}&type=${type}&index=${index}`
}

const getApiAuth = async (type: FileType, index: number): Promise<string> => {
  if (magic instanceof Promise) {
    // force to retrieve the MAGIC
    const el = document.querySelectorAll('.SD7H- > button')[3] as HTMLButtonElement
    el.click()
    magic = await magic
  }

  const str = String(scoreinfo.id) + type + String(index)

  const fn: (str: string, magic: string) => string = webpackHook(AUTH_MODULE_ID)

  return fn(str, magic)
}

export const getFileUrl = async (type: FileType, index = 0): Promise<string> => {
  const url = getApiUrl(type, index)
  const auth = await getApiAuth(type, index)

  const r = await fetch(url, {
    headers: {
      Authorization: auth,
    },
  })

  const { info } = await r.json()
  return info.url as string
}
