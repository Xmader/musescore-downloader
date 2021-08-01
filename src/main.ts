import './meta'

import FileSaver from 'file-saver'
import { waitForSheetLoaded, console } from './utils'
import { downloadPDF } from './pdf'
import { downloadMscz } from './mscz'
import { getFileUrl } from './file'
import { INDV_DOWNLOADS } from './mscore'
import { getLibreScoreLink } from './librescore-link'
import { BtnList, BtnAction, BtnListMode, ICON } from './btn'
import { ScoreInfoInPage, SheetInfoInPage, getActualId } from './scoreinfo'
import i18n from './i18n'

const { saveAs } = FileSaver

const main = (): void => {
  const btnList = new BtnList()
  const scoreinfo = new ScoreInfoInPage(document)
  const { fileName } = scoreinfo

  // eslint-disable-next-line no-void
  void getActualId(scoreinfo)

  let indvPartBtn: HTMLButtonElement | null = null
  const fallback = () => {
    // btns fallback to load from MSCZ file (`Individual Parts`)
    return indvPartBtn?.click()
  }

  btnList.add({
    name: i18n('DOWNLOAD')('MSCZ'),
    action: BtnAction.process(() => downloadMscz(scoreinfo, saveAs)),
  })

  btnList.add({
    name: i18n('DOWNLOAD')('PDF'),
    action: BtnAction.process(() => downloadPDF(scoreinfo, new SheetInfoInPage(document), saveAs), fallback, 3 * 60 * 1000 /* 3min */),
  })

  btnList.add({
    name: i18n('DOWNLOAD')('MXL'),
    action: BtnAction.mscoreWindow(scoreinfo, async (w, score) => {
      const mxl = await score.saveMxl()
      const data = new Blob([mxl])
      saveAs(data, `${fileName}.mxl`)
      w.close()
    }),
  })

  btnList.add({
    name: i18n('DOWNLOAD')('MIDI'),
    action: BtnAction.download(() => getFileUrl(scoreinfo.id, 'midi'), fallback, 30 * 1000 /* 30s */),
  })

  btnList.add({
    name: i18n('DOWNLOAD')('MP3'),
    action: BtnAction.download(() => getFileUrl(scoreinfo.id, 'mp3'), fallback, 30 * 1000 /* 30s */),
  })

  indvPartBtn = btnList.add({
    name: i18n('IND_PARTS')(),
    tooltip: i18n('IND_PARTS_TOOLTIP')(),
    action: BtnAction.mscoreWindow(scoreinfo, async (w, score, txt) => {
      const metadata = await score.metadata()
      console.log('score metadata loaded by webmscore', metadata)

      // add the "full score" option as a "part" 
      metadata.excerpts.unshift({ id: -1, title: i18n('FULL_SCORE')(), parts: [] })

      // render the part selection page
      txt.remove()
      const fieldset = w.document.createElement('fieldset')
      w.document.body.append(fieldset)

      const downloads = INDV_DOWNLOADS

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
          saveAs(data, `${fileName} - ${partName}.${d.fileExt}`)

          // unlock button
          initBtn()
        }

        initBtn()
      }
    }),
  })

  btnList.add({
    name: i18n('VIEW_IN_LIBRESCORE')(),
    action: BtnAction.openUrl(() => getLibreScoreLink(scoreinfo)),
    tooltip: 'BETA',
    icon: ICON.LIBRESCORE,
    lightTheme: true,
  })

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  btnList.commit(BtnListMode.InPage)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
waitForSheetLoaded().then(main)
