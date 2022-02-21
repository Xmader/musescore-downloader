# dl-musescore

<div align="center">

<img src="images/logo.png" width="256" alt="LibreScore logo">

[![Discord](https://img.shields.io/discord/774491656643674122?color=5865F2&label=&labelColor=555555&logo=discord&logoColor=FFFFFF)](https://discord.gg/DKu7cUZ4XQ) [![Github All Releases](https://img.shields.io/github/downloads/LibreScore/app-librescore/total.svg?label=App)](https://github.com/LibreScore/app-librescore/releases/latest) [![Github All Releases](https://img.shields.io/github/downloads/LibreScore/dl-musescore/total.svg?label=Browser+extension)](https://github.com/LibreScore/dl-musescore/releases/latest) [![npm](https://img.shields.io/npm/dt/musescore-dl?label=Command-line+tool)](https://www.npmjs.com/package/musescore-dl)

Download sheet music from MuseScore

</div>

> DISCLAIMER: This is not an officially supported MuseScore product

## Installation

There are 4 different installable programs:

| Program                                                                             | MSCZ | MIDI | MP3 | PDF | Conversion |     | Windows | macOS | Linux | Android | iOS/iPadOS |
| ----------------------------------------------------------------------------------- | ---- | ---- | --- | --- | ---------- | --- | ------- | ----- | ----- | ------- | ---------- |
| [App](https://github.com/LibreScore/app-librescore#app)                             | ✔️   | ✔️   | ✔️  | ❌  | ❌         |     | ✔️      | ✔️    | ❌    | ✔️      | ❌         |
| [Userscript](https://github.com/LibreScore/app-librescore#userscript)               | ❌   | ✔️   | ✔️  | ✔️  | ❌         |     | ✔️      | ✔️    | ✔️    | ✔️      | ✔️         |
| [Command-line tool](https://github.com/LibreScore/app-librescore#command-line-tool) | ❌   | ✔️   | ✔️  | ✔️  | ✔️         |     | ✔️      | ✔️    | ✔️    | ✔️      | ❌         |
| [Webmscore](https://github.com/LibreScore/app-librescore#webmscore)                 | ❌   | ❌   | ❌  | ❌  | ✔️         |     | ✔️      | ✔️    | ✔️    | ✔️      | ✔️         |

> Note: `Conversion` refers to the ability to convert files into other file types, including those not downloadable in the program.
> Conversion targets include: Individual Parts, PDF, PNG, SVG, MP3, WAV, FLAC, OGG, MIDI, MusicXML, MSCZ, and MSCX

### App

1. Go to the [README](https://github.com/LibreScore/app-librescore#installation) page of the `app-librescore` repository
2. Follow the installation instructions for your device to install it

### Userscript

> Note: If your device is on iOS or iPadOS, please follow the [Shortcut](https://github.com/LibreScore/dl-musescore#shortcut) instructions

> Note: If you cannot install browser extensions on your device, please follow the [Bookmark](https://github.com/LibreScore/dl-musescore#bookmark) instructions instead

#### Browser extension

1. Install [Tampermonkey](https://www.tampermonkey.net)

> Note: If you already installed an old version of the script called "musescore-downloader" or "mcsz downloader", please uninstall it from the Tampermonkey dashboard

2. Go to the latest [dl-musescore.user.js](https://github.com/LibreScore/dl-musescore/releases/latest/download/dl-musescore.user.js) file
3. Press the Install button

> Note: When using Google Chrome, the download buttons might not be visible. Instead, you can access the download buttons in the Tampermonkey menu by clicking the Tampermonkey extension icon in the browser toolbar

#### Shortcut

1. Install the [LibreScore shortcut](https://www.icloud.com/shortcuts/9a4ae92b785c443cb4302fb88229af8a)
2. In Safari, when viewing a song on MuseScore, tap <img src="https://help.apple.com/assets/61800C7E6EA4632586448084/61800C896EA463258644809A/en_US/01f5a9889bbecc202d8cbb3067a261ad.png" height="16">
3. Tap the LibreScore shortcut to activate the extension

> Note: Before you can run JavaScript from a shortcut you must turn on Allow Running Scripts
>
> 1. Go to Settings <img src="https://help.apple.com/assets/61800C7E6EA4632586448084/61800C896EA463258644809A/en_US/492fec5aff74dbdef9b526177c3804b4.png" height="16"> > Shortcuts > Advanced
> 2. Turn on Allow Running Scripts

#### Bookmark

1. Create a new bookmark (usually Ctrl+D)
2. Type `LibreScore` for the Name field
3. Type `javascript:(function () {let code = document.createElement('script');code.src = 'https://github.com/LibreScore/dl-musescore/releases/latest/download/dl-musescore.user.js';document.body.appendChild(code);}())` for the URL field
4. Save the bookmark
5. When viewing a song on MuseScore, click the bookmark to activate the extension

### Command-line tool

1. Install [Node.js LTS](https://nodejs.org)
2. Open a terminal (do _not_ open the Node.js application)
3. Type `npx musescore-dl@latest`, then press `Enter ↵`

### Webmscore

1. Open [Webmscore](https://librescore.github.io)

> Note: You can access the website offline by installing it as a PWA

## Building

1. Install [Node.js LTS](https://nodejs.org)
2. `npm install` to install packages
3. `npm run build` to build

- Install `./dist/main.user.js` with Tampermonkey
- `node ./dist/cli.js` to run command-line tool
