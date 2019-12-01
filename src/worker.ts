
/// <reference lib="webworker" />

import PDFDocument from "pdfkit/lib/document"

const generatePDF = async (imgDataUrlList: string[], width: number, height: number): Promise<ArrayBuffer> => {

    // @ts-ignore
    const pdf = new (PDFDocument as typeof import("pdfkit"))({
        // compress: true,
        size: [width, height],
        autoFirstPage: false,
        margin: 0,
        layout: "portrait",
    })

    imgDataUrlList.forEach((data) => {
        pdf.addPage()
        pdf.image(data, {
            width,
            height,
        })
    })

    // @ts-ignore
    const buf: Uint8Array = await pdf.getBuffer()

    return buf.buffer
}

const getDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result
            resolve(result as string)
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
    })
}

export type PDFWorkerMessage = [Blob[], number, number];

onmessage = async (e) => {
    const [
        imgDataBlobList,
        width,
        height,
    ] = e.data as PDFWorkerMessage

    const dataURLs = await Promise.all(imgDataBlobList.map(getDataURL))

    const pdfBuf = await generatePDF(
        dataURLs,
        width,
        height,
    )

    postMessage(pdfBuf, [pdfBuf])
}
