import './meta'

import { waitForDocumentLoaded, saveAs } from './utils'
import { downloadPDF } from './pdf'
import { downloadMscz } from './mscz'
import { getFileUrl } from './file'
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
    action: BtnAction.process(downloadPDF),
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
    action: BtnAction.download(() => getFileUrl('midi'), `${filename}.mid`),
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
          return score.setExcerptId(id)
        }

        const label = w.document.createElement('label')
        label.innerText = partName

        const br = w.document.createElement('br')
        fieldset.append(e, label, br)
      }

      // submit button
      const submitBtn = w.document.createElement('input')
      submitBtn.type = 'submit'
      submitBtn.value = 'Download PDF'
      fieldset.append(submitBtn)

      const onSubmit = async (): Promise<void> => {
        // lock the button when processing
        submitBtn.onclick = null

        const checked = fieldset.querySelector('input:checked') as HTMLInputElement
        const partName = checked.alt

        const data = new Blob([await score.savePdf()])
        saveAs(data, `${filename} - ${partName}.pdf`)

        submitBtn.onclick = onSubmit
      }
      submitBtn.onclick = onSubmit
    }),
  })

  btnList.commit()
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
waitForDocumentLoaded().then(main)
