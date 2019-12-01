// ==UserScript==
// @name         musescore-downloader
// @namespace    https://www.xmader.com/
// @homepageURL  https://github.com/Xmader/musescore-downloader/
// @supportURL   https://github.com/Xmader/musescore-downloader/issues
// @version      0.2.0
// @description  免登录、免 Musescore Pro，下载 musescore.com 上的曲谱
// @author       Xmader
// @match        https://musescore.com/*/*
// @license      MIT
// @copyright    Copyright (c) 2019 Xmader
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const waitForDocumentLoaded = () => {
        if (document.readyState !== "complete") {
            return new Promise(resolve => {
                document.addEventListener("readystatechange", () => {
                    if (document.readyState == "complete") {
                        resolve();
                    }
                }, { once: true });
            });
        }
        else {
            return Promise.resolve();
        }
    };

    const main = () => {
        // @ts-ignore
        if (!window.UGAPP || !window.UGAPP.store || !window.UGAPP.store.jmuse_settings) {
            return;
        }
        // @ts-ignore
        const scorePlayer = window.UGAPP.store.jmuse_settings.score_player;
        const { id } = scorePlayer.json;
        const baseURL = scorePlayer.urls.image_path;
        // const msczURL = `https://musescore.com/static/musescore/scoredata/score/${getIndexPath(id)}/${id}/score_${vid}_${scoreHexId}.mscz`
        // https://github.com/Xmader/cloudflare-worker-musescore-mscz
        const msczURL = `https://musescore-mscz.99.workers.dev/${id}`;
        const pdfURL = baseURL + "score_full.pdf";
        const mxlURL = baseURL + "score.mxl";
        const { midi: midiURL, mp3: mp3URL } = scorePlayer.urls;
        const btnsDiv = document.querySelector(".score-right .buttons-wrapper") || document.querySelectorAll("aside section > div")[3];
        const downloadBtn = btnsDiv.querySelector("button, .button");
        downloadBtn.onclick = null;
        const downloadURLs = {
            "Musescore": msczURL,
            "PDF": pdfURL,
            "MusicXML": mxlURL,
            "MIDI": midiURL,
            "MP3": mp3URL,
        };
        const newDownloadBtns = Object.keys(downloadURLs).map((name) => {
            const url = downloadURLs[name];
            const btn = downloadBtn.cloneNode(true);
            btn.onclick = () => {
                window.open(url);
            };
            if (btn.nodeName.toLowerCase() == "button") {
                btn.setAttribute("style", "width: 205px !important");
            }
            else {
                btn.dataset.target = "";
            }
            const span = [...btn.childNodes].find((x) => {
                return x.textContent.includes("Download");
            });
            span.textContent = `Download ${name}`;
            return btn;
        });
        downloadBtn.replaceWith(...newDownloadBtns);
    };
    waitForDocumentLoaded().then(main);

}());
