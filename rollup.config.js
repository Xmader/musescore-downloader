import typescript from "rollup-plugin-typescript"
import resolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"
import builtins from "rollup-plugin-node-builtins"
import json from "@rollup/plugin-json"
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
        resolve({
            preferBuiltins: true,
            jsnext: true,
            extensions: [".js", ".ts"]
        }),
        commonjs({
            extensions: [".js", ".ts"]
        }),
        json(),
        builtins(),
    ]
}
