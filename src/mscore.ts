
import { fetchMscz } from './mscz'
import { fetchData } from './utils'

const WEBMSCORE_URL = 'https://cdn.jsdelivr.net/npm/webmscore@0.10/webmscore.js'

// fonts for Chinese characters (CN) and Korean hangul (KR)
// JP characters are included in the CN font
const FONT_URLS = ['CN', 'KR'].map(l => `https://cdn.jsdelivr.net/npm/@librescore/fonts/SourceHanSans${l}-Regular.woff2`)

export type WebMscore = import('webmscore').default

const initMscore = async (w: Window) => {
  if (!w['WebMscore']) {
    // init webmscore (https://github.com/LibreScore/webmscore)
    const script = w.document.createElement('script')
    script.src = WEBMSCORE_URL
    w.document.body.append(script)
    await new Promise(resolve => { script.onload = resolve })
  }
}

let fonts: Promise<Uint8Array[]> | undefined
const initFonts = () => {
  // load CJK fonts
  // CJK (East Asian) characters will be rendered as "tofu" if there is no font
  if (!fonts) {
    fonts = Promise.all(
      FONT_URLS.map(url => fetchData(url)),
    )
  }
}

export const loadMscore = async (w: Window): Promise<WebMscore> => {
  initFonts()
  await initMscore(w)

  const WebMscore: typeof import('webmscore').default = w['WebMscore']
  // parse mscz data
  const data = new Uint8Array(
    new Uint8Array(await fetchMscz()), // copy its ArrayBuffer
  )
  const score = await WebMscore.load('mscz', data, await fonts)
  await score.generateExcerpts()

  return score
}
