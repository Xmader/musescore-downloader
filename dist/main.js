// ==UserScript==
// @name         musescore-downloader
// @namespace    https://www.xmader.com/
// @homepageURL  https://github.com/Xmader/musescore-downloader/
// @supportURL   https://github.com/Xmader/musescore-downloader/issues
// @version      0.1.2
// @description  免登录、免 Musescore Pro，下载 musescore.com 上的曲谱
// @author       Xmader
// @match        https://musescore.com/user/*/scores/*
// @license      MIT
// @copyright    Copyright (c) 2019 Xmader
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const getIndexPath = (id) => {
        const idStr = String(id);
        // 获取最后三位，倒序排列
        // "5449062" -> ["2", "6", "0"]
        const indexN = idStr.split("").reverse().slice(0, 3);
        return indexN.join("/");
    };

    // @ts-ignore
    const scorePlayer = window.UGAPP.store.jmuse_settings.score_player;
    const { id, vid } = scorePlayer.json;
    const baseURL = scorePlayer.urls.image_path;
    const scoreHexId = baseURL.split("/").filter(Boolean).reverse()[0];
    const msczURL = `https://musescore.com/static/musescore/scoredata/score/${getIndexPath(id)}/${id}/score_${vid}_${scoreHexId}.mscz`;
    const pdfURL = baseURL + "score_full.pdf";
    const mxlURL = baseURL + "score.mxl";
    const { midi: midiURL, mp3: mp3URL } = scorePlayer.urls;
    const btnsDiv = document.querySelectorAll("aside section > div")[3];
    const downloadBtn = btnsDiv.querySelector("button");
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
        btn.setAttribute("style", "width: 205px !important");
        const span = btn.querySelector("span");
        span.textContent = `Download ${name}`;
        return btn;
    });
    downloadBtn.replaceWith(...newDownloadBtns);

}());
