# dl-musescore

<div align="center">

<img src="images/logo.png" width="256" alt="LibreScore logo">

[![Discord](https://img.shields.io/discord/774491656643674122?color=5865F2&label=&labelColor=555555&logo=discord&logoColor=FFFFFF)](https://discord.gg/DKu7cUZ4XQ) [![Github All Releases](https://img.shields.io/github/downloads/LibreScore/app-librescore/total.svg?label=App)](https://github.com/LibreScore/app-librescore/releases/latest) [![Github All Releases](https://img.shields.io/github/downloads/LibreScore/dl-musescore/total.svg?label=Browser+extension)](https://github.com/LibreScore/dl-musescore/releases/latest) [![npm](https://img.shields.io/npm/dt/musescore-dl?label=Command-line+tool)](https://www.npmjs.com/package/musescore-dl)

Download sheet music from MuseScore

</div>

> DISCLAIMER: This is not an officially supported MuseScore product

## Installation

There are 4 different installable programs:

| Program           | MSCZ | MIDI | PDF | MP3 | Conversion |     | Windows | macOS | Linux | Android | iOS |
| ----------------- | ---- | ---- | --- | --- | ---------- | --- | ------- | ----- | ----- | ------- | --- |
| App               | ✔️   | ✔️   | ❌  | ✔️  | ❌         |     | ✔️      | ✔️    | WIP   | ✔️      | ❌  |
| Browser extension/Bookmark | ❌   | ✔️   | ✔️  | ✔️  | ❌         |     | ✔️      | ✔️    | ✔️    | ✔️      | ❌  |
| Command-line tool | ❌   | ✔️   | ✔️  | ✔️  | ✔️         |     | ✔️      | ✔️    | ✔️    | ✔️      | ❌  |
| Webmscore         | ❌   | ❌   | ❌  | ❌  | ✔️         |     | ✔️      | ✔️    | ✔️    | ✔️      | ✔️  |

> Note: `Conversion` refers to the ability to convert files into other file types, including those not downloadable in the program.
> Conversion targets include: Individual Parts, PDF, PNG, SVG, MP3, WAV, FLAC, OGG, MIDI, MusicXML, MSCZ, and MSCX.

### App

1. Go to the [Releases](https://github.com/LibreScore/app-librescore/releases/latest) page of the `app-librescore` repository
2. Download the latest version for your device
3. Follow the installation instructions for your device to install it

### Browser extension/Bookmark

> Note: If you cannot install browser extensions on your computer, please follow the [Bookmark](https://github.com/LibreScore/dl-musescore#bookmark) instructions

#### Browser extension

1. Install [Tampermonkey](https://www.tampermonkey.net)
> Note: If you already installed an old version of the script called "musescore-downloader" or "mcsz downloader", please uninstall it from the Tampermonkey dashboard
2. Go to the latest [dl-musescore.user.js](https://github.com/LibreScore/dl-musescore/releases/latest/download/dl-musescore.user.js) file
3. Press the Install button
> Note: When using Google Chrome, the download buttons might not be visible. Instead, you can access the download buttons in the Tampermonkey menu, by clicking the Tampermonkey extension icon the the browser toolbar

#### Bookmark

1. Create a new bookmark (usually Ctrl+D)
2. Type `LibreScore` for the Name field
3. Type `javascript:(function () {let code = document.createElement('script');code.src = 'https://github.com/LibreScore/dl-musescore/releases/latest/download/dl-musescore.user.js';document.body.appendChild(code);}())` for the URL field
4. Save the bookmark
5. When viewing a song on MuseScore, click the bookmark to activate the extension
> Credit to [RuralAnemone](https://github.com/RuralAnemone)

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
