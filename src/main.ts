import './meta'

import { waitForDocumentLoaded, saveAs } from './utils'
import { downloadPDF } from './pdf'
import { downloadMscz } from './mscz'
import { getFileUrl } from './file'
import { WebMscore, loadSoundFont } from './mscore'
import { getDownloadBtn, BtnList, BtnAction } from './btn'
import * as recaptcha from './recaptcha'
import scoreinfo from './scoreinfo'

const main = (): void => {
  // @ts-ignore
  if (!window?.UGAPP?.store?.page?.data?.score) { return }

  // init recaptcha
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  recaptcha.init()

  const btnList = new BtnList(getDownloadBtn())
  const filename = scoreinfo.fileName

  btnList.add({
    name: 'Download MSCZ',
    action: BtnAction.process(downloadMscz),
  })

  btnList.add({
    name: 'Download PDF',
    action: BtnAction.deprecate(
      BtnAction.process(downloadPDF),
    ),
  })

  btnList.add({
    name: 'Download MusicXML',
    action: BtnAction.mscoreWindow(async (w, score) => {
      const mxl = await score.saveMxl()
      const data = new Blob([mxl])
      saveAs(data, `${filename}.mxl`)
      w.close()
    }),
  })

  btnList.add({
    name: 'Download MIDI',
    action: BtnAction.deprecate(
      BtnAction.download(() => getFileUrl('midi'), `${filename}.mid`),
    ),
  })

  btnList.add({
    name: 'Download MP3',
    action: BtnAction.download(() => getFileUrl('mp3'), `${filename}.mp3`),
  })

  btnList.add({
    name: 'Individual Parts',
    tooltip: 'Download individual parts (BETA)',
    action: BtnAction.mscoreWindow(async (w, score, txt) => {
      const metadata = await score.metadata()
      console.log('score metadata loaded by webmscore', metadata)

      // add the "full score" option as a "part" 
      metadata.excerpts.unshift({ id: -1, title: 'Full score', parts: [] })

      // render the part selection page
      txt.remove()
      const fieldset = w.document.createElement('fieldset')
      w.document.body.append(fieldset)

      interface IndividualDownload {
        name: string;
        fileExt: string;
        action (score: WebMscore): Promise<Uint8Array>;
      }

      const downloads: IndividualDownload[] = [
        {
          name: 'Download PDF',
          fileExt: 'pdf',
          action: (score) => score.savePdf(),
        },
        {
          name: 'Download Part MSCZ',
          fileExt: 'mscz',
          action: (score) => score.saveMsc('mscz'),
        },
        {
          name: 'Download Part MusicXML',
          fileExt: 'mxl',
          action: (score) => score.saveMxl(),
        },
        {
          name: 'Download MIDI',
          fileExt: 'mid',
          action: (score) => score.saveMidi(true, true),
        },
        {
          name: 'Download FLAC Audio',
          fileExt: 'flac',
          action: (score) => loadSoundFont(score).then(() => score.saveAudio('flac')),
        },
        {
          name: 'Download OGG Audio',
          fileExt: 'ogg',
          action: (score) => loadSoundFont(score).then(() => score.saveAudio('ogg')),
        },
      ]

      // part selection
      for (const excerpt of metadata.excerpts) {
        const id = excerpt.id
        const partName = excerpt.title

        const e = w.document.createElement('input')
        e.name = 'score-part'
        e.type = 'radio'
        e.alt = partName
        e.checked = id === 0 // initially select the first part 
        e.onclick = () => {
          return score.setExcerptId(id) // set selected part
        }

        const label = w.document.createElement('label')
        label.innerText = partName

        const br = w.document.createElement('br')
        fieldset.append(e, label, br)
      }

      await score.setExcerptId(0) // initially select the first part 

      // submit buttons
      for (const d of downloads) {
        const submitBtn = w.document.createElement('input')
        submitBtn.type = 'submit'
        submitBtn.style.margin = '0.5em'
        fieldset.append(submitBtn)

        const initBtn = () => {
          submitBtn.onclick = onSubmit
          submitBtn.disabled = false
          submitBtn.value = d.name
        }

        const onSubmit = async (): Promise<void> => {
          // lock the button when processing
          submitBtn.onclick = null
          submitBtn.disabled = true
          submitBtn.value = 'Processing…'

          const checked = fieldset.querySelector('input:checked') as HTMLInputElement
          const partName = checked.alt

          const data = new Blob([await d.action(score)])
          saveAs(data, `${filename} - ${partName}.${d.fileExt}`)

          // unlock button
          initBtn()
        }

        initBtn()
      }
    }),
  })

  btnList.commit()
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
waitForDocumentLoaded().then(main)
