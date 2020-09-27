import './meta'

import { waitForDocumentLoaded, saveAs } from './utils'
import { downloadPDF } from './pdf'
import { fetchMscz, downloadMscz } from './mscz'
import { getDownloadBtn, BtnList, BtnAction } from './btn'
import * as recaptcha from './recaptcha'
import scoreinfo from './scoreinfo'

const WEBMSCORE_URL = 'https://cdn.jsdelivr.net/npm/webmscore@0.5/webmscore.js'

const main = (): void => {
  // @ts-ignore
  if (!window.UGAPP || !window.UGAPP.store || !window.UGAPP.store.jmuse_settings) { return }

  // init recaptcha
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  recaptcha.init()

  const btnList = new BtnList(getDownloadBtn())

  btnList.add({
    name: 'Download MSCZ',
    action: BtnAction.process(downloadMscz),
  })

  btnList.add({
    name: 'Download PDF',
    action: BtnAction.process(downloadPDF),
  })

  btnList.add({
    name: 'Download MusicXML',
    action: BtnAction.openUrl(scoreinfo.mxlUrl),
  })

  btnList.add({
    name: 'Download MIDI',
    action: BtnAction.openUrl(scoreinfo.midiUrl),
  })

  btnList.add({
    name: 'Download MP3',
    action: BtnAction.openUrl(scoreinfo.mp3Url),
  })

  btnList.add({
    name: 'Individual Parts',
    async action (btnName, btn, setText) {
      const _onclick = btn.onclick
      btn.onclick = null
      setText(BtnAction.PROCESSING_TEXT)

      const w = window.open('') as Window
      const txt = document.createTextNode(BtnAction.PROCESSING_TEXT)
      w.document.body.append(txt)

      // set page hooks
      // eslint-disable-next-line prefer-const
      let score: any
      const destroy = (): void => {
        score && score.destroy()
        w.close()
      }
      window.addEventListener('unload', destroy)
      w.addEventListener('beforeunload', () => {
        score && score.destroy()
        window.removeEventListener('unload', destroy)
        setText(btnName)
        btn.onclick = _onclick
      })

      // load webmscore (https://github.com/LibreScore/webmscore)
      const script = w.document.createElement('script')
      script.src = WEBMSCORE_URL
      w.document.body.append(script)
      await new Promise(resolve => { script.onload = resolve })

      // parse mscz data
      const data = new Uint8Array(
        new Uint8Array(await fetchMscz()), // copy its ArrayBuffer
      )
      score = await w['WebMscore'].load('mscz', data)
      await score.generateExcerpts()
      const metadata = await score.metadata()
      console.log('score metadata loaded by webmscore', metadata)

      // render the part selection page
      txt.remove()
      const fieldset = w.document.createElement('fieldset')
      metadata.excerpts.unshift({ id: -1, title: 'Full score' })
      for (const excerpt of metadata.excerpts) {
        const id = excerpt.id
        const partName = excerpt.title

        const e = w.document.createElement('input')
        e.name = 'score-part'
        e.type = 'radio'
        e.alt = partName
        e.value = id
        e.checked = id === 0 // initially select the first part 

        const label = w.document.createElement('label')
        label.innerText = partName

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
        const partName = checked.alt

        await score.setExcerptId(id)

        const filename = scoreinfo.fileName
        const data = new Blob([await score.savePdf()])
        saveAs(data, `${filename} - ${partName}.pdf`)
      }
    },
  }).title = 'Download individual parts (BETA)'

  btnList.commit()
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
waitForDocumentLoaded().then(main)
