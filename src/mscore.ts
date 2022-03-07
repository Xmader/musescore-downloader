/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { fetchMscz } from "./mscz";
import { fetchData } from "./utils";
import { ScoreInfo } from "./scoreinfo";
import isNodeJs from "detect-node";
import i18next from "i18next";
import lang from "./i18n/index";
import en from "./i18n/en.json";
import es from "./i18n/es.json";
import it from "./i18n/it.json";
import zh from "./i18n/zh.json";
import { dependencies as depVers } from "../package.json";

(async () => {
    await i18next.init({
        compatibilityJSON: "v3",
        fallbackLng: lang,
        resources: {
            en: { translation: en },
            es: { translation: es },
            it: { translation: it },
            zh: { translation: zh },
        },
    });
})();

const WEBMSCORE_URL = `https://cdn.jsdelivr.net/npm/webmscore@${depVers.webmscore}/webmscore.js`;

// fonts for Chinese characters (CN) and Korean hangul (KR)
// JP characters are included in the CN font
const FONT_URLS = ["CN", "KR"].map(
    (l) =>
        `https://cdn.jsdelivr.net/npm/@librescore/fonts@${depVers["@librescore/fonts"]}/SourceHanSans${l}.min.woff2`
);

const SF3_URL = `https://cdn.jsdelivr.net/npm/@librescore/sf3@${depVers["@librescore/sf3"]}/FluidR3Mono_GM.sf3`;
const SOUND_FONT_LOADED = Symbol("SoundFont loaded");

export type WebMscore = import("webmscore").default;
export type WebMscoreConstr = typeof import("webmscore").default;

const initMscore = async (w: Window): Promise<WebMscoreConstr> => {
    if (!isNodeJs) {
        // attached to a page
        if (!w["WebMscore"]) {
            // init webmscore (https://github.com/LibreScore/webmscore)
            const script = w.document.createElement("script");
            script.src = WEBMSCORE_URL;
            w.document.body.append(script);
            await new Promise((resolve) => {
                script.onload = resolve;
            });
        }
        return w["WebMscore"] as WebMscoreConstr;
    } else {
        // nodejs
        return require("webmscore").default as WebMscoreConstr;
    }
};

let fonts: Promise<Uint8Array[]> | undefined;
const initFonts = () => {
    // load CJK fonts
    // CJK (East Asian) characters will be rendered as "tofu" if there is no font
    if (!fonts) {
        if (isNodeJs) {
            // module.exports.CN = ..., module.exports.KR = ...
            const FONTS = Object.values(require("@librescore/fonts"));

            const fs = require("fs");
            fonts = Promise.all(
                FONTS.map(
                    (path: string) =>
                        fs.promises.readFile(path) as Promise<Buffer>
                )
            );
        } else {
            fonts = Promise.all(FONT_URLS.map((url) => fetchData(url)));
        }
    }
};

export const loadSoundFont = (score: WebMscore): Promise<void> => {
    if (!score[SOUND_FONT_LOADED]) {
        const loadPromise = (async () => {
            let data: Uint8Array;
            if (isNodeJs) {
                // module.exports.FluidR3Mono = ...
                const SF3 = Object.values(require("@librescore/sf3"))[0];
                const fs = require("fs");
                data = await fs.promises.readFile(SF3);
            } else {
                data = await fetchData(SF3_URL);
            }

            await score.setSoundFont(data);
        })();
        score[SOUND_FONT_LOADED] = loadPromise;
    }
    return score[SOUND_FONT_LOADED] as Promise<void>;
};

export const loadMscore = async (
    fileExt: string,
    scoreinfo: ScoreInfo,
    w?: Window
): Promise<WebMscore> => {
    initFonts();
    const WebMscore = await initMscore(w!);

    // parse mscz data
    const data = new Uint8Array(
        new Uint8Array(await fetchMscz(scoreinfo)) // copy its ArrayBuffer
    );
    const score = await WebMscore.load(fileExt, data, await fonts);
    await score.generateExcerpts();

    return score;
};

export interface IndividualDownload {
    name: string;
    fileExt: string;
    action(score: WebMscore): Promise<Uint8Array>;
}

export const INDV_DOWNLOADS: IndividualDownload[] = [
    {
        name: i18next.t("download", { fileType: "PDF" }),
        fileExt: "pdf",
        action: (score) => score.savePdf(),
    },
    {
        name: i18next.t("download", { fileType: "MSCZ" }),
        fileExt: "mscz",
        action: (score) => score.saveMsc("mscz"),
    },
    {
        name: i18next.t("download", { fileType: "MSCX" }),
        fileExt: "mscx",
        action: (score) => score.saveMsc("mscx"),
    },
    {
        name: i18next.t("download", { fileType: "MusicXML" }),
        fileExt: "mxl",
        action: (score) => score.saveMxl(),
    },
    {
        name: i18next.t("download", { fileType: "MIDI" }),
        fileExt: "mid",
        action: (score) => score.saveMidi(true, true),
    },
    {
        name: i18next.t("download_audio", { fileType: "MP3" }),
        fileExt: "mp3",
        action: (score) =>
            loadSoundFont(score).then(() => score.saveAudio("mp3")),
    },
    {
        name: i18next.t("download_audio", { fileType: "FLAC" }),
        fileExt: "flac",
        action: (score) =>
            loadSoundFont(score).then(() => score.saveAudio("flac")),
    },
    {
        name: i18next.t("download_audio", { fileType: "OGG" }),
        fileExt: "ogg",
        action: (score) =>
            loadSoundFont(score).then(() => score.saveAudio("ogg")),
    },
];
