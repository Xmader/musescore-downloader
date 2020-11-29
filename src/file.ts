/* eslint-disable no-extend-native */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { console } from './utils'

type FileType = 'img' | 'mp3' | 'midi'

/**
 * I know this is super hacky.
 */
const magicHookConstr = (() => {
  const l = {}

  return async (type: FileType) => {
    return new Promise<string>((resolve) => {
      l[type] = (token) => {
        resolve(token)
        magics[type] = token
      }
    })
  }
})()

const magics: Record<FileType, Promise<string>> = {
  img: magicHookConstr('img'),
  midi: magicHookConstr('midi'),
  mp3: magicHookConstr('mp3'),
}

const getApiUrl = (id: number, type: FileType, index: number): string => {
  return `/api/jmuse?id=${id}&type=${type}&index=${index}&v2=1`
}

const getApiAuth = async (type: FileType, index: number): Promise<string> => {
  // eslint-disable-next-line no-void
  void index

  const magic = magics[type]
  if (magic instanceof Promise) {
    // force to retrieve the MAGIC
    switch (type) {
      case 'midi': {
        const el = document.querySelectorAll('.SD7H- > button')[3] as HTMLButtonElement
        el.click()
        break
      }
      case 'mp3': {
        const el = document.querySelector('#playerBtnExprt') as HTMLButtonElement
        el.click()
        break
      }
      case 'img': {
        const imgE = document.querySelector('img[src*=score_]')
        const nextE = imgE?.parentElement?.nextElementSibling
        if (nextE) nextE.scrollIntoView()
        break
      }
    }
  }

  return magic
}

export const getFileUrl = async (id: number, type: FileType, index = 0): Promise<string> => {
  const url = getApiUrl(id, type, index)
  const auth = await getApiAuth(type, index)

  const r = await fetch(url, {
    headers: {
      Authorization: auth,
    },
  })

  const { info } = await r.json()
  return info.url as string
}
