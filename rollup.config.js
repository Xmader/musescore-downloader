import typescript from "rollup-plugin-typescript"
import fs from "fs"

const getBannerText = () => {
    const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf-8"))
    const { version } = packageJson
    let bannerText = fs.readFileSync("./src/meta.js", "utf-8")
    bannerText = bannerText.replace("%VERSION%", version)
    return bannerText
}

export default {
    input: "src/main.ts",
    output: {
        file: "dist/main.js",
        format: "iife",
        sourcemap: false,
        banner: getBannerText,
        intro: "if (!window.UGAPP || !window.UGAPP.store || !window.UGAPP.store.jmuse_settings) { return }"
    },
    plugins: [
        typescript({
            target: "ES6",
            sourceMap: false,
            lib: [
                "ES6",
                "dom"
            ],
        }),
    ]
}
