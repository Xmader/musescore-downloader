import './meta'

import { ScorePlayerData } from './types'
import { waitForDocumentLoaded } from './utils'
import * as recaptcha from './recaptcha'

import { PDFWorkerHelper } from './worker-helper'
import FileSaver from 'file-saver/dist/FileSaver.js'

const saveAs: typeof import('file-saver').saveAs = FileSaver.saveAs

const PROCESSING_TEXT = 'Processing…'
const FAILED_TEXT = '❌Download Failed!'
const WEBMSCORE_URL = 'https://cdn.jsdelivr.net/npm/webmscore@0.5/webmscore.js'

let pdfBlob: Blob
let msczBufferP: Promise<ArrayBuffer> | undefined

const generatePDF = async (imgURLs: string[], imgType: 'svg' | 'png', name?: string): Promise<void> => {
  if (pdfBlob) {
    return saveAs(pdfBlob, `${name}.pdf`)
  }

  const cachedImg: HTMLImageElement = document.querySelector('img[src*=score_]')
  const { naturalWidth: width, naturalHeight: height } = cachedImg

  const worker = new PDFWorkerHelper()
  const pdfArrayBuffer = await worker.generatePDF(imgURLs, imgType, width, height)
  worker.terminate()

  pdfBlob = new Blob([pdfArrayBuffer])

  saveAs(pdfBlob, `${name}.pdf`)
}

const getPagesNumber = (scorePlayerData: ScorePlayerData): number => {
  try {
    return scorePlayerData.json.metadata.pages
  } catch (_) {
    return document.querySelectorAll('img[src*=score_]').length
  }
}

const getImgType = (): 'svg' | 'png' => {
  try {
    const imgE: HTMLImageElement = document.querySelector('img[src*=score_]')
    const { pathname } = new URL(imgE.src)
    const imgtype = pathname.match(/\.(\w+)$/)[1]
    return imgtype as 'svg' | 'png'
  } catch (_) {
    return null
  }
}

const getTitle = (scorePlayerData: ScorePlayerData): string => {
  try {
    return scorePlayerData.json.metadata.title
  } catch (_) {
    return ''
  }
}

