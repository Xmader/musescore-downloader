import './meta'

import { waitForDocumentLoaded, saveAs } from './utils'
import { downloadPDF } from './pdf'
import { downloadMscz } from './mscz'
import { getFileUrl } from './file'
import { WebMscore, loadSoundFont } from './mscore'
import { BtnList, BtnAction, BtnListMode } from './btn'
import scoreinfo from './scoreinfo'
import i18n from './i18n'

const main = (): void => {
  const btnList = new BtnList()
  const filename = scoreinfo.fileName

  btnList.add({
    name: i18n('DOWNLOAD')('MSCZ'),
    action: BtnAction.process(downloadMscz),
  })

  btnList.add({
    name: i18n('DOWNLOAD')('PDF'),
    action: BtnAction.process(downloadPDF),
  })

  btnList.add({
    name: i18n('DOWNLOAD')('MusicXML'),
    action: BtnAction.mscoreWindow(async (w, score) => {
      const mxl = await score.saveMxl()
      const data = new Blob([mxl])
      saveAs(data, `${filename}.mxl`)
      w.close()
    }),
  })

  btnList.add({
    name: i18n('DOWNLOAD')('MIDI'),
    action: BtnAction.download(() => getFileUrl('midi')),
  })

  btnList.add({
    name: i18n('DOWNLOAD')('MP3'),
    action: BtnAction.download(() => getFileUrl('mp3')),
  })

  btnList.add({
    name: i18n('IND_PARTS')(),
    tooltip: i18n('IND_PARTS_TOOLTIP')(),
    action: BtnAction.mscoreWindow(async (w, score, txt) => {
      const metadata = await score.metadata()
      console.log('score metadata loaded by webmscore', metadata)

      // add the "full score" option as a "part" 
      metadata.excerpts.unshift({ id: -1, title: i18n('FULL_SCORE')(), parts: [] })

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
          name: i18n('DOWNLOAD')('PDF'),
          fileExt: 'pdf',
          action: (score) => score.savePdf(),
        },
        {
          name: i18n('DOWNLOAD')('MSCZ'),
          fileExt: 'mscz',
          action: (score) => score.saveMsc('mscz'),
        },
        {
          name: i18n('DOWNLOAD')('MusicXML'),
          fileExt: 'mxl',
          action: (score) => score.saveMxl(),
        },
        {
          name: i18n('DOWNLOAD')('MIDI'),
          fileExt: 'mid',
          action: (score) => score.saveMidi(true, true),
        },
        {
          name: i18n('DOWNLOAD_AUDIO')('FLAC'),
          fileExt: 'flac',
          action: (score) => loadSoundFont(score).then(() => score.saveAudio('flac')),
        },
        {
          name: i18n('DOWNLOAD_AUDIO')('OGG'),
          fileExt: 'ogg',
          action: (score) => loadSoundFont(score).then(() => score.saveAudio('ogg')),
        },
      ]

      // part selection
      const DEFAULT_PART = -1 // initially select "full score"
      for (const excerpt of metadata.excerpts) {
        const id = excerpt.id
        const partName = excerpt.title

        const e = w.document.createElement('input')
        e.name = 'score-part'
        e.type = 'radio'
        e.alt = partName
        e.checked = id === DEFAULT_PART
        e.onclick = () => {
          return score.setExcerptId(id) // set selected part
        }

        const label = w.document.createElement('label')
        label.innerText = partName

        const br = w.document.createElement('br')
        fieldset.append(e, label, br)
      }

      await score.setExcerptId(DEFAULT_PART)

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
          submitBtn.value = i18n('PROCESSING')()

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

  btnList.commit(BtnListMode.InPage)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
waitForDocumentLoaded().then(main)
