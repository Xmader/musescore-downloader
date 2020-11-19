/* eslint-disable no-extend-native */

import scoreinfo from './scoreinfo'
import { onPackLoad, loadAllPacks, getObfuscationCtx, OBFUSCATED_REG } from './webpack-hook'

type FileType = 'img' | 'mp3' | 'midi'

const AUTH_REG = `(\\+?${OBFUSCATED_REG.source}?)+`
const AUTH_CTX_REG = `,(${AUTH_REG})\\)(\\[|\\.then)`

enum PACK_HINT {
  img = 'getImageRef',
  midi = 'midi:',
  mp3 = 'setVolume:',
}

/**
 * I know this is super hacky.
 */
const magicHookConstr = async (type: FileType) => {
  // request pack
  await loadAllPacks()

  return new Promise<string>((resolve) => {
    onPackLoad((pack) => {
      Object.values(pack[1]).forEach((mod) => {
        const str = mod.toString()
        if (!str.includes(PACK_HINT[type])) {
          return
        }

        const m = str.match(AUTH_CTX_REG)
        if (m) {
          try {
            const deObf = getObfuscationCtx(mod)
            const authExp = m[1]

            const reg = new RegExp(OBFUSCATED_REG)
            let magic = ''
            let r: RegExpMatchArray | null
            while ((r = reg.exec(authExp)) !== null) {
              magic += deObf(+r[2], r[3])
            }

            resolve(magic)
          } catch (err) {
            console.error(err)
          }
        }
      })
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