const getScoreFileName = (scorePlayerData: ScorePlayerData): string => {
  return getTitle(scorePlayerData).replace(/[\s<>:{}"/\\|?*~.\0\cA-\cZ]+/g, '_')
}

const fetchMscz = async (url: string): Promise<ArrayBuffer> => {
  if (!msczBufferP) {
    msczBufferP = (async (): Promise<ArrayBuffer> => {
      const token = await recaptcha.execute()
      const r = await fetch(url + token)
      const data = await r.arrayBuffer()
      return data
    })()
  }

  return msczBufferP
}

const main = (): void => {
  // @ts-ignore
  if (!window.UGAPP || !window.UGAPP.store || !window.UGAPP.store.jmuse_settings) { return }

  // init recaptcha
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  recaptcha.init()

  // @ts-ignore
  const scorePlayer: ScorePlayerData = window.UGAPP.store.jmuse_settings.score_player

  const { id } = scorePlayer.json
  const baseURL = scorePlayer.urls.image_path

  const filename = getScoreFileName(scorePlayer)

  // https://github.com/Xmader/cloudflare-worker-musescore-mscz
  const msczURL = `https://musescore.now.sh/api/mscz?id=${id}&token=`

  const mxlURL = baseURL + 'score.mxl'
  const { midi: midiURL, mp3: mp3URL } = scorePlayer.urls

  const btnsDiv = document.querySelector('.score-right .buttons-wrapper') || document.querySelectorAll('aside section > div')[4]
  const downloadBtn = btnsDiv.querySelector('button, .button') as HTMLElement
  downloadBtn.onclick = null

  // fix the icon of the download btn
  // if the `downloadBtn` seleted was a `Print` btn, replace the `print` icon with the `download` icon
  const svgPath: SVGPathElement = downloadBtn.querySelector('svg > path')
  if (svgPath) {
    svgPath.setAttribute('d', 'M9.6 2.4h4.8V12h2.784l-5.18 5.18L6.823 12H9.6V2.4zM19.2 19.2H4.8v2.4h14.4v-2.4z')
  }

  const imgType = getImgType() || 'svg'

  const sheetImgURLs = Array.from({ length: getPagesNumber(scorePlayer) }).fill(null).map((_, i) => {
    return baseURL + `score_${i}.${imgType}`
  })

  const downloadURLs = {
    MSCZ: null,
    PDF: null,
    MusicXML: mxlURL,
    MIDI: midiURL,
    MP3: mp3URL,
    Parts: null,
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const createBtn = (name: string) => {
    const btn: HTMLButtonElement = downloadBtn.cloneNode(true) as any

    if (btn.nodeName.toLowerCase() === 'button') {
      btn.setAttribute('style', 'width: 205px !important')
    } else {
      btn.dataset.target = ''
    }

    const textNode = [...btn.childNodes].find((x) => {
      return x.textContent.includes('Download') || x.textContent.includes('Print')
    })
    textNode.textContent = `Download ${name}`

    return {
      btn,
      textNode,
    }
  }

  const newDownloadBtns = Object.keys(downloadURLs).map((name) => {
    const url = downloadURLs[name]
    const { btn, textNode } = createBtn(name)

    if (name === 'PDF') {
      btn.onclick = async (): Promise<void> => {
        const filename = getScoreFileName(scorePlayer)

        textNode.textContent = PROCESSING_TEXT

        try {
          await generatePDF(sheetImgURLs, imgType, filename)
          textNode.textContent = 'Download PDF'
        } catch (err) {
          textNode.textContent = FAILED_TEXT
          console.error(err)
        }
      }
    } else if (name === 'MSCZ') {
      btn.onclick = async (): Promise<void> => {
        textNode.textContent = PROCESSING_TEXT

        try {
          const data = new Blob([await fetchMscz(msczURL)])
          textNode.textContent = 'Download MSCZ'
          saveAs(data, `${filename}.mscz`)
        } catch (err) {
          textNode.textContent = FAILED_TEXT
          console.error(err)
        }
      }
    } else if (name === 'Parts') { // download individual parts
      btn.title = 'Download individual parts (BETA)'
      const cb = btn.onclick = async (): Promise<void> => {
        btn.onclick = null
        textNode.textContent = PROCESSING_TEXT

        const w = window.open('')
        const txt = document.createTextNode(PROCESSING_TEXT)
        w.document.body.append(txt)

        // set page hooks
        // eslint-disable-next-line prefer-const
        let score: any
        const destroy = (): void => {
          score.destroy()
          w.close()
        }
        window.addEventListener('unload', destroy)
        w.addEventListener('beforeunload', () => {
          score.destroy()
          window.removeEventListener('unload', destroy)
          textNode.textContent = 'Download Parts'
          btn.onclick = cb
        })

        // load webmscore (https://github.com/LibreScore/webmscore)
        const script = w.document.createElement('script')
        script.src = WEBMSCORE_URL
        w.document.body.append(script)
        await new Promise(resolve => { script.onload = resolve })

        // parse mscz data
        const data = new Uint8Array(
          new Uint8Array(await fetchMscz(msczURL)) // copy its ArrayBuffer
        )
        score = await w['WebMscore'].load('mscz', data)
        await score.generateExcerpts()
        const metadata = await score.metadata()
        console.log('score metadata loaded by webmscore', metadata)

        // render the part selection page
        txt.remove()
        const fieldset = w.document.createElement('fieldset')
        for (const excerpt of metadata.excerpts) {
          const e = w.document.createElement('input')
          e.name = 'score-part'
          e.type = 'radio'
          e.value = excerpt.id
          const label = w.document.createElement('label')
          label.innerText = excerpt.title
          const br = w.document.createElement('br')
          fieldset.append(e, label, br)
        }
        const submitBtn = w.document.createElement('input')
        submitBtn.type = 'submit'
        submitBtn.value = 'Download PDF'
        fieldset.append(submitBtn)
        w.document.body.append(fieldset)

        submitBtn.onclick = async (): Promise<void> => {
          const checked: HTMLInputElement = fieldset.querySelector('input:checked')
          const id = checked.value

          await score.setExcerptId(id)

          const data = new Blob([await score.savePdf()])
          saveAs(data, `${filename}-part-${id}.pdf`)
        }
      }
    } else {
      btn.onclick = (): void => {
        window.open(url)
      }
    }

    return btn
  })

  downloadBtn.replaceWith(...newDownloadBtns)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
waitForDocumentLoaded().then(main)
