import './meta'

import { waitForDocumentLoaded, saveAs } from './utils'
import { downloadPDF } from './pdf'
import { fetchMscz, downloadMscz } from './mscz'
import * as recaptcha from './recaptcha'
import scoreinfo from './scoreinfo'

const PROCESSING_TEXT = 'Processing…'
const FAILED_TEXT = '❌Download Failed!'
const WEBMSCORE_URL = 'https://cdn.jsdelivr.net/npm/webmscore@0.5/webmscore.js'

const main = (): void => {
  // @ts-ignore
  if (!window.UGAPP || !window.UGAPP.store || !window.UGAPP.store.jmuse_settings) { return }

  // init recaptcha
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  recaptcha.init()

  const btnsDiv = document.querySelector('.score-right .buttons-wrapper') || document.querySelectorAll('aside section > div')[4]
  const downloadBtn = btnsDiv.querySelector('button, .button') as HTMLElement
  downloadBtn.onclick = null

  // fix the icon of the download btn
  // if the `downloadBtn` seleted was a `Print` btn, replace the `print` icon with the `download` icon
  const svgPath: SVGPathElement | null = downloadBtn.querySelector('svg > path')
  if (svgPath) {
    svgPath.setAttribute('d', 'M9.6 2.4h4.8V12h2.784l-5.18 5.18L6.823 12H9.6V2.4zM19.2 19.2H4.8v2.4h14.4v-2.4z')
  }

  const downloadURLs = {
    MSCZ: null,
    PDF: null,
    MusicXML: scoreinfo.mxlUrl,
    MIDI: scoreinfo.midiUrl,
    MP3: scoreinfo.mp3Url,
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
      const txt = x.textContent as string
      return txt.includes('Download') || txt.includes('Print')
    }) as Node
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
        textNode.textContent = PROCESSING_TEXT

        try {
          await downloadPDF()
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
          await downloadMscz()
          textNode.textContent = 'Download MSCZ'
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

        const w = window.open('') as Window
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
          new Uint8Array(await fetchMscz()) // copy its ArrayBuffer
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
          const checked = fieldset.querySelector('input:checked') as HTMLInputElement
          const id = checked.value

          await score.setExcerptId(id)

          const filename = scoreinfo.fileName
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
