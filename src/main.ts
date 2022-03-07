import "./meta";

import FileSaver from "file-saver";
import { waitForSheetLoaded } from "./utils";
import { downloadPDF } from "./pdf";
import { getFileUrl } from "./file";
import { BtnList, BtnAction, BtnListMode } from "./btn";
import { ScoreInfoInPage, SheetInfoInPage } from "./scoreinfo";
import i18next from "i18next";
import lang from "./i18n/index";
import en from "./i18n/en.json";
import es from "./i18n/es.json";
import it from "./i18n/it.json";
import zh from "./i18n/zh.json";

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

const { saveAs } = FileSaver;

const main = (): void => {
    const btnList = new BtnList();
    const scoreinfo = new ScoreInfoInPage(document);
    const { fileName } = scoreinfo;

    let indvPartBtn: HTMLButtonElement | null = null;
    const fallback = () => {
        // btns fallback to load from MSCZ file (`Individual Parts`)
        return indvPartBtn?.click();
    };

    btnList.add({
        name: i18next.t("download", { fileType: "PDF" }),
        action: BtnAction.process(
            () => downloadPDF(scoreinfo, new SheetInfoInPage(document), saveAs),
            fallback,
            3 * 60 * 1000 /* 3min */
        ),
    });

    btnList.add({
        name: i18next.t("download", { fileType: "MIDI" }),
        action: BtnAction.download(
            () => getFileUrl(scoreinfo.id, "midi"),
            fallback,
            30 * 1000 /* 30s */
        ),
    });

    btnList.add({
        name: i18next.t("download", { fileType: "MP3" }),
        action: BtnAction.download(
            () => getFileUrl(scoreinfo.id, "mp3"),
            fallback,
            30 * 1000 /* 30s */
        ),
    });

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    btnList.commit(BtnListMode.InPage);
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
waitForSheetLoaded().then(main);
