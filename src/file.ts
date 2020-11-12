/* eslint-disable no-extend-native */

import scoreinfo from './scoreinfo'
import { webpackHook, webpackGlobalOverride } from './webpack-hook'

const FILE_URL_MODULE_ID = 'iNJA'
const AUTH_MODULE_ID = 'F08J'
const MAGIC_ARG_INDEX = 3

type FileType = 'img' | 'mp3' | 'midi'

/**
 * I know this is super hacky.
 */
let magic: Promise<string> | string = new Promise((resolve) => {
  // todo: hook module by what it does, not what it is called
  webpackGlobalOverride(AUTH_MODULE_ID, (_, r, t) => { // override
    const fn = r.a
    t.d(r, 'a', () => {
      return (...args) => {
        if (magic instanceof Promise) {
          magic = args[MAGIC_ARG_INDEX]
          resolve(magic)
        }
        return fn(...args) as string
      }
    })
  })
})

export const getFileUrl = async (type: FileType, index = 0): Promise<string> => {
  const fileUrlModule = webpackHook(FILE_URL_MODULE_ID, {
    '6Ulw' (_, r, t) { // override
      t.d(r, 'a', () => {
        return type
      })
    },
  })

  const fn: (id: number, index: number, cb: (url: string) => any, magic: string) => string = fileUrlModule.a

  if (magic instanceof Promise) {
    // force to retrieve the MAGIC
    const el = document.querySelectorAll('.SD7H- > button')[3] as HTMLButtonElement
    el.click()
    magic = await magic
  }

  return new Promise((resolve) => {
    return fn(scoreinfo.id, index, resolve, magic as string)
  })
}
