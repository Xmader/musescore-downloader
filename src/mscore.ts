/* eslint-disable @typescript-eslint/no-var-requires */

import { fetchMscz } from './mscz'
import { fetchData } from './utils'
import { ScoreInfo } from './scoreinfo'
import isNodeJs from 'detect-node'

const WEBMSCORE_URL = 'https://cdn.jsdelivr.net/npm/webmscore@0.10/webmscore.js'

// fonts for Chinese characters (CN) and Korean hangul (KR)
// JP characters are included in the CN font
const FONT_URLS = ['CN', 'KR'].map(l => `https://cdn.jsdelivr.net/npm/@librescore/fonts/SourceHanSans${l}-Regular.woff2`)

const SF3_URL = 'https://cdn.jsdelivr.net/npm/@librescore/sf3/FluidR3Mono_GM.sf3'
const SOUND_FONT_LOADED = Symbol('SoundFont loaded')

export type WebMscore = import('webmscore').default
export type WebMscoreConstr = typeof import('webmscore').default

const initMscore = async (w: Window): Promise<WebMscoreConstr> => {
  if (!isNodeJs) { // attached to a page
    if (!w['WebMscore']) {
      // init webmscore (https://github.com/LibreScore/webmscore)
      const script = w.document.createElement('script')
      script.src = WEBMSCORE_URL
      w.document.body.append(script)
      await new Promise(resolve => { script.onload = resolve })
    }
    return w['WebMscore'] as WebMscoreConstr
  } else { // nodejs
    return require('webmscore').default as WebMscoreConstr
  }
}

let fonts: Promise<Uint8Array[]> | undefined
const initFonts = () => {
  // load CJK fonts
  // CJK (East Asian) characters will be rendered as "tofu" if there is no font
  if (!fonts) {
    if (isNodeJs) {
      // module.exports.CN = ..., module.exports.KR = ...
      const FONTS = Object.values(require('@librescore/fonts'))

      const fs = require('fs')
      fonts = Promise.all(
        FONTS.map((path: string) => fs.promises.readFile(path) as Promise<Buffer>),
      )
    } else {
      fonts = Promise.all(
        FONT_URLS.map(url => fetchData(url)),
      )
    }
  }
}

export const loadSoundFont = (score: WebMscore): Promise<void> => {
  if (!score[SOUND_FONT_LOADED]) {
    const loadPromise = (async () => {
      let data: Uint8Array
      if (isNodeJs) {
        // module.exports.FluidR3Mono = ...
        const SF3 = Object.values(require('@librescore/sf3'))[0]
        const fs = require('fs')
        data = await fs.promises.readFile(SF3)
      } else {
        data = await fetchData(SF3_URL)
      }

      await score.setSoundFont(
        data,
      )
    })()
    score[SOUND_FONT_LOADED] = loadPromise
  }
  return score[SOUND_FONT_LOADED] as Promise<void>
}

export const loadMscore = async (scoreinfo: ScoreInfo, w?: Window): Promise<WebMscore> => {
  initFonts()
  const WebMscore = await initMscore(w!)

  // parse mscz data
  const data = new Uint8Array(
    new Uint8Array(await fetchMscz(scoreinfo)), // copy its ArrayBuffer
  )
  const score = await WebMscore.load('mscz', data, await fonts)
  await score.generateExcerpts()

  return score
}
