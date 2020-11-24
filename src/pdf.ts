
import { PDFWorkerHelper } from './worker-helper'
import { getFileUrl } from './file'
import { saveAs } from './utils'
import { ScoreInfo } from './scoreinfo'

let pdfBlob: Blob

const _downloadPDF = async (imgURLs: string[], imgType: 'svg' | 'png', name = ''): Promise<void> => {
  if (pdfBlob) {
    return saveAs(pdfBlob, `${name}.pdf`)
  }

  const cachedImg = document.querySelector('img[src*=score_]') as HTMLImageElement
  const { naturalWidth: width, naturalHeight: height } = cachedImg

  const worker = new PDFWorkerHelper()
  const pdfArrayBuffer = await worker.generatePDF(imgURLs, imgType, width, height)
  worker.terminate()

  pdfBlob = new Blob([pdfArrayBuffer])

  saveAs(pdfBlob, `${name}.pdf`)
}

export const downloadPDF = async (scoreinfo: ScoreInfo): Promise<void> => {
  const imgType = scoreinfo.sheetImgType
  const pageCount = scoreinfo.pageCount

  const rs = Array.from({ length: pageCount }).map((_, i) => {
    if (i === 0) { // The url to the first page is static. We don't need to use API to obtain it.
      return scoreinfo.thumbnailUrl
    } else { // obtain image urls using the API
      return getFileUrl(scoreinfo.id, 'img', i)
    }
  })
  const sheetImgURLs = await Promise.all(rs)

  return _downloadPDF(sheetImgURLs, imgType, scoreinfo.fileName)
}
