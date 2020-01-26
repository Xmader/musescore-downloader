
/// <reference lib="webworker" />

import PDFDocument from "pdfkit/lib/document"
import SVGtoPDF from "svg-to-pdfkit"

type ImgType = "svg" | "png"

const generatePDF = async (imgURLs: string[], imgType: ImgType, width: number, height: number): Promise<ArrayBuffer> => {

    // @ts-ignore
    const pdf = new (PDFDocument as typeof import("pdfkit"))({
        // compress: true,
        size: [width, height],
        autoFirstPage: false,
        margin: 0,
        layout: "portrait",
    })

    if (imgType == "png") {
        const imgDataUrlList: string[] = await Promise.all(imgURLs.map(fetchDataURL))

        imgDataUrlList.forEach((data) => {
            pdf.addPage()
            pdf.image(data, {
                width,
                height,
            })
        })
    } else {  // imgType == "svg"
        const svgList = await Promise.all(imgURLs.map(fetchText))

        svgList.forEach((svg) => {
            pdf.addPage()
            SVGtoPDF(pdf, svg, 0, 0, {
                preserveAspectRatio: "none",
            })
        })
    }

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

const fetchDataURL = async (imgUrl: string): Promise<string> => {
    const r = await fetch(imgUrl)
    const blob = await r.blob()
    return getDataURL(blob)
}

const fetchText = async (imgUrl: string): Promise<string> => {
    const r = await fetch(imgUrl)
    return r.text()
}

export type PDFWorkerMessage = [string[], ImgType, number, number];

onmessage = async (e) => {
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
