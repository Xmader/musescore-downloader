
import scoreinfo from './scoreinfo'
import { webpackHook } from './webpack-hook'

const FILE_URL_MODULE_ID = 'iNJA'

type FileType = 'img' | 'mp3' | 'midi'

const getApiUrl = (id: number, type: FileType, index: number): string => {
  // proxy
  return `https://musescore.now.sh/api/jmuse?id=${id}&type=${type}&index=${index}`
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
