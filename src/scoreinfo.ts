
import { getFetch, escapeFilename, assertRes } from './utils'
import { getMainCid } from './mscz'

export abstract class ScoreInfo {
  private readonly RADIX = 20;
  private readonly INDEX_RADIX = 32;

  abstract id: number;
  abstract title: string;

  public store = new Map<symbol, any>();

  get idLastDigit (): number {
    return (+this.id) % this.RADIX
  }

  get fileName (): string {
    return escapeFilename(this.title)
  }

  public getMsczIpfsRef (mainCid: string): string {
    return `/ipfs/${mainCid}/${this.idLastDigit}/${this.id}.mscz`
  }

  public getMsczCidUrl (mainCid: string): string {
    return `https://ipfs.infura.io:5001/api/v0/block/stat?arg=${this.getMsczIpfsRef(mainCid)}`
  }

  public getScorepackRef (mainCid: string): string {
    return `/ipfs/${mainCid}/index/${(+this.id) % this.INDEX_RADIX}/${this.id}`
  }
}

export class ScoreInfoObj extends ScoreInfo {
  constructor (public id: number = 0, public title: string = '') { super() }
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

  get baseUrl (): string {
    const el = this.document.querySelector("meta[property='og:image']") as HTMLMetaElement
    const m = el.content.match(/^(.+\/)score_/) as RegExpMatchArray
    return m[1]
  }
}

export class ScoreInfoHtml extends ScoreInfo {
  private readonly ID_REG = /<meta property="al:ios:url" content="musescore:\/\/score\/(\d+)">/
  private readonly TITLE_REG = /<meta property="og:title" content="(.*)">/
  private readonly BASEURL_REG = /<meta property="og:image" content="(.+\/)score_.*">/

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

  get baseUrl (): string {
    const m = this.html.match(this.BASEURL_REG)
    if (!m) return ''
    return m[1]
  }

  get sheet (): SheetInfo {
    return new SheetInfoHtml(this.html)
  }

  static async request (url: string, _fetch = getFetch()): Promise<ScoreInfoHtml> {
    const r = await _fetch(url)
    if (!r.ok) return new ScoreInfoHtml('')

    const html = await r.text()
    return new ScoreInfoHtml(html)
  }
}

export type Dimensions = { width: number; height: number }

export abstract class SheetInfo {
  abstract pageCount: number;

  /** url to the image of the first page */
  abstract thumbnailUrl: string;

  abstract dimensions: Dimensions;

  get imgType (): 'svg' | 'png' {
    const thumbnail = this.thumbnailUrl
    const imgtype = thumbnail.match(/score_0\.(\w+)/)![1]
    return imgtype as 'svg' | 'png'
  }
}

export class SheetInfoInPage extends SheetInfo {
  constructor (private document: Document) { super() }

  private get sheet0Img (): HTMLImageElement | null {
    return this.document.querySelector('img[src*=score_]')
  }

  get pageCount (): number {
    const sheet0Div = this.sheet0Img?.parentElement
    if (!sheet0Div) {
      throw new Error('no sheet images found')
    }
    return this.document.getElementsByClassName(sheet0Div.className).length
  }

  get thumbnailUrl (): string {
    const el = this.document.querySelector<HTMLLinkElement>('link[as=image]')
    const url = (el?.href || this.sheet0Img?.src) as string
    return url.split('@')[0]
  }

  get dimensions (): Dimensions {
    const { naturalWidth: width, naturalHeight: height } = this.sheet0Img as HTMLImageElement
    return { width, height }
  }
}

export class SheetInfoHtml extends SheetInfo {
  private readonly PAGE_COUNT_REG = /pages(?:&quot;|"):(\d+),/
  private readonly THUMBNAIL_REG = /<link (?:.*) href="(.*)" rel="preload" as="image"/

  private readonly DIMENSIONS_REG = /dimensions(?:&quot;|"):(?:&quot;|")(\d+)x(\d+)(?:&quot;|"),/

  constructor (private html: string) { super() }

  get pageCount (): number {
    const m = this.html.match(this.PAGE_COUNT_REG)
    if (!m) return NaN
    return +m[1]
  }

  get thumbnailUrl (): string {
    const m = this.html.match(this.THUMBNAIL_REG)
    if (!m) return ''
    return m[1].split('@')[0]
  }

  get dimensions (): Dimensions {
    const m = this.html.match(this.DIMENSIONS_REG)
    if (!m) return { width: NaN, height: NaN }
    return { width: +m[1], height: +m[2] }
  }
}

export const getActualId = async (scoreinfo: ScoreInfoInPage | ScoreInfoHtml, _fetch = getFetch()): Promise<number> => {
  if (scoreinfo.id <= 1000000000000) {
    // actual id already
    return scoreinfo.id
  }

  const mainCid = await getMainCid(scoreinfo, _fetch)
  const ref = `${mainCid}/sid2id/${scoreinfo.id}`
  const url = `https://ipfs.infura.io:5001/api/v0/dag/get?arg=${ref}`

  const r0 = await _fetch(url)
  if (r0.status !== 500) {
    assertRes(r0)
  }
  const res: { Message: string } | number = await r0.json()
  if (typeof res !== 'number') {
    // read further error msg
    throw new Error(res.Message)
  }

  // assign the actual id back to scoreinfo
  Object.defineProperty(scoreinfo, 'id', {
    get () { return res },
  })

  return res
}
