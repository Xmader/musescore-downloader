import "./meta"

import { ScorePlayerData } from "./types"
import { getIndexPath, waitForDocumentLoaded } from "./utils"

const main = () => {

    // @ts-ignore
    const scorePlayer: ScorePlayerData = window.UGAPP.store.jmuse_settings.score_player

    const { id, vid } = scorePlayer.json
    const baseURL = scorePlayer.urls.image_path
    const scoreHexId = baseURL.split("/").filter(Boolean).reverse()[0]

    const msczURL = `https://musescore.com/static/musescore/scoredata/score/${getIndexPath(id)}/${id}/score_${vid}_${scoreHexId}.mscz`
    const pdfURL = baseURL + "score_full.pdf"
    const mxlURL = baseURL + "score.mxl"
    const { midi: midiURL, mp3: mp3URL } = scorePlayer.urls

    const btnsDiv = document.querySelector(".score-right .buttons-wrapper") || document.querySelectorAll("aside section > div")[3]
    const downloadBtn = btnsDiv.querySelector("button, .button") as HTMLElement
    downloadBtn.onclick = null

    const downloadURLs = {
        "Musescore": msczURL,
        "PDF": pdfURL,
        "MusicXML": mxlURL,
        "MIDI": midiURL,
        "MP3": mp3URL,
    }

    const newDownloadBtns = Object.keys(downloadURLs).map((name) => {
        const url = downloadURLs[name]

        const btn = downloadBtn.cloneNode(true) as HTMLElement
        btn.onclick = () => {
            window.open(url)
        }

        if (btn.nodeName.toLowerCase() == "button") {
            btn.setAttribute("style", "width: 205px !important")
        } else {
            btn.dataset.target = ""
        }

        const span = [...btn.childNodes].find((x) => {
            return x.textContent.includes("Download")
        })
        span.textContent = `Download ${name}`

        return btn
    })

    downloadBtn.replaceWith(...newDownloadBtns)

}

waitForDocumentLoaded().then(main)
