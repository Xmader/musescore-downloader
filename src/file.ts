/* eslint-disable no-extend-native */

import scoreinfo from './scoreinfo'
import { onPackLoad, webpackContext } from './webpack-hook'

type FileType = 'img' | 'mp3' | 'midi'

const AUTH_REG = /,(function\(\)\{var \w=Array.prototype.slice.*?)\)\[/
enum PACK_ID {
  img = 'F/w+',
  midi = 'yihj',
  mp3 = '2oYV',
}

/**
 * I know this is super hacky.
 */
const magicHookConstr = (type: FileType) => {
  // request pack
  // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-return
  void webpackContext.then((ctx) => ctx.e(PACK_ID[type]))

  return new Promise<string>((resolve) => {
    onPackLoad((pack) => {
      if (pack[0].includes(PACK_ID[type])) {
        Object.values(pack[1]).forEach((mod) => {
          const m = mod.toString().match(AUTH_REG)
          if (m) {
            const code = m[1]
            try {
              // eslint-disable-next-line no-new-func, @typescript-eslint/no-implied-eval
              const magic = Function(`return (${code})`)()
              resolve(magic)
            } catch (err) {
              console.error(err)
            }
          }
        })
      }
    })
  })
}

const magics: Record<FileType, Promise<string>> = {
  img: magicHookConstr('img'),
  midi: magicHookConstr('midi'),
  mp3: magicHookConstr('mp3'),
}

const getApiUrl = (type: FileType, index: number): string => {
  return `/api/jmuse?id=${scoreinfo.id}&type=${type}&index=${index}&v2=1`
}

const getApiAuth = async (type: FileType, index: number): Promise<string> => {
  // eslint-disable-next-line no-void
  void index
  return magics[type]
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
