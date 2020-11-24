/* eslint-disable @typescript-eslint/no-unsafe-return */

const IPNS_KEY = 'QmSdXtvzC8v8iTTZuj5cVmiugnzbR1QATYRcGix4bBsioP'
const RADIX = 20

export abstract class ScoreInfo {
  abstract id: number;
  abstract title: string;

  abstract pageCount: number;
  abstract thumbnailUrl: string;
  abstract sheetImgType: 'svg' | 'png'

  get idLastDigit (): number {
    return (+this.id) % RADIX
  }

  get fileName (): string {
    return this.title.replace(/[\s<>:{}"/\\|?*~.\0\cA-\cZ]+/g, '_')
  }

  get msczIpfsRef (): string {
    return `/ipns/${IPNS_KEY}/${this.idLastDigit}/${this.id}.mscz`
  }

  get msczCidUrl (): string {
    return `https://ipfs.infura.io:5001/api/v0/block/stat?arg=${this.msczIpfsRef}`
  }
}

export class ScoreInfoInPage extends ScoreInfo {
  constructor (private document: Document) { super() }

  get id (): number {
    const el = this.document.querySelector("meta[property='al:ios:url']") as HTMLMetaElement
    const m = el.content.match(/(\d+)$/) as RegExpMatchArray
    return +m[1]
  }

  get title (): string {
    const el = this.document.querySelector("meta[property='og:title']") as HTMLMetaElement
    return el.content
  }

  get pageCount (): number {
    return this.document.querySelectorAll('.gXB83').length
  }

  get thumbnailUrl (): string {
    // url to the image of the first page
    const el = this.document.querySelector("meta[property='og:image']") as HTMLMetaElement
    const url = el.content
    return url.split('@')[0]
  }

  get sheetImgType (): 'svg' | 'png' {
    try {
      const imgE = this.document.querySelector('img[src*=score_]') as HTMLImageElement
      const { pathname } = new URL(imgE.src)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const imgtype = pathname.match(/\.(\w+)$/)![1]
      return imgtype as 'svg' | 'png'
    } catch (_) {
      // return null
      return 'svg'
    }
  }
}

export const scoreinfo = new ScoreInfoInPage(document)

export default scoreinfo
