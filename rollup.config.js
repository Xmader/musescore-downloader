import typescript from "rollup-plugin-typescript";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import builtins from "rollup-plugin-node-builtins";
import nodeGlobals from "rollup-plugin-node-globals";
import json from "@rollup/plugin-json";
import { string } from "rollup-plugin-string";
import fs from "fs";

const getBannerText = () => {
    const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
    const { version } = packageJson;
    let bannerText = fs.readFileSync("./src/meta.js", "utf-8");
    bannerText = bannerText.replace("%VERSION%", version);
    return bannerText;
};

function modifyWrapper() {
    const js = fs.readFileSync("./dist/wrapper.js", "utf-8");
    const index = js
        .split(/\n/g)
        .findIndex((value) => value.includes("require$$0"));
    let startJs = js.split(/\n/g).slice(0, index);
    startJs.push(["  const i18next = instance;\n"]);
    startJs = startJs.join("\n");
    const endJs = js
        .split(/\n/g)
        .slice(index + 9 + fs.readdirSync("./src/i18n/").length - 1)
        .join("\n");
    fs.writeFileSync("./dist/wrapper.js", startJs + endJs);
}

const getWrapper = (startL, endL) => {
    if (startL === 3) {
        modifyWrapper();
    }
    const js = fs.readFileSync("./dist/wrapper.js", "utf-8");
    return js.split(/\n/g).slice(startL, endL).join("\n");
};

const basePlugins = [
    typescript({
        target: "ES6",
        sourceMap: false,
        allowJs: true,
        lib: ["ES6", "dom"],
    }),
    resolve({
        preferBuiltins: true,
        jsnext: true,
        extensions: [".js", ".ts"],
    }),
    commonjs({
        extensions: [".js", ".ts"],
    }),
    json(),
    string({
        include: "**/*.css",
    }),
    {
        /**
         * remove tslib license comments
         * @param {string} code
         * @param {string} id
         */
        transform(code, id) {
            if (id.includes("tslib")) {
                code = code.split(/\r?\n/g).slice(15).join("\n");
            }
            return {
                code,
            };
        },
    },
];

const plugins = [
    ...basePlugins,
    builtins(),
    nodeGlobals({
        dirname: false,
        filename: false,
        baseDir: false,
    }),
];

export default [
    {
        input: "src/worker.ts",
        output: {
            file: "dist/cache/worker.js",
            format: "iife",
            name: "worker",
            banner: "export const PDFWorker = function () { ",
            footer: "return worker\n}\n",
            sourcemap: false,
        },
        plugins,
    },
    {
        input: "src/wrapper.js",
        output: {
            file: "dist/wrapper.js",
            format: "iife",
            name: "wrapper",
            sourcemap: false,
        },
        plugins,
    },
    {
        input: "src/main.ts",
        output: {
            file: "dist/main.user.js",
            format: "iife",
            sourcemap: false,
            banner: getBannerText,
            intro: () => getWrapper(3, -10),
            outro: () => getWrapper(-10, -9),
        },
        plugins,
    },
    {
        input: "src/cli.ts",
        output: {
            file: "dist/cli.js",
            format: "cjs",
            banner: "#!/usr/bin/env node",
            sourcemap: false,
        },
        plugins: basePlugins,
    },
];
