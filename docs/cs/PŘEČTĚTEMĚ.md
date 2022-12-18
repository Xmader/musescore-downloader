<div dir="ltr" align="left">

‎**čeština** | ‎[English](/docs/en/README.md) | ‎[español](/docs/es/LÉAME.md) | ‎[français](/docs/fr/LISEZMOI.md) | ‎[magyar](/docs/hu/OLVASSAEL.md) | ‎[Melayu](/docs/ms/BACASAYA.md) | ‎[[+]](https://librescore.ddns.net/projects/librescore/docs)

[//]: # "\+\_==!|!=_=!|!==_/+/ ***NEUPRAVUJTE NAD TENTO ŘÁDEK*** /+/^^+#|#+^+#|#+^^\+\"

# dl-librescore

<div align="center">

<img src="https://github.com/LibreScore/dl-musescore/raw/master/images/logo.png" width="256" alt="Logo LibreScore">

[![Discord](https://img.shields.io/discord/774491656643674122?color=5865F2&label=&labelColor=555555&logo=discord&logoColor=FFFFFF)](https://discord.gg/DKu7cUZ4XQ) [![Weblate](https://librescore.ddns.net/widgets/librescore/-/dl-librescore/svg-badge.svg)](https://librescore.ddns.net/engage/librescore) [![Github All Releases](https://img.shields.io/github/downloads/LibreScore/app-librescore/total.svg?label=App)](https://github.com/LibreScore/app-librescore/releases/latest) [![Github All Releases](https://img.shields.io/github/downloads/LibreScore/dl-librescore/total.svg?label=Userscript)](https://github.com/LibreScore/dl-librescore/releases/latest) [![npm](https://img.shields.io/npm/dt/dl-librescore?label=Command-line+tool)](https://www.npmjs.com/package/dl-librescore)

Stáhněte si noty

</div>

> UPOZORNĚNÍ: Toto není oficiálně schválený produkt MuseScore

## Instalace

Existují 4 různé instalovatelné programy:

| Program                                                                            | MSCZ | MIDI | MP3 | PDF | Conversion |     | Windows | macOS | Linux | Android | iOS/iPadOS |
| ---------------------------------------------------------------------------------- | ---- | ---- | --- | --- | ---------- | --- | ------- | ----- | ----- | ------- | ---------- |
| [App](#app)                             | ✔️   | ✔️   | ✔️  | ❌  | ❌         |     | ✔️      | ✔️    | ❌    | ✔️      | ❌         |
| [Userscript](#userscript)               | ❌   | ✔️   | ✔️  | ✔️  | ❌         |     | ✔️      | ✔️    | ✔️    | ✔️      | ✔️         |
| [Command-line tool](#command-line-tool) | ❌   | ✔️   | ✔️  | ✔️  | ✔️         |     | ✔️      | ✔️    | ✔️    | ✔️      | ❌         |
| [Webmscore website](#webmscore-website) | ❌   | ❌   | ❌  | ❌  | ✔️         |     | ✔️      | ✔️    | ✔️    | ✔️      | ✔️         |

> Poznámka: `Konverze` odkazuje na schopnost převádět soubory na jiné typy souborů, včetně těch, které nelze stáhnout v programu.
 > Mezi typy převodu patří: Jednotlivé části, PDF, PNG, SVG, MP3, WAV, FLAC, OGG, MIDI, MusicXML, MSCZ a MSCX.

### Aplikace

1. Přejděte na stránku [README](https://github.com/LibreScore/app-librescore#installation) v repozitáři `app-librescore`
 2. Postupujte podle pokynů k instalaci vašeho zařízení

### Uživatelský skript

> Poznámka: Pokud máte zařízení se systémem iOS nebo iPadOS, postupujte podle pokynů [Zkratka](#shortcut).
 >
 > Poznámka: Pokud do zařízení nemůžete nainstalovat rozšíření prohlížeče, postupujte podle pokynů [Záložka](#bookmark).

#### Rozšíření prohlížeče

1. Nainstalujte [Tampermonkey](https://www.tampermonkey.net)

> Poznámka: Pokud jste již nainstalovali starou verzi skriptu s názvem „musescore-downloader“, „mcsz downloader“ nebo „musescore-dl“, odinstalujte ji prosím z řídicího panelu Tampermonkey

2. Přejděte na nejnovější soubor [dl-librescore.user.js](https://github.com/LibreScore/dl-librescore/releases/latest/download/dl-librescore.user.js)
 3. Stiskněte tlačítko Instalovat

#### Zkratka

1. Nainstalujte [zkratku LibreScore](https://www.icloud.com/shortcuts/901d8778d2da4f7db9272d3b2232d0fe)
 2. V Safari při prohlížení skladby na MuseScore klepněte na <img src="https://help.apple.com/assets/61800C7E6EA4632586448084/61800C896EA463258644809A/en_US/01b6p5a2063160901b6p5c8c263160
 3. Klepnutím na zástupce LibreScore aktivujte rozšíření

> Poznámka: Než budete moci spouštět JavaScript ze zástupce, musíte zapnout možnost Povolit spouštění skriptů
 >
 > 1. Přejděte na Nastavení <img src="https://help.apple.com/assets/61800C7E6EA4632586448084/61800C896EA463258644809A/en_US/492fec5aff74pngdbdef9b="Advanced">Zkratka >Vyska >
 > 2. Zapněte možnost Povolit spouštění skriptů

#### Záložka

1. Vytvořte novou záložku (obvykle Ctrl+D)
 2. Do pole Název zadejte `LibreScore`
 3. Zadejte `javascript:(funkce () {let kód = document.createElement('script');code.src = 'https://github.com/LibreScore/dl-librescore/releases/latest/download/dl-librescore.user.js';document.body.appendChild(code);}())“ pro pole URL
 4. Uložte záložku
 5. Při prohlížení skladby v MuseScore aktivujte rozšíření kliknutím na záložku

### Nástroj příkazového řádku

1. Install [Node.js LTS](https://nodejs.org)
2. Open a terminal (do _not_ open the Node.js application)
3. Type `npx dl-librescore@latest`, then press `Enter ↵`

### Webové stránky Webmscore

1. Otevřete [Webmscore](https://librescore.github.io)

> Poznámka: K webu můžete přistupovat offline, pokud si jej nainstalujete jako PWA

## Building

1. Nainstalujte [Node.js LTS](https://nodejs.org)
2. `npm install` pro instalaci balíčků
3. `npm run build` k sestavení

- Nainstalujte `./dist/main.user.js` pomocí Tampermonkey
- `node ./dist/cli.js` pro spuštění nástroje příkazového řádku

</div>
