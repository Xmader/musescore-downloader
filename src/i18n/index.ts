import i18n from "i18next";
import ar from "./ar.json";
import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import it from "./it.json";
import ja from "./ja.json";
import ko from "./ko.json";
import ms from "./ms.json";
import ru from "./ru.json";
import zh_Hans from "./zh-Hans.json";

function getLocale(): string {
    let languageMap = [
        "ar",
        "en",
        "es",
        "fr",
        "it",
        "ja",
        "ko",
        "ms",
        "ru",
        "zh-Hans",
    ];

    let locale: string = "en";
    if (typeof window !== "undefined") {
        let localeOrder = navigator.languages?.concat(
            Intl.DateTimeFormat().resolvedOptions().locale
        ) ?? ["en"];
        let localeArray = Object.values(languageMap).map((arr) => arr[0]);

        localeOrder.some((localeItem) => {
            if (localeArray.includes(localeItem)) {
                locale = localeItem;
                return true;
            } else if (localeArray.includes(localeItem.substring(0, 2))) {
                locale = localeItem.substring(0, 2);
                return true;
            } else if (
                localeArray.some((locale) =>
                    locale.startsWith(localeItem.substring(0, 2))
                )
            ) {
                locale = localeArray.find((locale) =>
                    locale.startsWith(localeItem.substring(0, 2))
                )!;
                return true;
            }
        });
        if (locale === "en") {
            if (
                [
                    "ab",
                    "et",
                    "kk",
                    "ky",
                    "lv",
                    "os",
                    "ro-MD",
                    "ru",
                    "tg",
                    "uk",
                    "uz",
                ].some((e) => localeOrder[0].startsWith(e)) &&
                localeArray.includes("ru")
            ) {
                locale = "ru";
            } else {
                locale = "en";
            }
        }
    }
    return locale;
}

export default i18n.init({
    compatibilityJSON: "v3",
    lng: getLocale(),
    fallbackLng: "en",
    resources: {
        ar: { translation: ar },
        en: { translation: en },
        es: { translation: es },
        fr: { translation: fr },
        it: { translation: it },
        ja: { translation: ja },
        ko: { translation: ko },
        ms: { translation: ms },
        ru: { translation: ru },
        "zh-Hans": { translation: zh_Hans },
    },
});

export const i18next = i18n;
