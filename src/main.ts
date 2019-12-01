import "./meta"

import { ScorePlayerData } from "./types"
import { waitForDocumentLoaded } from "./utils"

import PDFDocument from "pdfkit/lib/document"
import saveAs from "file-saver/dist/FileSaver.js"

let pdfBlob: Blob

const svgToPng = async (svgURL: string) => {
    const imageElement = document.createElement("img")
    imageElement.style.display = "none"
    document.body.appendChild(imageElement)

    imageElement.src = svgURL

    // wait until image loaded
    await new Promise((resolve) => {
        imageElement.onload = () => resolve()
    })

    const { naturalWidth: width, naturalHeight: height } = imageElement

    const canvas = document.createElement("canvas")
    const canvasContext = canvas.getContext("2d")

    canvas.width = width
    canvas.height = height
    canvas.style.display = "none"

    document.body.appendChild(canvas)

    canvasContext.clearRect(0, 0, width, height)
    canvasContext.drawImage(imageElement, 0, 0)

    const data = canvas.toDataURL("image/png")

    canvas.remove()
    imageElement.remove()

    return data
}

const generatePDF = async (svgURLs: string[], name?: string) => {
    if (pdfBlob) {
        return saveAs(pdfBlob, `${name}.pdf`)
    }

    const cachedImg = document.querySelector("img[id^=score_]") as HTMLImageElement
    const { naturalWidth: width, naturalHeight: height } = cachedImg

    const imgDataList = await Promise.all(svgURLs.map(svgToPng))

    // @ts-ignore
    const pdf = new (PDFDocument as typeof import("pdfkit"))({
        // compress: true,
        size: [width, height],
        autoFirstPage: false,
        margin: 0,
        layout: "portrait",
    })

    imgDataList.forEach((data) => {
        pdf.addPage()
        pdf.image(data, {
            width,
            height,
        })
    })

    // TODO: webworker

    // @ts-ignore
    return pdf.getBlob().then((blob: Blob) => {
        pdfBlob = blob
        saveAs(blob, `${name}.pdf`)
    })
}

const getPagesNumber = (scorePlayerData: ScorePlayerData) => {
    try {
        return scorePlayerData.json.metadata.pages
    } catch (_) {
        return document.querySelectorAll("img[id^=score_]").length
    }
}

const getTitle = (scorePlayerData: ScorePlayerData) => {
    try {
        return scorePlayerData.json.metadata.title
    } catch (_) {
        return ""
    }
}

const getScoreFileName = (scorePlayerData: ScorePlayerData) => {
    return getTitle(scorePlayerData).replace(/\W+/g, "_")
}

const main = () => {

    // @ts-ignore
    if (!window.UGAPP || !window.UGAPP.store || !window.UGAPP.store.jmuse_settings) { return }

    // @ts-ignore
    const scorePlayer: ScorePlayerData = window.UGAPP.store.jmuse_settings.score_player

    const { id } = scorePlayer.json
    const baseURL = scorePlayer.urls.image_path

    // const msczURL = `https://musescore.com/static/musescore/scoredata/score/${getIndexPath(id)}/${id}/score_${vid}_${scoreHexId}.mscz`

    // https://github.com/Xmader/cloudflare-worker-musescore-mscz
    const msczURL = `https://musescore-mscz.99.workers.dev/${id}`

    const mxlURL = baseURL + "score.mxl"
    const { midi: midiURL, mp3: mp3URL } = scorePlayer.urls

    const btnsDiv = document.querySelector(".score-right .buttons-wrapper") || document.querySelectorAll("aside section > div")[3]
    const downloadBtn = btnsDiv.querySelector("button, .button") as HTMLElement
    downloadBtn.onclick = null

    const svgURLs = Array.from({ length: getPagesNumber(scorePlayer) }).fill(null).map((_, i) => {
        return baseURL + `score_${i}.svg`
    })

    const downloadURLs = {
        "MSCZ": msczURL,
        "PDF": null,
        "MusicXML": mxlURL,
        "MIDI": midiURL,
        "MP3": mp3URL,
    }

    const createBtn = (name: string) => {
        const btn = downloadBtn.cloneNode(true) as HTMLElement

        if (btn.nodeName.toLowerCase() == "button") {
            btn.setAttribute("style", "width: 205px !important")
        } else {
            btn.dataset.target = ""
        }

        const textNode = [...btn.childNodes].find((x) => {
            return x.nodeName.toLowerCase() == "#text"
                && x.textContent.includes("Download")
        })
        textNode.textContent = `Download ${name}`

        return {
            btn,
            textNode,
        }
    }

    const newDownloadBtns = Object.keys(downloadURLs).map((name) => {
        const url = downloadURLs[name]
        const { btn, textNode } = createBtn(name)

        if (name !== "PDF") {
            btn.onclick = () => {
                window.open(url)
            }
        } else {
            btn.onclick = () => {
                const text = textNode.textContent
                const filename = getScoreFileName(scorePlayer)

                textNode.textContent = "Processing…"

                generatePDF(svgURLs, filename).then(() => {
                    textNode.textContent = text
                })
            }
        }

        return btn
    })

    downloadBtn.replaceWith(...newDownloadBtns)

}

waitForDocumentLoaded().then(main)
