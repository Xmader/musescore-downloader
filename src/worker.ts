
/// <reference lib="webworker" />

import PDFDocument from 'pdfkit/lib/document'
import SVGtoPDF from 'svg-to-pdfkit'

type ImgType = 'svg' | 'png'

type DataResultType = 'dataUrl' | 'text'

const readData = (blob: Blob, type: DataResultType): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (): void => {
      const result = reader.result
      resolve(result as string)
    }
    reader.onerror = reject
    if (type === 'dataUrl') {
      reader.readAsDataURL(blob)
    } else {
      reader.readAsText(blob)
    }
  })
}

const fetchData = async (imgUrl: string, type: DataResultType): Promise<string> => {
  const r = await fetch(imgUrl)
  const blob = await r.blob()
  return readData(blob, type)
}

const generatePDF = async (imgURLs: string[], imgType: ImgType, width: number, height: number): Promise<ArrayBuffer> => {
  // @ts-ignore
  const pdf = new (PDFDocument as typeof import('pdfkit'))({
    // compress: true,
    size: [width, height],
    autoFirstPage: false,
    margin: 0,
    layout: 'portrait',
  })

  if (imgType === 'png') {
    const imgDataUrlList: string[] = await Promise.all(imgURLs.map(url => fetchData(url, 'dataUrl')))

    imgDataUrlList.forEach((data) => {
      pdf.addPage()
      pdf.image(data, {
        width,
        height,
      })
    })
  } else { // imgType == "svg"
    const svgList = await Promise.all(imgURLs.map(url => fetchData(url, 'text')))

    svgList.forEach((svg) => {
      pdf.addPage()
      SVGtoPDF(pdf, svg, 0, 0, {
        preserveAspectRatio: 'none',
      })
    })
  }

  // @ts-ignore
  const buf: Uint8Array = await pdf.getBuffer()

  return buf.buffer
}

export type PDFWorkerMessage = [string[], ImgType, number, number];

onmessage = async (e): Promise<void> => {
  const [
    imgURLs,
    imgType,
    width,
    height,
  ] = e.data as PDFWorkerMessage

  const pdfBuf = await generatePDF(
    imgURLs,
    imgType,
    width,
    height,
  )

  postMessage(pdfBuf, [pdfBuf])
}
