import "./meta"

import { ScorePlayerData } from "./types"
import { getIndexPath } from "./utils"

// @ts-ignore
const scorePlayer: ScorePlayerData = window.UGAPP.store.jmuse_settings.score_player

const { id, vid } = scorePlayer.json
const baseURL = scorePlayer.urls.image_path
const scoreHexId = baseURL.split("/").filter(Boolean).reverse()[1]

const msczURL = `https://musescore.com/static/musescore/scoredata/score/${getIndexPath}/${id}/score_${vid}_${scoreHexId}.mscz`
const pdfURL = baseURL + "score_full.pdf"
const mxlURL = baseURL + "score.mxl"
const { midi: midiURL, mp3: mp3URL } = scorePlayer.urls

const btnsDiv = document.querySelectorAll("aside section > div")[3]
const downloadBtn = btnsDiv.querySelector("button")
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

    const btn = downloadBtn.cloneNode(true) as HTMLButtonElement
    btn.onclick = () => {
        window.open(url)
    }

    return btn
})

downloadBtn.replaceWith(...newDownloadBtns)
