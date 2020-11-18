/* eslint-disable no-extend-native */

import scoreinfo from './scoreinfo'
import { onPackLoad, webpackContext } from './webpack-hook'

type FileType = 'img' | 'mp3' | 'midi'

const AUTH_REG = /,((\d+\.\..+?)?function\(\)\{var \w=Array.prototype.slice.*?)\)(\[|\.then)/
const PACK_ID_REG = /\((\{.*?"\})\[\w\]\|\|\w\)/
const packIdPromise: Promise<Record<FileType, (string | number)>> = webpackContext.then((ctx) => {
  const ids = {
    img: '9',
    midi: '',
    mp3: '',
  }

  try {
    const fn = ctx.e.toString()
    const packsData = fn.match(PACK_ID_REG)[1] as string
    // eslint-disable-next-line no-new-func, @typescript-eslint/no-implied-eval
    const packs = Function(`return (${packsData})`)() as { [id: string]: string }

    Object.entries(packs).forEach(([id, name]) => {
      if (name.includes('audio') && !ids['mp3']) ids['mp3'] = id
      if (name.includes('piano_roll') && !ids['midi']) ids['midi'] = id
    })
  } catch (err) {
    console.error(err)
  }

  return ids
})

/**
 * I know this is super hacky.
 */
const magicHookConstr = async (type: FileType) => {
  const packId = await packIdPromise

  // request pack
  // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-return
  void webpackContext.then((ctx) => ctx.e(packId[type]))

  return new Promise<string>((resolve) => {
    onPackLoad((pack) => {
      if (pack[0].includes(packId[type]) || pack[0].includes(+packId[type])) {
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
