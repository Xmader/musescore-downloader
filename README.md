# musescore-dl

<img src="images/logo.png" width="256" alt="LibreScore logo">

[![Discord](https://img.shields.io/discord/774491656643674122?color=5865F2&label=&labelColor=555555&logo=discord&logoColor=FFFFFF)](https://discord.gg/DKu7cUZ4XQ) [![Github All Releases](https://img.shields.io/github/downloads/LibreScore/musescore-dl/total.svg)](https://github.com/LibreScore/musescore-dl/releases/latest)

Download sheet music from Musescore

> DISCLAIMER: This is not an officially supported Musescore product

## Installation

There are 3 different installable programs:

| Program           | `MSCZ` | MIDI | PDF | MP3 | Conversion |     | Windows | macOS | Linux | Android | iOS |
| ----------------- | ------ | ---- | --- | --- | ---------- | --- | ------- | ----- | ----- | ------- | --- |
| App               | ✔️     | ✔️   | ❌  | ✔️  | ✔️         |     | ✔️      | ✔️    | WIP   | ✔️      | ❌  |
| Browser extension | ❌     | ✔️   | ✔️  | ✔️  | ❌         |     | ✔️      | ✔️    | ✔️    | ✔️      | ❌  |
| Command-line tool | ❌     | ✔️   | ✔️  | ✔️  | ✔️         |     | ✔️      | ✔️    | ✔️    | ✔️      | ❌  |

> Note: `Conversion` refers to the ability to convert MSCZ files into any other file type, including those not downloadable in the program.

### App

1. Go to the [Releases](https://github.com/LibreScore/librescore-app/releases/latest) page of the librescore-app repository
2. Download the latest version for your device
3. Open the file to install it

### Browser extension

1. Install [Tampermonkey](https://www.tampermonkey.net)
2. Go to <https://github.com/LibreScore/musescore-dl/dist/main.user.js>
3. Press the Install button

### Command-line tool

1. Install [Node.js LTS](https://nodejs.org)
2. Open a terminal (do _not_ open the Node.js application)
3. Type `npx musescore-dl`, then press `Enter ↵`

## Building

1. Install [Node.js LTS](https://nodejs.org)
2. `npm install` to install packages
3. `npm run build` to build

-   Install `./dist/main.user.js` with Tampermonkey
-   `node ./dist/cli.js` to run command-line tool
