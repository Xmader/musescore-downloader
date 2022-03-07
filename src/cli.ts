/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-void */

import fs from "fs";
import path from "path";
import os from "os";
import { setMscz } from "./mscz";
import { loadMscore, INDV_DOWNLOADS, WebMscore } from "./mscore";
import { ScoreInfoHtml, ScoreInfoObj } from "./scoreinfo";
import { WEBMSCORE_URL, fetchBuffer } from "./utils";
import { isNpx, getVerInfo } from "./npm-data";
import { getFileUrl } from "./file";
import { exportPDF } from "./pdf";
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

const inquirer: typeof import("inquirer") = require("inquirer");
const ora: typeof import("ora") = require("ora");
const chalk: typeof import("chalk") = require("chalk");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const argv: any = yargs(hideBin(process.argv))
    .usage("Usage: $0 [options]")
    .example(
        "$0 -i https://musescore.com/user/123/scores/456 -t mp3 -o " +
            process.cwd(),
        "download MP3 of URL to specified directory"
    )
    .example(
        "$0 -i path/to/folder -t midi pdf",
        "export MIDI and PDF of all files in specified folder to current folder"
    )
    .example(
        "$0 -i path/to/file.mxl -t flac",
        "export FLAC of specified MusicXML file to current folder"
    )
    .option("input", {
        alias: "i",
        type: "string",
        description: "URL, file, or folder to download or convert from",
        requiresArg: true,
    })
    .option("type", {
        alias: "t",
        type: "array",
        description: "Type of files to download",
        requiresArg: true,
        choices: [
            "midi",
            "mp3",
            "pdf",
            "mscz",
            "mscx",
            "musicxml",
            "flac",
            "ogg",
        ],
    })
    .option("output", {
        alias: "o",
        type: "string",
        description: "Folder to save files to",
        requiresArg: true,
        default: process.cwd(),
    })
    .option("verbose", {
        alias: "v",
        type: "boolean",
        description: "Run with verbose logging",
    })
    .alias("help", "h")
    .alias("version", "V").argv;

const SCORE_URL_PREFIX = "https://musescore.com/";
// const SCORE_URL_REG = /https:\/\/(s\.)?musescore\.com\//;
const SCORE_URL_REG = /^(?:https?:\/\/)(?:(?:s|www)\.)?musescore\.com\/[^\s]+$/;

type ExpDlType = "midi" | "mp3" | "pdf";

interface Params {
    fileInit: string;
    confirmed: boolean;
    useExpDL: boolean;
    expDlTypes: ExpDlType[];
    part: number;
    types: number[];
    dest: string;
}

/**
 * Prompt for destination directory
 */
const promptDest = async () => {
    const { dest } = await inquirer.prompt<Params>({
        type: "input",
        name: "dest",
        message: "Destination Directory:",
        validate(input: string) {
            return input && fs.statSync(input).isDirectory();
        },
        default: argv.output,
    });
    return dest;
};

const createSpinner = () => {
    return ora({
        text: i18next.t("processing"),
        color: "blue",
        spinner: "bounce",
        indent: 0,
    }).start();
};

const checkboxValidate = (input: number[]) => {
    return input.length >= 1;
};

