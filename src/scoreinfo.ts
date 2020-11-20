/* eslint-disable @typescript-eslint/no-unsafe-return */

import { console } from './utils'

// run at document-start
export const ugappJsStore: Record<string, any> | null = (() => {
  try {
    const l = document.body.children as HTMLCollectionOf<HTMLElement>
    const el = [...l].find(e => Object.keys(e.dataset).length > 0) as HTMLDivElement
    const json = Object.values(el.dataset)[0] as string
    return JSON.parse(json)
  } catch (err) {
    console.error(err)
    return null
  }
})()

const IPNS_KEY = 'QmSdXtvzC8v8iTTZuj5cVmiugnzbR1QATYRcGix4bBsioP'
const RADIX = 20

export const scoreinfo = {

  get playerdata (): any {
    // @ts-ignore
    return ugappJsStore.store.page.data.score
  },

  get id (this: typeof scoreinfo): number {
    try {
      return this.playerdata.id
    } catch {
      const el = document.querySelector("meta[property='al:ios:url']") as HTMLMetaElement
      const m = el.content.match(/(\d+)$/) as RegExpMatchArray
      return +m[1]
    }
  },

  get idLastDigit (this: typeof scoreinfo): number {
    return (+this.id) % RADIX
  },

  get title (this: typeof scoreinfo): string {
    try {
      return this.playerdata.title
    } catch {
      const el = document.querySelector("meta[property='og:title']") as HTMLMetaElement
      return el.content
    }
  },

  get fileName (this: typeof scoreinfo): string {
    return this.title.replace(/[\s<>:{}"/\\|?*~.\0\cA-\cZ]+/g, '_')
  },

  get pageCount (this: typeof scoreinfo): number {
    try {
      return this.playerdata.pages_count
    } catch {
      return document.querySelectorAll('.gXB83').length
    }
  },

  get baseUrl (this: typeof scoreinfo): string {
    let thumbnailUrl: string
    try {
      thumbnailUrl = this.playerdata.thumbnails.original
    } catch {
      const el = document.querySelector("meta[property='og:image']") as HTMLMetaElement
      thumbnailUrl = el.content
    }

    const { origin, pathname } = new URL(thumbnailUrl)
    // remove the last part
    return origin + pathname.split('/').slice(0, -1).join('/') + '/'
  },

  get msczIpfsRef (this: typeof scoreinfo): string {
    return `/ipns/${IPNS_KEY}/${this.idLastDigit}/${this.id}.mscz`
  },

  get msczCidUrl (this: typeof scoreinfo): string {
    return `https://ipfs.infura.io:5001/api/v0/block/stat?arg=${this.msczIpfsRef}`
  },

  get sheetImgType (): 'svg' | 'png' {
    try {
      const imgE = document.querySelector('img[src*=score_]') as HTMLImageElement
      const { pathname } = new URL(imgE.src)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const imgtype = pathname.match(/\.(\w+)$/)![1]
      return imgtype as 'svg' | 'png'
    } catch (_) {
      // return null
      return 'svg'
    }
  },
}

export default scoreinfo
