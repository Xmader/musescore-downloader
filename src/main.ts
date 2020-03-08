import "./meta"

import { ScorePlayerData } from "./types"
import { waitForDocumentLoaded } from "./utils"
import * as recaptcha from "./recaptcha"

import { PDFWorkerHelper } from "./worker-helper"
import FileSaver from "file-saver/dist/FileSaver.js"

const saveAs: typeof import("file-saver").saveAs = FileSaver.saveAs

let pdfBlob: Blob

const generatePDF = async (imgURLs: string[], imgType: "svg" | "png", name?: string) => {
    if (pdfBlob) {
        return saveAs(pdfBlob, `${name}.pdf`)
    }

    const cachedImg = document.querySelector("img[src*=score_]") as HTMLImageElement
    const { naturalWidth: width, naturalHeight: height } = cachedImg

    const worker = new PDFWorkerHelper()
    const pdfArrayBuffer = await worker.generatePDF(imgURLs, imgType, width, height)
    worker.terminate()

    pdfBlob = new Blob([pdfArrayBuffer])

    saveAs(pdfBlob, `${name}.pdf`)
}

const getPagesNumber = (scorePlayerData: ScorePlayerData) => {
    try {
        return scorePlayerData.json.metadata.pages
    } catch (_) {
        return document.querySelectorAll("img[src*=score_]").length
    }
}

const getImgType = (): "svg" | "png" => {
    try {
        const imgE: HTMLImageElement = document.querySelector("img[src*=score_]")
        const { pathname } = new URL(imgE.src)
        const imgtype = pathname.match(/\.(\w+)$/)[1]
        return imgtype as "svg" | "png"
    } catch (_) {
        return null
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
    return getTitle(scorePlayerData).replace(/[\s<>:{}"/\\|?*~.\0\cA-\cZ]+/g, "_")
}

const main = () => {

    // @ts-ignore
    if (!window.UGAPP || !window.UGAPP.store || !window.UGAPP.store.jmuse_settings) { return }

    // init recaptcha
    recaptcha.init()

    // @ts-ignore
    const scorePlayer: ScorePlayerData = window.UGAPP.store.jmuse_settings.score_player

    const { id } = scorePlayer.json
    const baseURL = scorePlayer.urls.image_path

    // const msczURL = `https://musescore.com/static/musescore/scoredata/score/${getIndexPath(id)}/${id}/score_${vid}_${scoreHexId}.mscz`

    // https://github.com/Xmader/cloudflare-worker-musescore-mscz
    const msczURL = `https://musescore.now.sh/api/mscz?id=${id}&token=`

    const mxlURL = baseURL + "score.mxl"
    const { midi: midiURL, mp3: mp3URL } = scorePlayer.urls

    const btnsDiv = document.querySelector(".score-right .buttons-wrapper") || document.querySelectorAll("aside section > div")[4]
    const downloadBtn = btnsDiv.querySelector("button, .button") as HTMLElement
    downloadBtn.onclick = null

    const imgType = getImgType() || "svg"

    const sheetImgURLs = Array.from({ length: getPagesNumber(scorePlayer) }).fill(null).map((_, i) => {
        return baseURL + `score_${i}.${imgType}`
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
            return x.textContent.includes("Download")
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

        if (name == "PDF") {
            btn.onclick = () => {
                const text = textNode.textContent
                const filename = getScoreFileName(scorePlayer)

                textNode.textContent = "Processing…"

                generatePDF(sheetImgURLs, imgType, filename).then(() => {
                    textNode.textContent = text
                })
            }
        } else if (name == "MSCZ") {
            btn.onclick = async () => {
                const text = textNode.textContent
                textNode.textContent = "Processing…"

                const token = await recaptcha.execute()
                const filename = getScoreFileName(scorePlayer)

                const r = await fetch(url + token)
                const data = await r.blob()

                textNode.textContent = text

                saveAs(data, `${filename}.mscz`)
            }
        } else {
            btn.onclick = () => {
                window.open(url)
            }
        }

        return btn
    })

    downloadBtn.replaceWith(...newDownloadBtns)

}

waitForDocumentLoaded().then(main)
