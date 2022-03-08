import i18n from "i18next";
import ar from "./ar.json";
import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import it from "./it.json";
import ja from "./ja.json";
import ko from "./ko.json";
import ru from "./ru.json";
import zh_Hans from "./zh-Hans.json";

export default i18n.init({
    compatibilityJSON: "v3",
    lng: Intl.DateTimeFormat().resolvedOptions().locale,
    fallbackLng: "en",
    resources: {
        ar: { translation: ar },
        en: { translation: en },
        es: { translation: es },
        fr: { translation: fr },
        it: { translation: it },
        ja: { translation: ja },
        ko: { translation: ko },
        ru: { translation: ru },
        "zh-Hans": { translation: zh_Hans },
    },
});

export const i18next = i18n;
