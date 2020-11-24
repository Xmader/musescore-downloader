
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
    return this.title.replace(/[\s<>:{}"/\\|?*~.\0\cA-\cZ]+/g, '_')
  }

  get msczIpfsRef (): string {
    return `/ipns/${this.IPNS_KEY}/${this.idLastDigit}/${this.id}.mscz`
  }

  get msczCidUrl (): string {
    return `https://ipfs.infura.io:5001/api/v0/block/stat?arg=${this.msczIpfsRef}`
  }

  getMsczUrl (cidRes: { Key: string; Message: string }): string {
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
    return `https://ipfs.infura.io/ipfs/${cid}`
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
