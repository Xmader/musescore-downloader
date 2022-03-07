import isNodeJs from "detect-node";

// detect browser language
export default (() => {
    let userLangs: readonly string[];
    if (!isNodeJs) {
        userLangs = navigator.languages;
    } else {
        const env = process.env;
        const l =
            env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE || "";
        userLangs = [l.slice(0, 2)];
    }

    const names = ["en", "es", "it", "zh"];
    const _lang = userLangs.find((l) => {
        // find the first occurrence of valid languages
        return names.includes(l);
    });
    return _lang || "en";
})();
