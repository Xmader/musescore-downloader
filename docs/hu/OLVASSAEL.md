<div dir="ltr" align="left">

&#8206;[English](/docs/en/README.md) | &#8206;[español](/docs/es/LÉAME.md) | &#8206;[français](/docs/fr/LISEZMOI.md) | &#8206;**magyar** | &#8206;[Melayu](/docs/ms/BACASAYA.md) | &#8206;[[+]](https://librescore.ddns.net/projects/librescore/docs)

[//]: # "\+\_==!|!=_=!|!==_/+/ ***NE MÓDOSÍTS SEMMIT E SOR FELETT*** /+/^^+#|#+^+#|#+^^\+\"

# dl-librescore

<div align="center">

<img src="https://github.com/LibreScore/dl-musescore/raw/master/images/logo.png" width="256" alt="LibreScore logó">

[![Discord](https://img.shields.io/discord/774491656643674122?color=5865F2&label=&labelColor=555555&logo=discord&logoColor=FFFFFF)](https://discord.gg/DKu7cUZ4XQ) [![Weblate](https://librescore.ddns.net/widgets/librescore/-/dl-librescore/svg-badge.svg)](https://librescore.ddns.net/engage/librescore) [![Github minden verzió](https://img.shields.io/github/downloads/LibreScore/app-librescore/total.svg?label=App)](https://github.com/LibreScore/app-librescore/releases/latest) [![Github minden verzió](https://img.shields.io/github/downloads/LibreScore/dl-librescore/total.svg?label=Userscript)](https://github.com/LibreScore/dl-librescore/releases/latest) [![npm](https://img.shields.io/npm/dt/dl-librescore?label=Parancssoros+program)](https://www.npmjs.com/package/dl-librescore)

Kotta letöltése

</div>

> NYILATKOZAT: Ez nem egy hivatalosan jóváhagyott MuseScore termék

## Telepítés

4 különböző telepíthető program van:

| Program                                                                            | MSCZ | MIDI | MP3 | PDF | Konvertálás |     | Windows | macOS | Linux | Android | iOS/iPadOS |
| ---------------------------------------------------------------------------------- | ---- | ---- | --- | --- | ---------- | --- | ------- | ----- | ----- | ------- | ---------- |
| [App](#app)                             | ✔️   | ✔️   | ✔️  | ❌  | ❌         |     | ✔️      | ✔️    | ❌    | ✔️      | ❌         |
| [Userscript](#userscript)               | ❌   | ✔️   | ✔️  | ✔️  | ❌         |     | ✔️      | ✔️    | ✔️    | ✔️      | ✔️         |
| [Parancssoros program](#parancssoros-program) | ❌   | ✔️   | ✔️  | ✔️  | ✔️         |     | ✔️      | ✔️    | ✔️    | ✔️      | ❌         |
| [Webmscore weboldal](#webmscore-weboldal) | ❌   | ❌   | ❌  | ❌  | ✔️         |     | ✔️      | ✔️    | ✔️    | ✔️      | ✔️         |

> Megjegyzés: A `Konvertálás` a fájltípus megváltoztatására használható, olyan fájl típusra is konvertálhatsz amiben esetleg nem is tudtad letölteni a kottát.
> Ezekre lehet konvertálni: Külön szólamok(szétsztedi különboző fájlba a szólamokat), PDF, PNG, SVG, MP3, WAV, FLAC, OGG, MIDI, MusicXML, MSCZ és MSCX.

### App

1. Menj a `app-librescore` repository [OLVASSAEL](https://github.com/LibreScore/app-librescore/blob/master/docs/hu/OLVASSAEL.md#telepítés) oldalára
2. Kövesd a telepítési utasításokat az eszközödhöz

### Userscript

> Megjegyzés: Ha iPhone vagy iPad eszközöd van, akkor kövesd [ezeket](#shortcut) az utasításokat.
>
> Megjegyzés: Ha nem tudod telepíteni a böngésző bővítményt az eszközödön, akkor a [Könyvjelző](#bookmark) utasításokat kövesd.

#### Böngésző bővítmény

1. Telepítés [Tampermonkey](https://www.tampermonkey.net)

> Megjegyzés: Ha korábban már telepítetted a "musescore-downloader", "mcsz downloader", "mcsz downloader" vagy "musescore-dl" nevű script egy régebbi verzióját, távolítsd el a Tampermonkey kezelőfalról.

2. Keresd meg a legfrissebb [dl-librescore.user.js](https://github.com/LibreScore/dl-librescore/releases/latest/download/dl-librescore.user.js) fájlt
3. Nyomd meg a Telepítés gombot

#### Parancs

1. Telepítsd a [LibreScore parancs-ot](https://www.icloud.com/shortcuts/901d8778d2da4f7db9272d3b2232d0fe)
2. A Safari-ban, amikor nézel egy kottát a MuseScore weboldalon nyomj rá <img src="https://help.apple.com/assets/61800C7E6EA4632586448084/61800C896EA463258644809A/en_US/01f5a9889bbecc202d8cbb3067a261ad.png" height="16">
3. Nyomj rá a LibreScore parancs-ra a bővítmény aktiválásához

> Megjegyzés: Mielőtt futtatni tudod a JavaScript-et a paranccsal, engedélyezned kell a Szkriptek futtatását.
>
> 1. Menj a beállításokba <img src="https://help.apple.com/assets/61800C7E6EA4632586448084/61800C896EA463258644809A/en_US/492fec5aff74dbdef9b526177c3804b4.png" height="16"> > Parancsok > Haladó
> 2. Engedélyezd a "Szkriptek futtatásának engedélyezése" lehetőséget

#### Könyvjelző

1. Adj hozzá egy új könyvjelzőt (általában Ctrl+D)
2. A Név mezőbe ezt add meg: `LibreScore`
3. Az URL mezőbe a következőt add meg: `javascript:(function () {let code = document.createElement('script');code.src = 'https://github.com/LibreScore/dl-librescore/releases/latest/download/dl-librescore.user.js';document.body.appendChild(code);}())`
4. Mentsd el a könyvjelzőt
5. Amikor megnyitottál egy kottát MuseScore-on, akkor kattints a könyvjelzőre a bővítmény aktiválásához

### Parancssoros program

1. Telepítsd a [Node.js LTS-t](https://nodejs.org)
2. Nyisd meg a terminált (_NE_ nyisd meg a Node.js programot)
3. Írd be hogy: `npx dl-librescore@latest`, majd nyomj`Enter-t ↵`

### Webmscore weboldal

1. [Webmscore](https://librescore.github.io) megnyitása

> Megjegyzés: Hozzáférhetsz a weboldalhoz internet nélkül is, ha telepíted PWA-ként

## Összeállítás

1. [Node.js LTS](https://nodejs.org) telepítése
2. Használd az `npm install` parancsot a csomagok telepítéséhez
3. Használd az `npm run build` parancsot a program összeállításához.

- Használd a `./dist/main.user.js` parancsot a Tampermonkey-val való telepítéshez
- Használd a `node ./dist/cli.js` parancsot, a Parancssoros program futtatásához

</div>
