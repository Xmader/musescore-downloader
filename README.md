  
# musescore-downloader

**English** | [简体中文](#musescore-downloader-1)  | [Español](#musescore-downloader-2)  | [Italian](#musescore-downloader-3) 

> download sheet music from musescore.com for free, no login or Musescore Pro required

**Star this project on [Github](https://github.com/Xmader/musescore-downloader) and [Gitlab](https://gitlab.com/Xmader/musescore-downloader)** (Mirror)   

[![Discord](https://img.shields.io/discord/774491656643674122?color=7289da&label=Discord&logo=discord)](https://discord.gg/DKu7cUZ4XQ)

Need dataset of musescore.com for analysis / machine learning? try [musescore-dataset](https://github.com/Xmader/musescore-dataset).

![](https://cdn.statically.io/gh/Xmader/musescore-downloader/master/screenshot.png?env=dev)

## Fair Use

For the purposes of research and study only

## About

Musescore Pro ($6.99/mo) is required to download sheet music from musescore.com recently.  
(However, a few months ago, it was free to download.)

The Musescore company said that this is about copyright and licensing, and they must pay the copyright owners.

Many kinds of music on musescore.com are already in the **Public Domain**, which means either the author posted them in Public Domain, or the author has been dead for over 70 years.   
Do they need to pay those composers who died hundreds of years ago?  
*Update: sheets in Public Domain are able to be downloaded without Musescore Pro now, but we still need an account to access them.*

Also, there are many sheet music authors on musescore.com who created their own songs and posted them under [CC-BY-**NC** (Creative Commons Attribution-**NonCommercial**) License](https://creativecommons.org/licenses/by-nc/4.0/).  
Is it illegal that they sell them for **profit**?  
*Note: Putting ads (to sell Musescore Pro) on the website also means that they use it to generate revenue.*

This is absolutely not acceptable, and the only purpose is to profit from stealing.

There is an article on their website: [Score download becomes a part of the Pro subscription](https://musescore.com/groups/improving-musescore-com/discuss/5044610)

## Installation

### CLI Usage

(recommended, more bulletproof)

1. Install Node.js LTS (https://nodejs.org/)
2. Open a command line terminal or command prompt
3. Type `npx msdl`, enter  
  (`npx msdl` will always run the latest version)
4. Follow the instructions

[source code](/src/cli.ts)

### Install as Userscript

This script is available as a [Userscript](https://en.wikipedia.org/wiki/Userscript). To use this Userscript, you need to first install a [user script manager](https://greasyfork.org/en/help/installing-user-scripts), like Tampermonkey.

1. Install [Tampermonkey](https://www.tampermonkey.net/)

2. ~~Install from [Greasy Fork](https://greasyfork.org/scripts/391931).~~   [#42](https://github.com/Xmader/musescore-downloader/issues/42)  
Install this script from <https://msdl.librescore.org/install.user.js>

### Install as Web Extension

The alternative method is to install this script as a Chrome or Firefox extension.

You may install the Firefox extension directly from [addons.mozilla.org (for Firefox)](https://addons.mozilla.org/en-US/firefox/addon/musescore-downloader/).

The up-to-date versions of the Chrome and Firefox extensions can be found on the [Github Releases](https://github.com/Xmader/musescore-downloader/releases) page.

## Building Instructions

Make sure you have [Node.js](https://nodejs.org/en/) environment installed.

```bash
npm install
npm run build     # build as User Script
npm run pack:ext  # pack Web Extension
```

## Mirrors

* View this project on [Github](https://github.com/Xmader/musescore-downloader) (Main repo) | [Gitlab](https://gitlab.com/Xmader/musescore-downloader) (Mirror)

* This repo is also available on IPFS to avoid DMCA takedown: [ipns://msdl.librescore.org](https://ipfs.io/ipns/msdl.librescore.org/)

## Feedback

[Github Issues](https://github.com/Xmader/musescore-downloader/issues)

## License

MIT

## About the Takedown Request

I received a [takedown request email](https://github.com/Xmader/musescore-downloader/issues/5) from one of the Musescore developers, but I would like to say something against it.

> All not Public domain content on musescore.com is licensed by major music publishers (Alfred, EMI, Sony, etc.). Distribute licensed music content from Musescore.com for free you violate their rights.

Firstly, if I violate the rights of major music publishers, the takedown request should be sent by them instead of the Musescore developers.

Secondly, musescore.com is not a simple music sharing website. The authors of sheet music must transcript and rearrange the original songs to sheets, not just copying files from somewhere else to musescore.com. As a result, the licensing should focus on the rights of transcription/rearranging to the sheet music authors, instead of the rights of sharing the music on some websites.

Thirdly, the copyright ownership of contents on musescore.com is not clear. Not every non-public-domain song on musescore.com is owned by major music publishers. There are many small music publishers and independent songwriters; Songs might be licensed under free licenses like Creative Commons. Also, there are many authors who created their own songs and posted the sheet music on musescore.com. Does musescore.com pay to those authors?

If we can't see proof that musescore.com really pays license fees to the copyright owners, we may think it is just an excuse to get profit from stealing.

> you illegaly [sic] use our private API with licensed music content. (https://github.com/Xmader/musescore-downloader/issues/5)

No, the API documentation is on https://developers.musescore.com/.


**I will launch an open source (GPLv3), serverless, offline-first, frontend-first, and totally free alternative to musescore.com, [LibreScore](https://github.com/LibreScore). Everyone is welcome to join the project development by opening an issue or [emailing me](mailto:i@xmader.com).**

**Also, I'm developing [webmscore](https://github.com/LibreScore/webmscore). It could convert a mscz file into any format that the Musescore software supports, and in the browser.** Because the Musescore software is open source under [GPL](https://github.com/musescore/MuseScore/blob/master/LICENSE.GPL), I could translate the source code to js, or compile it into asm.js/WASM.

---

# musescore-downloader

[English](#musescore-downloader) | **简体中文**  | [Español](#musescore-downloader-2) | [Italian](#musescore-downloader-3)

*中英文版本项目 README 分开撰写，中文版较不完整。如果有能力，请阅读英文版。*

> 免登录、免 Musescore Pro，下载 musescore.com 上的曲谱

**在 [Github](https://github.com/Xmader/musescore-downloader) 和 [Gitlab](https://gitlab.com/Xmader/musescore-downloader)** (镜像) **上给项目打星**  

[![Discord](https://img.shields.io/discord/774491656643674122?color=7289da&label=Discord&logo=discord)](https://discord.gg/DKu7cUZ4XQ)

![](https://cdn.statically.io/gh/Xmader/musescore-downloader/master/screenshot.png?env=dev)

## 关于

在 musescore.com 上下载曲谱需要支付 Musescore Pro 了，  
这种吸引人气后再对原来免费的东西收费的盈利模式十分令人反感，  
并且也违反了曲谱作者发布时的许可证协议（通常是 [CC-BY-NC 署名-非商业使用](https://creativecommons.org/licenses/by-nc/4.0/)，平台网站却将其作商业使用）

参见官网文章 [Score download becomes a part of the Pro subscription](https://musescore.com/groups/improving-musescore-com/discuss/5044610)

## 安装、更新、讨论

脚本以 [Userscript](https://en.wikipedia.org/wiki/Userscript) 的形式提供，需要事先安装一个 [用户脚本管理器](https://greasyfork.org/zh-CN/help/installing-user-scripts)，例如 Tampermonkey

在 [Github](https://github.com/Xmader/musescore-downloader) 上查看、讨论、更新

## License

MIT

---

# musescore-downloader

[English](#musescore-downloader) | [简体中文](#musescore-downloader-1)  | **Español** | [Italian](#musescore-downloader-3) 

> descarga partituras de musescore.com de forma gratuita, no se requiere iniciar sesión o Musescore Pro

**Dale una estrella a este proyecto en [Github](https://github.com/Xmader/musescore-downloader) y [Gitlab](https://gitlab.com/Xmader/musescore-downloader)** (Respaldo)   

[![Discord](https://img.shields.io/discord/774491656643674122?color=7289da&label=Discord&logo=discord)](https://discord.gg/DKu7cUZ4XQ)

¿Necesita un conjunto de datos de musescore.com para análisis / Machine Learning? prueba [musescore-dataset](https://github.com/Xmader/musescore-dataset).

![](https://cdn.statically.io/gh/Xmader/musescore-downloader/master/screenshot.png?env=dev)

## Fair Use

Solo para fines de investigación y estudio

## Acerca de

Se requiere Musescore Pro ($ 6.99/mes) para descargar partituras de musescore.com desde hace poco.  
(Sin embargo, hace unos meses, se podían descargar gratis).

La compañía Musescore dijo que es debido a derechos de autor y licencias, y deben pagar a los propietarios de los derechos de autor.

Muchas canciones en musescore.com ya son de ** dominio público **, lo que significa que el autor las publicó en el dominio público o que el autor ha estado muerto durante más de 70 años.
¿Necesitan pagarle a compositores que murieron hace cientos de años?
*Actualización: Las partituras de dominio público se pueden descargar sin Musescore Pro ahora, pero aún se necesita de una cuenta para acceder a ellas.*

Además, hay muchos autores de partituras en musescore.com que crearon sus propias canciones y las publicaron bajo la licencia [CC-BY-**NC** (Creative Commons Attribution-**NonCommercial**)](https://creativecommons.org/licenses/by-nc/4.0/).  
¿No es ilegal que las vendan para generar **ganancias**?
*Nota: Poner anuncios (para vender Musescore Pro) en el sitio web también significa que lo usan para generar ingresos. *

Esto es absolutamente inaceptable, y el único propósito es generar ganancias robando.

Hay un artículo en su sitio web: [La descarga de partituras se convierte en parte de la suscripción Pro](https://musescore.com/groups/improving-musescore-com/discuss/5044610)

## Instalación

### Instalar como Script de Usuario

Este script está disponible como un [Script de usuario](https://en.wikipedia.org/wiki/Userscript). Para utilizar este script, primero debe instalar un [administrador de script de usuario](https://greasyfork.org/en/help/installing-user-scripts), como Tampermonkey.

1. Instala [Tampermonkey](https://www.tampermonkey.net/)

2. ~~Instalar desde [Greasy Fork](https://greasyfork.org/scripts/391931).~~   [#42](https://github.com/Xmader/musescore-downloader/issues/42)  
Instale este script desde <https://msdl.librescore.org/install.user.js>

### Instalar como Extensión Web

El método alternativo es instalar este script como una extensión de Firefox.

Puedes instalar la extensión del navegador directamente desde [addons.mozilla.org (para Firefox)](https://addons.mozilla.org/en-US/firefox/addon/musescore-downloader/).

La versión más reciente se puede encontrar en la página de [Github Releases](https://github.com/Xmader/musescore-downloader/releases).

## Instrucciones de Compilación

Asegúrate de tener el entorno [Node.js](https://nodejs.org/en/) instalado.

```bash
npm install
npm run build     # build as User Script
npm run pack:ext  # pack Web Extension
```

## Archivos

* Mira este proyecto en [Github](https://github.com/Xmader/musescore-downloader) (Principal) | [Gitlab](https://gitlab.com/Xmader/musescore-downloader) (Respaldo)

* Este repositorio también está disponible en IPFS para evitar la eliminación por parte de DMCA. [ipns://msdl.librescore.org](https://ipfs.io/ipns/msdl.librescore.org/)

## Feedback

[Github Issues](https://github.com/Xmader/musescore-downloader/issues)

## Licencia

MIT

## Acerca de la Solicitud de Eliminación

Recibí un [correo de solicitud de elimnacion l](https://github.com/Xmader/musescore-downloader/issues/5) de uno de los desarrolladores de Musescore, pero me gustaría decir algo en contra de esto.

> Todo el contenido que no es de dominio público en musescore.com tiene licencia de los principales editores de música (Alfred, EMI, Sony, etc.). Distribuir contenido de musical licenciado de Musescore.com de forma gratuita viola sus derechos.

En primer lugar, si violé los derechos de los principales editores de música, ellos deberían enviar la solicitud de eliminación en lugar de los desarrolladores de Musescore.

En segundo lugar, musescore.com no es un simple sitio web para compartir música. Los autores de partituras deben transcribir y recomponer las canciones originales en partituras, no solo copiar archivos de cualquier otro lugar a musescore.com. Como resultado, la licencia debe centrarse en los derechos de transcripción/recomposición de los autores de las partituras, en lugar de los derechos de compartir la música en algunos sitios web.

En tercer lugar, la propiedad de los derechos de autor de los contenidos de musescore.com no está clara. No todas las canciones que no son de dominio público en musescore.com son propiedad de las principales editoriales de música. Hay muchos pequeños editores de música y compositores independientes; Las canciones pueden tener licencias gratuitas como Creative Commons. Además, hay muchos autores que crearon sus propias canciones y publicaron la partitura en musescore.com. ¿Musescore.com le paga a esos autores?

Si no podemos ver pruebas de que musescore.com realmente paga la tarifa de licencia a los propietarios de los derechos de autor, podemos pensar que es solo una excusa para obtener ganancias robando.


> utilizo ilegalmente nuestra API privada con contenido de música licenciada.

No, el documento de la API está en https://developers.musescore.com/.


**Lanzaré una alternativa de código abierto (GPLv3), sin servidor, offline, y totalmente gratuita a musescore.com, [LibreScore](https://github.com/LibreScore). ETodos son bienvenidos a unirse al desarrollo del proyecto abriendo un problema o [enviándome un correo electrónico.](mailto:i@xmader.com).**

**Además, estoy desarrollando [webmscore](https://github.com/LibreScore/webmscore). Podría convertir un archivo mscz en cualquier formato que admita el software Musescore, y en el navegador.** Dado que el software Musescore es de código abierto bajo [GPL](https://github.com/musescore/MuseScore/blob/master/LICENSE.GPL), Podría traducir el código fuente a js o compilarlo en asm.js/WASM.

---

# musescore-downloader

[English](#musescore-downloader) | [简体中文](#musescore-downloader-1) | [Español](#musescore-downloader-2) | **Italian**

> Scarica spartiti da musescore.com gratuitamente, non è richisto login o Musescore Pro.

**Avvia questo progetto su [Github](https://github.com/Xmader/musescore-downloader) e [Gitlab](https://gitlab.com/Xmader/musescore-downloader)** (Mirror)   

[![Discord](https://img.shields.io/discord/774491656643674122?color=7289da&label=Discord&logo=discord)](https://discord.gg/DKu7cUZ4XQ)

Hai bisogno di datset di musescore.com per l'analisi/machine learning? Prova [musescore-dataset](https://github.com/Xmader/musescore-dataset).

![](https://cdn.statically.io/gh/Xmader/musescore-downloader/master/screenshot.png?env=dev)

## Utilizzo leale

Solo per scopi di ricerca e studio

## In breve

Di recente è necessario un account Musescore Pro ($6,99/mese) per scaricare spartiti da musescore.com.
(Tuttavia, alcuni mesi fa, era possibile scaricare gratuitamente.)

La società Musescore ha affermato che a causa di copyright e licenze, devono pagare i proprietari del copyright.

Molte musiche su musescore.com sono già di **Pubblico Dominio**, il che significa che o l'autore le ha pubblicate in pubblico dominio o l'autore è morto da oltre 70 anni.
Devono pagare anche i compositori che sono morti centinaia di anni fa?
*Aggiornamento: gli spartiti di Dominio Pubblico, ora possono essere scaricati senza Musescore Pro, ma hai ancora bisogno di un account per poter scaricare.*


Inoltre, ci sono molti autori di spartiti su musescore.com che hanno creato le proprie canzoni e le hanno pubblicate sotto licenza [CC-BY-**NC** (Creative Commons Attribution-**NonCommercial**)](https://creativecommons.org/licenses/by-nc/4.0/).  
È illegale venderli **a scopo di lucro**? 
*Nota: Mettere annunci (per vendere Musescore Pro) sul sito web significa anche che lo usano per generare entrate.*

Questo è assolutamente inaccettabile e l'unico scopo è trarre profitto dal furto.

C'è un articolo sul loro sito web: [Il download degli spartiti diventa parte dell'abbonamento Pro](https://musescore.com/groups/improving-musescore-com/discuss/5044610)

## Installazione

### Utilizzo della CLI

(consigliato)

1. Installa Node.js LTS (https://nodejs.org/)
2. Apri il terminale CMD o Powershell
3. Digita `npx msdl`, e premi invio  
  (`npx msdl` eseguirà sempre l'ultima versione)
4. Seguire le istruzioni

[codice sorgente](/src/cli.ts)

### Installa come Userscript

Questo script è disponibile come [Userscript](https://en.wikipedia.org/wiki/Userscript). Per utilizzare questo Userscript, è necessario prima installare un [gestore di script utente].(https://greasyfork.org/en/help/installing-user-scripts), come Tampermonkey.

1. Installa [Tampermonkey](https://www.tampermonkey.net/)

2. ~~Installa da [Greasy Fork](https://greasyfork.org/scripts/391931).~~   [#42](https://github.com/Xmader/musescore-downloader/issues/42)  
Installa lo script da <https://msdl.librescore.org/install.user.js>

### Installa come estensione web

Il metodo alternativo consiste nell'installare questo script come estensione per Chrome o Firefox.

Puoi installare l'estensione del browser direttamente da [addons.mozilla.org (per Firefox)](https://addons.mozilla.org/en-US/firefox/addon/musescore-downloader/).

La versione aggiornata può essere trovata nella pagina [Github Releases](https://github.com/Xmader/musescore-downloader/releases).

## Istruzioni per il building

Assicurati di avere installato [Node.js](https://nodejs.org/en/).

```bash
npm install
npm run build     # build come script utente
npm run pack:ext  # pack Web Extension
```

## Mirrors

* Visualizza questo progetto su [Github](https://github.com/Xmader/musescore-downloader) (Repo principale) | [Gitlab](https://gitlab.com/Xmader/musescore-downloader) (Mirror)

* Questo repo è disponibile anche su IPFS per evitare la rimozione DMCA: [ipns://msdl.librescore.org](https://ipfs.io/ipns/msdl.librescore.org/)

## Feedback

[Problemi con GitHub](https://github.com/Xmader/musescore-downloader/issues)

## Licenza

MIT

## Informazioni sulla richiesta di rimozione

Ho ricevuto un'e-mail di [richiesta di rimozione](https://github.com/Xmader/musescore-downloader/issues/5)da uno degli sviluppatori di Musescore, ma ho qualcosa da ridire.

> Non tutti i contenuti di pubblico dominio su musescore.com sono concessi in licenza dai principali editori musicali (Alfred, EMI, Sony, ecc.). State distribuendo gratuitamente contenuti musicali con licenza da Musescore.com violando i loro diritti.

In primo luogo, se violi i diritti dei principali editori musicali, la richiesta di rimozione dovrebbe essere inviata da loro invece che dagli sviluppatori di Musescore.

In secondo luogo, musescore.com non è un semplice sito di condivisione di musica. Gli autori di spartiti devono trascrivere e riorganizzare le canzoni originali in spartiti, non solo copiare file da qualche altra parte su musescore.com. Di conseguenza, la licenza dovrebbe concentrarsi sui diritti di trascrizione / riorganizzazione degli autori di spartiti, invece che sui diritti di condivisione della musica su alcuni siti web.

In terzo luogo, la proprietà del copyright dei contenuti su musescore.com non è chiara. Non tutte le canzoni di pubblico dominio su musescore.com sono di proprietà dei principali editori musicali. Ci sono molti piccoli editori musicali e cantautori indipendenti. Le canzoni potrebbero essere concesse in licenza con licenze gratuite come Creative Commons. Inoltre, ci sono molti autori che hanno creato le proprie canzoni e pubblicato gli spartiti su musescore.com; Musescore.com paga questi autori?

Se ci sono prove che musescore.com paga davvero la tassa di licenza ai proprietari del copyright, potremmo pensare che sia solo una scusa per ottenere profitto dal furto.

> utilizzi illegalmente la nostra API privata con contenuti musicali con licenza.

No, il documento API è su https://developers.musescore.com/.


**Avvierò un'alternativa open source (GPLv3), serverless, offline-first, frontend-first e totalmente gratuita a musescore.com, [LibreScore](https://github.com/LibreScore). Tutti sono invitati a partecipare allo sviluppo del progetto aprendo una issue o [inviandomi un'e-mail](mailto:i@xmader.com).**

**Inoltre, sto sviluppando [webmscore](https://github.com/LibreScore/webmscore). Potrebbe convertire un file mscz in qualsiasi formato supportato dal software Musescore e nel browser.** Poiché il software Musescore è open source sotto [GPL](https://github.com/musescore/MuseScore/blob/master/LICENSE.GPL), potrei tradurre il codice sorgente in js o compilarlo in asm.js/WASM.

---
