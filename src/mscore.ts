
import { fetchMscz } from './mscz'

const WEBMSCORE_URL = 'https://cdn.jsdelivr.net/npm/webmscore@0.10/webmscore.js'

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

export const loadMscore = async (w: Window): Promise<WebMscore> => {
  await initMscore(w)

  const WebMscore: typeof import('webmscore').default = w['WebMscore']
  // parse mscz data
  const data = new Uint8Array(
    new Uint8Array(await fetchMscz()), // copy its ArrayBuffer
  )
  const score = await WebMscore.load('mscz', data)
  await score.generateExcerpts()

  return score
}
