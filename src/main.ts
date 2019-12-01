import "./meta"

import { ScorePlayerData } from "./types"
import { waitForDocumentLoaded } from "./utils"

import pdfmake from "pdfmake/build/pdfmake"

const generatePDF = (name?: string) => {
    const scoreImgs: NodeListOf<HTMLImageElement> = document.querySelectorAll("img[id^=score_]")

    const { naturalWidth: width, naturalHeight: height } = scoreImgs[0]

    const canvas = document.createElement("canvas")
    const canvasContext = canvas.getContext("2d")

    canvas.width = width
    canvas.height = height
    canvas.style.display = "none"

    document.body.appendChild(canvas)

    const imgDataList = [...scoreImgs].map((i) => {
        canvasContext.clearRect(0, 0, width, height)
        canvasContext.drawImage(i, 0, 0)
        return canvas.toDataURL("image/png")
    })

    const pdf = pdfmake.createPdf({
        pageMargins: 0,
        // @ts-ignore
        pageOrientation: "PORTRAIT",
        pageSize: { width, height },
        // compress: true,
        content: [
            ...imgDataList.map((data) => {
                return {
                    image: data,
                    width,
                    height,
                }
            })
        ]
    })

    return new Promise((resolve) => {
        pdf.download(`${name}.pdf`, resolve)
    })
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

    const downloadURLs = {
        "Musescore": msczURL,
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
                textNode.textContent = "Processing…"
                generatePDF(getScoreFileName(scorePlayer)).then(() => {
                    textNode.textContent = text
                })
            }
        }

        return btn
    })

    downloadBtn.replaceWith(...newDownloadBtns)

}

waitForDocumentLoaded().then(main)
