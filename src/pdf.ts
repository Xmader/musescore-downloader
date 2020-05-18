
import { PDFWorkerHelper } from './worker-helper'
import { saveAs } from './utils'
import scoreinfo from './scoreinfo'

let pdfBlob: Blob

const _downloadPDF = async (imgURLs: string[], imgType: 'svg' | 'png', name?: string): Promise<void> => {
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

export const downloadPDF = async (): Promise<void> => {
  const imgType = scoreinfo.sheetImgType
  const pageCount = scoreinfo.pageCount

  const sheetImgURLs = Array.from({ length: pageCount }).map((_, i) => {
    return scoreinfo.baseUrl + `score_${i}.${imgType}`
  })

  return _downloadPDF(sheetImgURLs, imgType, scoreinfo.fileName)
}