void (async () => {
    if (!isNpx()) {
        const { installed, latest, isLatest } = await getVerInfo();
        if (!isLatest) {
            console.log(
                chalk.yellowBright(
                    `\nYour installed version (${installed}) of the musescore-dl CLI is not the latest one (${latest})!\nRun npm i -g musescore-dl@${latest} to update.`
                )
            );
        }
    }

    let isInteractive = true;
    let types;
    let filetypes;

    // Check if both input and type arguments are used
    if (argv.input && argv.type) {
        isInteractive = false;
    }

    if (isInteractive) {
        argv.verbose = true;
        // Determine platform and paste message
        const platform = os.platform();
        let pasteMessage = "";
        if (platform === "win32") {
            pasteMessage = "right-click to paste";
        } else if (platform === "linux") {
            pasteMessage = "usually Ctrl+Shift+V to paste";
        } // For MacOS, no hint is needed because the paste shortcut is universal.

        // ask for the page url or path to local file
        const { fileInit } = await inquirer.prompt<Params>({
            type: "input",
            name: "fileInit",
            message: "MuseScore URL or path to file or folder:",
            suffix:
                "\n  " +
                `(starts with "${SCORE_URL_PREFIX}" or is a path) ` +
                `${chalk.bgGray(pasteMessage)}\n `,
            validate(input: string) {
                return (
                    input &&
                    (!!input.match(SCORE_URL_REG) ||
                        fs.statSync(input).isFile() ||
                        fs.statSync(input).isDirectory())
                );
            },
            default: argv.input,
        });

        argv.input = fileInit;
    }

    const spinner = createSpinner();

    // Check if input is a file or directory
    let isFile: boolean;
    let isDir: boolean;
    try {
        isFile = fs.lstatSync(argv.input).isFile();
        isDir = fs.lstatSync(argv.input).isDirectory();
    } catch (_) {
        isFile = false;
        isDir = false;
    }

    // Check if local file or directory
    if (isFile || isDir) {
        let filePaths: string[] = [];

        if (isDir) {
            if (!(argv.input.endsWith("/") || argv.input.endsWith("\\"))) {
                argv.input += "/";
            }
            await fs.promises
                .readdir(argv.input, { withFileTypes: true })
                .then((files) =>
                    files.forEach((file) => {
                        try {
                            if (file.isDirectory()) {
                                return;
                            }
                        } catch (err) {
                            spinner.fail(err.message);
                            return;
                        }
                        filePaths.push(argv.input + file.name);
                    })
                );

            if (isInteractive) {
                if (argv.type) {
                    argv.type[argv.type.findIndex((e) => e === "musicxml")] =
                        "mxl";
                    argv.type[argv.type.findIndex((e) => e === "midi")] = "mid";
                    types = argv.type.map((e) =>
                        INDV_DOWNLOADS.findIndex((f) => f.fileExt === e)
                    );
                }
                // build filetype choices
                const typeChoices = INDV_DOWNLOADS.map((d, i) => ({
                    name: d.name,
                    value: i,
                }));
                // filetype selection
                spinner.stop();
                types = await inquirer.prompt<Params>({
                    type: "checkbox",
                    name: "types",
                    message: "Filetype Selection",
                    choices: typeChoices,
                    validate: checkboxValidate,
                    pageSize: Infinity,
                    default: types,
                });
                spinner.start();

                types = types.types;

                // destination directory
                spinner.stop();
                const { dest } = await inquirer.prompt<Params>({
                    type: "input",
                    name: "dest",
                    message: "Destination Directory:",
                    validate(input: string) {
                        return input && fs.statSync(input).isDirectory();
                    },
                    default: argv.output,
                });
                spinner.start();
                argv.output = dest;
            }
        } else {
            filePaths.push(argv.input);
        }

        // for await (const filePath of filePaths) {
        await Promise.all(
            filePaths.map(async (filePath) => {
                // validate input file
                if (!fs.statSync(filePath).isFile()) {
                    spinner.fail("File does not exist");
                    return;
                }

                if (!isInteractive) {
                    // validate types
                    if (argv.type.length === 0) {
                        spinner.fail("No types chosen");
                        return;
                    }
                }

                let inputFileExt = path.extname(filePath).substring(1);

                if (inputFileExt === "mid") {
                    inputFileExt = "midi";
                }
                if (
                    ![
                        "gp",
                        "gp3",
                        "gp4",
                        "gp5",
                        "gpx",
                        "gtp",
                        "kar",
                        "midi",
                        "mscx",
                        "mscz",
                        "musicxml",
                        "mxl",
                        "ptb",
                        "xml",
                    ].includes(inputFileExt)
                ) {
                    spinner.fail(
                        "Invalid file extension, only gp, gp3, gp4, gp5, gpx, gtp, kar, mid, midi, mscx, mscz, musicxml, mxl, ptb, xml are supported"
                    );
                    return;
                }

                // get scoreinfo
                let scoreinfo = new ScoreInfoObj(
                    0,
                    path.basename(filePath, "." + inputFileExt)
                );

                // load file
                let score: WebMscore;
                let metadata: import("webmscore/schemas").ScoreMetadata;
                try {
                    // load local file
                    const data = await fs.promises.readFile(filePath);
                    await setMscz(scoreinfo, data.buffer);
                    if (argv.verbose) {
                        spinner.info("File loaded");
                        spinner.start();
                    }
                    // load score using webmscore
                    score = await loadMscore(inputFileExt, scoreinfo);

                    if (isInteractive && isFile) {
                        metadata = await score.metadata();
                    }

                    if (argv.verbose) {
                        spinner.info("Score loaded by webmscore");
                    }
                } catch (err) {
                    if (isFile || argv.verbose) {
                        spinner.fail(err.message);
                    }
                    if (argv.verbose) {
                        spinner.info(
                            "Try using the Webmscore website instead: " +
                                WEBMSCORE_URL
                        );
                    }
                    return;
                }

                let parts;
                if (isInteractive && isFile) {
                    // build part choices
                    const partChoices = metadata.excerpts.map((p) => ({
                        name: p.title,
                        value: p.id,
                    }));
                    console.log(partChoices);
                    // add the "full score" option as a "part"
                    partChoices.unshift({
                        value: -1,
                        name: i18next.t("full_score"),
                    });

                    // part selection
                    spinner.stop();
                    parts = await inquirer.prompt<Params>({
                        type: "checkbox",
                        name: "parts",
                        message: "Part Selection",
                        choices: partChoices,
                        validate: checkboxValidate,
                        pageSize: Infinity,
                    });
                    spinner.start();
                    console.log(parts);
                    parts = partChoices.filter((e) =>
                        parts.parts.includes(e.value)
                    );
                    console.log(parts);
                } else {
                    parts = [{ name: i18next.t("full_score"), value: -1 }];
                }

                if (argv.type) {
                    argv.type[argv.type.findIndex((e) => e === "musicxml")] =
                        "mxl";
                    argv.type[argv.type.findIndex((e) => e === "midi")] = "mid";
                    types = argv.type.map((e) =>
                        INDV_DOWNLOADS.findIndex((f) => f.fileExt === e)
                    );
                }
                if (isInteractive && isFile) {
                    // build filetype choices
                    const typeChoices = INDV_DOWNLOADS.map((d, i) => ({
                        name: d.name,
                        value: i,
                    }));
                    // filetype selection
                    spinner.stop();
                    types = await inquirer.prompt<Params>({
                        type: "checkbox",
                        name: "types",
                        message: "Filetype Selection",
                        choices: typeChoices,
                        validate: checkboxValidate,
                        pageSize: Infinity,
                        default: types,
                    });
                    spinner.start();

                    types = types.types;
                }

                filetypes = types.map((i) => INDV_DOWNLOADS[i]);

                if (isInteractive && isFile) {
                    // destination directory
                    spinner.stop();
                    const { dest } = await inquirer.prompt<Params>({
                        type: "input",
                        name: "dest",
                        message: "Destination Directory:",
                        validate(input: string) {
                            return input && fs.statSync(input).isDirectory();
                        },
                        default: argv.output,
                    });
                    spinner.start();
                    argv.output = dest;
                }

                // validate destination directory
                try {
                    await fs.promises.access(argv.output);
                } catch (err) {
                    spinner.fail(err.message);
                    return;
                }

                // export files
                const fileName =
                    scoreinfo.fileName || (await score.titleFilenameSafe());
                // spinner.start();
                await Promise.all(
                    filetypes.map(async (type) => {
                        await Promise.all(
                            parts.map(async (part) => {
                                // select part
                                await score.setExcerptId(part.id);

                                // generate file data
                                const data = await type.action(score);

                                // save to filesystem
                                const n = `${fileName} - ${part.name}.${type.fileExt}`;
                                const f = path.join(argv.output, n);
                                await fs.promises.writeFile(f, data);
                                if (argv.verbose) {
                                    spinner.info(`Saved ${chalk.underline(f)}`);
                                }
                            })
                        );
                    })
                );
            })
        );
        spinner.succeed("OK");
        return;
    } else {
        // validate input URL
        if (!argv.input.match(SCORE_URL_REG)) {
            spinner.fail("Invalid URL");
            return;
        }
        argv.input = argv.input.match(SCORE_URL_REG)[0];

        // validate types
        if (!isInteractive) {
            if (argv.type.length === 0) {
                spinner.fail("No types chosen");
                return;
            } else if (
                ["mscz", "mscx", "musicxml", "flac", "ogg"].some((e) =>
                    argv.type.includes(e)
                )
            ) {
                // Fail since user cannot download these types from a URL
                spinner.fail("Can only download MIDI, MP3, and PDF from a URL");
                return;
            }
        }

        // request scoreinfo
        let scoreinfo: ScoreInfoHtml = await ScoreInfoHtml.request(argv.input);

        // validate musescore URL
        if (scoreinfo.id === 0) {
            spinner.fail("Score not found");
            return;
        }

        if (isInteractive) {
            // confirmation
            spinner.stop();
            const { confirmed } = await inquirer.prompt<Params>({
                type: "confirm",
                name: "confirmed",
                message: "Continue?",
                prefix:
                    `${chalk.yellow("!")} ` +
                    `ID: ${scoreinfo.id}\n  ` +
                    `Title: ${scoreinfo.title}\n `,
                default: true,
            });
            if (!confirmed) return;

            // print a blank line
            console.log();
            spinner.start();
        } else {
            // print message if verbosity is enabled
            if (argv.verbose) {
                spinner.stop();
                console.log(
                    `${chalk.yellow("!")} ` +
                        `ID: ${scoreinfo.id}\n  ` +
                        `Title: ${scoreinfo.title}\n `
                );
                spinner.start();
            }
        }

        if (argv.type) {
            types = argv.type;
        }
        if (isInteractive) {
            // filetype selection
            spinner.stop();
            types = await inquirer.prompt<Params>({
                type: "checkbox",
                name: "types",
                message: "Filetype Selection",
                choices: ["midi", "mp3", "pdf"],
                validate: checkboxValidate,
                pageSize: Infinity,
                default: types,
            });
            types = types.types;

            // destination directory
            const { dest } = await inquirer.prompt<Params>({
                type: "input",
                name: "dest",
                message: "Destination Directory:",
                validate(input: string) {
                    return input && fs.statSync(input).isDirectory();
                },
                default: argv.output,
            });
            spinner.start();
            argv.output = dest;
        }

        // validate destination directory
        try {
            await fs.promises.access(argv.output);
        } catch (err) {
            spinner.fail(err.message);
            return;
        }

        await Promise.all(
            types.map(async (type) => {
                // download/generate file data
                let fileExt: String;
                let fileData: Buffer;
                switch (type) {
                    case "midi": {
                        fileExt = "mid";
                        const fileUrl = await getFileUrl(scoreinfo.id, "midi");
                        fileData = await fetchBuffer(fileUrl);
                        break;
                    }
                    case "mp3": {
                        fileExt = "mp3";
                        const fileUrl = await getFileUrl(scoreinfo.id, "mp3");
                        fileData = await fetchBuffer(fileUrl);
                        break;
                    }
                    case "pdf": {
                        fileExt = "pdf";
                        fileData = Buffer.from(
                            await exportPDF(scoreinfo, scoreinfo.sheet)
                        );
                        break;
                    }
                }

                // save to filesystem
                const f = path.join(
                    argv.output,
                    `${scoreinfo.fileName}.${fileExt}`
                );
                await fs.promises.writeFile(f, fileData);
                if (argv.verbose) {
                    spinner.info(`Saved ${chalk.underline(f)}`);
                }
            })
        );

        spinner.succeed("OK");
        return;
    }
})();
