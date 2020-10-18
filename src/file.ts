
import scoreinfo from './scoreinfo'
import md5 from 'md5'

const MAGIC = String(4 * 11 * 1607 * 2767) // '195649036' // I don't know what this is
const AUTH_LEN = 4

type FileType = 'img' | 'mp3' | 'midi'

const getApiUrl = (type: FileType, index: number): string => {
  // proxy
  return `https://musescore.now.sh/api/jmuse?id=${scoreinfo.id}&type=${type}&index=${index}`
}

const getApiAuth = (type: FileType, index: number): string => {
  const str = String(scoreinfo.id) + type + String(index) + MAGIC
  return md5(str).slice(0, AUTH_LEN)
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
