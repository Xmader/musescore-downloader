
import { getFetch, escapeFilename } from './utils'

export abstract class ScoreInfo {
  private readonly IPNS_KEY = 'QmSdXtvzC8v8iTTZuj5cVmiugnzbR1QATYRcGix4bBsioP';
  private readonly RADIX = 20;

  abstract id: number;
  abstract title: string;

  public store = new Map<symbol, any>();

  get idLastDigit (): number {
    return (+this.id) % this.RADIX
  }

  get fileName (): string {
    return escapeFilename(this.title)
  }

  get msczIpfsRef (): string {
    return `/ipns/${this.IPNS_KEY}/${this.idLastDigit}/${this.id}.mscz`
  }

  get msczCidUrl (): string {
    return `https://ipfs.infura.io:5001/api/v0/block/stat?arg=${this.msczIpfsRef}`
  }

  public msczUrl: string;
  public loadMsczUrl (cidRes: { Key: string; Message: string }): string {
    const cid = cidRes.Key
    if (!cid) {
      // read further error msg
      const err = cidRes.Message
      if (err.includes('no link named')) { // file not found
        throw new Error('score not in dataset')
      } else {
        throw new Error(err)
      }
    }
    this.msczUrl = `https://ipfs.infura.io/ipfs/${cid}`
    return this.msczUrl
  }
}

export class ScoreInfoObj extends ScoreInfo {
  constructor (public id: number, public title: string) { super() }
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
}

export class ScoreInfoHtml extends ScoreInfo {
  private readonly ID_REG = /<meta property="al:ios:url" content="musescore:\/\/score\/(\d+)">/
  private readonly TITLE_REG = /<meta property="og:title" content="(.*)">/

  constructor (private html: string) { super() }

  get id (): number {
    const m = this.html.match(this.ID_REG)
    if (!m) return 0
    return +m[1]
  }

  get title (): string {
    const m = this.html.match(this.TITLE_REG)
    if (!m) return ''
    return m[1]
  }

  static async request (url: string, _fetch = getFetch()): Promise<ScoreInfoHtml> {
    const r = await _fetch(url)
    if (!r.ok) return new ScoreInfoHtml('')

    const html = await r.text()
    return new ScoreInfoHtml(html)
  }
}

export abstract class SheetInfo {
  abstract pageCount: number;
  abstract thumbnailUrl: string;

  get imgType (): 'svg' | 'png' {
    const thumbnail = this.thumbnailUrl
    const imgtype = thumbnail.match(/\.(\w+)$/)![1]
    return imgtype as 'svg' | 'png'
  }
}

export class SheetInfoInPage extends SheetInfo {
  constructor (private document: Document) { super() }

  get pageCount (): number {
    return this.document.querySelectorAll('.gXB83').length
  }

  get thumbnailUrl (): string {
    // url to the image of the first page
    const el = this.document.querySelector('link[as=image]') as HTMLLinkElement
    const url = el.href
    return url.split('@')[0]
  }
}
