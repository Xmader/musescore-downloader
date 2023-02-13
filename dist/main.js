// ==UserScript==
// @name         musescore-downloader
// @namespace    https://www.xmader.com/
// @homepageURL  https://github.com/Xmader/musescore-downloader/
// @supportURL   https://github.com/Xmader/musescore-downloader/issues
// @updateURL    https://github.com/LibreScore/dl-librescore/releases/latest/download/dl-librescore.user.js
// @downloadURL  https://github.com/LibreScore/dl-librescore/releases/latest/download/dl-librescore.user.js
// @version      0.26.98
// @description  download sheet music from musescore.com for free, no login or Musescore Pro required | 免登录、免 Musescore Pro，免费下载 musescore.com 上的曲谱
// @author       Xmader
// @icon         https://librescore.org/img/icons/logo.svg
// @match        https://musescore.com/*/*
// @match        https://s.musescore.com/*/*
// @license      MIT
// @copyright    Copyright (c) 2019-2021 Xmader
// @grant        unsafeWindow
// @grant        GM.registerMenuCommand
// @grant        GM.addElement
// @grant        GM.openInTab
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    /* eslint-disable */
    const w = typeof unsafeWindow == 'object' ? unsafeWindow : window;

    // GM APIs glue
    const _GM = typeof GM == 'object' ? GM : undefined;
    const gmId = '' + Math.random();
    w[gmId] = _GM;

    if (_GM && _GM.registerMenuCommand && _GM.openInTab) {
      // add buttons to the userscript manager menu
      _GM.registerMenuCommand(
        `** Version: ${_GM.info.script.version} **`,
        () => _GM.openInTab("https://github.com/Xmader/musescore-downloader/releases", { active: true })
      )

      _GM.registerMenuCommand(
        '** Source Code **',
        () => _GM.openInTab(_GM.info.script.homepage, { active: true })
      )

      _GM.registerMenuCommand(
        '** Discord **',
        () => _GM.openInTab("https://discord.gg/DKu7cUZ4XQ", { active: true })
      )
    }

    function getRandL () {
      return String.fromCharCode(97 + Math.floor(Math.random() * 26))
    }

    // script loader
    new Promise(resolve => {
      const id = '' + Math.random();
      w[id] = resolve;

      const stackN = 9
      let loaderIntro = ''
      for (let i = 0; i < stackN; i++) {
        loaderIntro += `(function ${getRandL()}(){`
      }
      const loaderOutro = '})()'.repeat(stackN)
      const mockUrl = "https://c.amazon-adsystem.com/aax2/apstag.js"

      Function(`${loaderIntro}const d=new Image();window['${id}'](d);delete window['${id}'];document.body.prepend(d)${loaderOutro}//# sourceURL=${mockUrl}`)()
    }).then(d => {
      d.style.display = 'none';
      d.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
      d.once = false;
      d.setAttribute('onload', `if(this.once)return;this.once=true;this.remove();const GM=window['${gmId}'];delete window['${gmId}'];(` + function a () {
      /** script code here */


    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    var global$1 = (typeof global !== "undefined" ? global :
                typeof self !== "undefined" ? self :
                typeof window !== "undefined" ? window : {});

    // shim for using process in browser
    // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

    function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
    }
    function defaultClearTimeout () {
        throw new Error('clearTimeout has not been defined');
    }
    var cachedSetTimeout = defaultSetTimout;
    var cachedClearTimeout = defaultClearTimeout;
    if (typeof global$1.setTimeout === 'function') {
        cachedSetTimeout = setTimeout;
    }
    if (typeof global$1.clearTimeout === 'function') {
        cachedClearTimeout = clearTimeout;
    }

    function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
            //normal enviroments in sane situations
            return setTimeout(fun, 0);
        }
        // if setTimeout wasn't available but was latter defined
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
            cachedSetTimeout = setTimeout;
            return setTimeout(fun, 0);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedSetTimeout(fun, 0);
        } catch(e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                return cachedSetTimeout.call(null, fun, 0);
            } catch(e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                return cachedSetTimeout.call(this, fun, 0);
            }
        }


    }
    function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
            //normal enviroments in sane situations
            return clearTimeout(marker);
        }
        // if clearTimeout wasn't available but was latter defined
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
            cachedClearTimeout = clearTimeout;
            return clearTimeout(marker);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedClearTimeout(marker);
        } catch (e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                return cachedClearTimeout.call(null, marker);
            } catch (e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                return cachedClearTimeout.call(this, marker);
            }
        }



    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;

    function cleanUpNextTick() {
        if (!draining || !currentQueue) {
            return;
        }
        draining = false;
        if (currentQueue.length) {
            queue = currentQueue.concat(queue);
        } else {
            queueIndex = -1;
        }
        if (queue.length) {
            drainQueue();
        }
    }

    function drainQueue() {
        if (draining) {
            return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;

        var len = queue.length;
        while(len) {
            currentQueue = queue;
            queue = [];
            while (++queueIndex < len) {
                if (currentQueue) {
                    currentQueue[queueIndex].run();
                }
            }
            queueIndex = -1;
            len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
    }
    function nextTick(fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                args[i - 1] = arguments[i];
            }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
            runTimeout(drainQueue);
        }
    }
    // v8 likes predictible objects
    function Item(fun, array) {
        this.fun = fun;
        this.array = array;
    }
    Item.prototype.run = function () {
        this.fun.apply(null, this.array);
    };
    var title = 'browser';
    var platform = 'browser';
    var browser = true;
    var env = {};
    var argv = [];
    var version = ''; // empty string to avoid regexp issues
    var versions = {};
    var release = {};
    var config = {};

    function noop() {}

    var on = noop;
    var addListener = noop;
    var once = noop;
    var off = noop;
    var removeListener = noop;
    var removeAllListeners = noop;
    var emit = noop;

    function binding(name) {
        throw new Error('process.binding is not supported');
    }

    function cwd () { return '/' }
    function chdir (dir) {
        throw new Error('process.chdir is not supported');
    }function umask() { return 0; }

    // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
    var performance = global$1.performance || {};
    var performanceNow =
      performance.now        ||
      performance.mozNow     ||
      performance.msNow      ||
      performance.oNow       ||
      performance.webkitNow  ||
      function(){ return (new Date()).getTime() };

    // generate timestamp or delta
    // see http://nodejs.org/api/process.html#process_process_hrtime
    function hrtime(previousTimestamp){
      var clocktime = performanceNow.call(performance)*1e-3;
      var seconds = Math.floor(clocktime);
      var nanoseconds = Math.floor((clocktime%1)*1e9);
      if (previousTimestamp) {
        seconds = seconds - previousTimestamp[0];
        nanoseconds = nanoseconds - previousTimestamp[1];
        if (nanoseconds<0) {
          seconds--;
          nanoseconds += 1e9;
        }
      }
      return [seconds,nanoseconds]
    }

    var startTime = new Date();
    function uptime() {
      var currentTime = new Date();
      var dif = currentTime - startTime;
      return dif / 1000;
    }

    var process$1 = {
      nextTick: nextTick,
      title: title,
      browser: browser,
      env: env,
      argv: argv,
      version: version,
      versions: versions,
      on: on,
      addListener: addListener,
      once: once,
      off: off,
      removeListener: removeListener,
      removeAllListeners: removeAllListeners,
      emit: emit,
      binding: binding,
      cwd: cwd,
      chdir: chdir,
      umask: umask,
      hrtime: hrtime,
      platform: platform,
      release: release,
      config: config,
      uptime: uptime
    };

    // Only Node.JS has a process variable that is of [[Class]] process
    var detectNode = Object.prototype.toString.call(typeof process$1 !== 'undefined' ? process$1 : 0) === '[object process]';

    const _GM = (typeof GM === 'object' ? GM : undefined);
    const isGmAvailable = (requiredMethod = 'info') => {
        return typeof GM !== 'undefined' &&
            typeof GM[requiredMethod] !== 'undefined';
    };

    const DISCORD_URL = 'https://discord.gg/gSsTUvJmD8';
    const NODE_FETCH_HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:81.0) Gecko/20100101 Firefox/81.0',
        'Accept-Language': 'en-US,en;q=0.8',
    };
    const getFetch = () => {
        if (!detectNode) {
            return fetch;
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const nodeFetch = require('node-fetch');
            return (input, init) => {
                if (typeof input === 'string' && !input.startsWith('http')) { // fix: Only absolute URLs are supported
                    input = 'https://musescore.com' + input;
                }
                init = Object.assign({ headers: NODE_FETCH_HEADERS }, init);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return nodeFetch(input, init);
            };
        }
    };
    const fetchData = (url, init) => __awaiter(void 0, void 0, void 0, function* () {
        const _fetch = getFetch();
        const r = yield _fetch(url, init);
        const data = yield r.arrayBuffer();
        return new Uint8Array(data);
    });
    const assertRes = (r) => {
        if (!r.ok)
            throw new Error(`${r.url} ${r.status} ${r.statusText}`);
    };
    const useTimeout = (promise, ms) => __awaiter(void 0, void 0, void 0, function* () {
        if (!(promise instanceof Promise)) {
            return promise;
        }
        return new Promise((resolve, reject) => {
            const i = setTimeout(() => {
                reject(new Error('timeout'));
            }, ms);
            promise.then(resolve, reject).finally(() => clearTimeout(i));
        });
    });
    const getSandboxWindowAsync = (targetEl = undefined) => __awaiter(void 0, void 0, void 0, function* () {
        if (typeof document === 'undefined')
            return {};
        if (isGmAvailable('addElement')) {
            // create iframe using GM_addElement API
            const iframe = yield _GM.addElement('iframe', {});
            iframe.style.display = 'none';
            return iframe.contentWindow;
        }
        if (!targetEl) {
            return new Promise((resolve) => {
                // You need ads in your pages, right?
                const observer = new MutationObserver(() => {
                    for (let i = 0; i < window.frames.length; i++) {
                        // find iframe windows created by ads
                        const frame = frames[i];
                        try {
                            const href = frame.location.href;
                            if (href === location.href || href === 'about:blank') {
                                resolve(frame);
                                return;
                            }
                        }
                        catch (_a) { }
                    }
                });
                observer.observe(document.body, { subtree: true, childList: true });
            });
        }
        return new Promise((resolve) => {
            const eventName = 'onmousemove';
            const id = Math.random().toString();
            targetEl[id] = (iframe) => {
                delete targetEl[id];
                targetEl.removeAttribute(eventName);
                iframe.style.display = 'none';
                targetEl.append(iframe);
                const w = iframe.contentWindow;
                resolve(w);
            };
            targetEl.setAttribute(eventName, `this['${id}'](document.createElement('iframe'))`);
        });
    });
    const console = (typeof window !== 'undefined' ? window : global).console; // Object.is(window.console, unsafeWindow.console) == false
    const windowOpenAsync = (targetEl, ...args) => {
        return getSandboxWindowAsync(targetEl).then(w => w.open(...args));
    };
    const attachShadow = (el) => {
        return Element.prototype.attachShadow.call(el, { mode: 'closed' });
    };
    /**
     * Run script before the page is fully loaded
     */
    const waitForSheetLoaded = () => {
        if (document.readyState !== 'complete') {
            return new Promise(resolve => {
                const observer = new MutationObserver(() => {
                    const img = document.querySelector('img');
                    if (img) {
                        resolve();
                        observer.disconnect();
                    }
                });
                observer.observe(document, { childList: true, subtree: true });
            });
        }
        else {
            return Promise.resolve();
        }
    };

    const MSCZ_BUF_SYM = Symbol('msczBufferP');
    const MSCZ_URL_SYM = Symbol('msczUrl');
    const MAIN_CID_SYM = Symbol('mainCid');
    const IPNS_KEY = 'QmSdXtvzC8v8iTTZuj5cVmiugnzbR1QATYRcGix4bBsioP';
    const IPNS_RS_URL = `https://ipfs.io/api/v0/dag/resolve?arg=/ipns/${IPNS_KEY}`;
    const getMainCid = (scoreinfo, _fetch = getFetch()) => __awaiter(void 0, void 0, void 0, function* () {
        // look for the persisted msczUrl inside scoreinfo
        let result = scoreinfo.store.get(MAIN_CID_SYM);
        if (result) {
            return result;
        }
        const r = yield _fetch(IPNS_RS_URL);
        assertRes(r);
        const json = yield r.json();
        result = json.Cid['/'];
        scoreinfo.store.set(MAIN_CID_SYM, result); // persist to scoreinfo
        return result;
    });
    const loadMsczUrl = (scoreinfo, _fetch = getFetch()) => __awaiter(void 0, void 0, void 0, function* () {
        // look for the persisted msczUrl inside scoreinfo
        let result = scoreinfo.store.get(MSCZ_URL_SYM);
        if (result) {
            return result;
        }
        const mainCid = yield getMainCid(scoreinfo, _fetch);
        const url = scoreinfo.getMsczCidUrl(mainCid);
        const r0 = yield _fetch(url);
        // ipfs-http-gateway specific error
        // may read further error msg as json
        if (r0.status !== 500) {
            assertRes(r0);
        }
        const cidRes = yield r0.json();
        const cid = cidRes.Key;
        if (!cid) {
            // read further error msg
            const err = cidRes.Message;
            if (err.includes('no link named')) { // file not found
                throw new Error('Score not in dataset');
            }
            else {
                throw new Error(err);
            }
        }
        result = `https://ipfs.infura.io/ipfs/${cid}`;
        scoreinfo.store.set(MSCZ_URL_SYM, result); // persist to scoreinfo
        return result;
    });
    const fetchMscz = (scoreinfo, _fetch = getFetch()) => __awaiter(void 0, void 0, void 0, function* () {
        let msczBufferP = scoreinfo.store.get(MSCZ_BUF_SYM);
        if (!msczBufferP) {
            msczBufferP = (() => __awaiter(void 0, void 0, void 0, function* () {
                const url = yield loadMsczUrl(scoreinfo, _fetch);
                const r = yield _fetch(url);
                assertRes(r);
                const data = yield r.arrayBuffer();
                return data;
            }))();
            scoreinfo.store.set(MSCZ_BUF_SYM, msczBufferP);
        }
        return msczBufferP;
    });

    /**
     * type checking only so no missing keys
     */
    function createLocale(obj) {
        return Object.freeze(obj);
    }

    var en = createLocale({
        'PROCESSING'() {
            return 'Processing…';
        },
        'BTN_ERROR'() {
            return '❌Download Failed!';
        },
        'DEPRECATION_NOTICE'(btnName) {
            return `DEPRECATED!\nUse \`${btnName}\` inside \`Individual Parts\` instead.\n(This may still work. Click \`OK\` to continue.)`;
        },
        'DOWNLOAD'(fileType) {
            return `Download ${fileType}`;
        },
        'DOWNLOAD_AUDIO'(fileType) {
            return `Download ${fileType} Audio`;
        },
        'IND_PARTS'() {
            return 'Individual Parts';
        },
        'IND_PARTS_TOOLTIP'() {
            return 'Download individual parts (BETA)';
        },
        'VIEW_IN_LIBRESCORE'() {
            return 'View in LibreScore';
        },
        'FULL_SCORE'() {
            return 'Full score';
        },
    });

    var es = createLocale({
        'PROCESSING'() {
            return 'Cargando…';
        },
        'BTN_ERROR'() {
            return '❌¡Descarga Fallida!';
        },
        'DEPRECATION_NOTICE'(btnName) {
            return `¡OBSOLETO!\nUtilizar \`${btnName}\` dentro de \`Partes Indivduales\` en su lugar.\n(Esto todavía puede funcionar. Pulsa \`Aceptar\` para continuar.)`;
        },
        'DOWNLOAD'(fileType) {
            return `Descargar ${fileType}`;
        },
        'DOWNLOAD_AUDIO'(fileType) {
            return `Descargar Audio ${fileType}`;
        },
        'IND_PARTS'() {
            return 'Partes individuales';
        },
        'IND_PARTS_TOOLTIP'() {
            return 'Descargar partes individuales (BETA)';
        },
        'VIEW_IN_LIBRESCORE'() {
            return 'Visualizar en LibreScore';
        },
        'FULL_SCORE'() {
            return 'Partitura Completa';
        },
    });

    var it = createLocale({
        'PROCESSING'() {
            return 'Caricamento…';
        },
        'BTN_ERROR'() {
            return '❌Download Fallito!';
        },
        'DEPRECATION_NOTICE'(btnName) {
            return `¡DEPRECATO!\nUtilizzare \`${btnName}\` all'interno di \`Parti Indivduali\`.\n(Qusto potrebbe funzionare. Cliccare \`Ok\` per continuare.)`;
        },
        'DOWNLOAD'(fileType) {
            return `Scaricare ${fileType}`;
        },
        'DOWNLOAD_AUDIO'(fileType) {
            return `Scaricare ${fileType} Audio`;
        },
        'IND_PARTS'() {
            return 'Parti Singole';
        },
        'IND_PARTS_TOOLTIP'() {
            return 'Scaricare Parti Singole (BETA)';
        },
        'VIEW_IN_LIBRESCORE'() {
            return 'Visualizzare in LibreScore';
        },
        'FULL_SCORE'() {
            return 'Spartito Completo';
        },
    });

    var zh = createLocale({
        'PROCESSING'() {
            return '处理中…';
        },
        'BTN_ERROR'() {
            return '❌下载失败!';
        },
        'DEPRECATION_NOTICE'(btnName) {
            return `不建议使用\n请使用 \`单独分谱\` 里的 \`${btnName}\` 按钮代替\n（这也许仍会起作用。单击\`确定\`以继续。）`;
        },
        'DOWNLOAD'(fileType) {
            return `下载 ${fileType}`;
        },
        'DOWNLOAD_AUDIO'(fileType) {
            return `下载 ${fileType} 音频`;
        },
        'IND_PARTS'() {
            return '单独分谱';
        },
        'IND_PARTS_TOOLTIP'() {
            return '下载单独分谱 (BETA)';
        },
        'VIEW_IN_LIBRESCORE'() {
            return '在 LibreScore 中查看';
        },
        'FULL_SCORE'() {
            return '完整乐谱';
        },
    });

    const locales = ((l) => Object.freeze(l))({
        en,
        es,
        it,
        zh,
    });
    // detect browser language
    const lang = (() => {
        let userLangs;
        if (!detectNode) {
            userLangs = navigator.languages;
        }
        else {
            const env = process.env;
            const l = env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE || '';
            userLangs = [l.slice(0, 2)];
        }
        const names = Object.keys(locales);
        const _lang = userLangs.find(l => {
            // find the first occurrence of valid languages
            return names.includes(l);
        });
        return _lang || 'en';
    })();
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function i18n(key) {
        const locale = locales[lang];
        return locale[key];
    }

    var dependencies = {
    	"@librescore/fonts": "^0.4.0",
    	"@librescore/sf3": "^0.3.0",
    	"detect-node": "^2.0.4",
    	inquirer: "^7.3.3",
    	"node-fetch": "^2.6.1",
    	ora: "^5.1.0",
    	webmscore: "^0.18.0"
    };

    /* eslint-disable @typescript-eslint/no-var-requires */
    const WEBMSCORE_URL = `https://cdn.jsdelivr.net/npm/webmscore@${dependencies.webmscore}/webmscore.js`;
    // fonts for Chinese characters (CN) and Korean hangul (KR)
    // JP characters are included in the CN font
    const FONT_URLS = ['CN', 'KR'].map(l => `https://cdn.jsdelivr.net/npm/@librescore/fonts@${dependencies['@librescore/fonts']}/SourceHanSans${l}.min.woff2`);
    const SF3_URL = `https://cdn.jsdelivr.net/npm/@librescore/sf3@${dependencies['@librescore/sf3']}/FluidR3Mono_GM.sf3`;
    const SOUND_FONT_LOADED = Symbol('SoundFont loaded');
    const initMscore = (w) => __awaiter(void 0, void 0, void 0, function* () {
        if (!detectNode) { // attached to a page
            if (!w['WebMscore']) {
                // init webmscore (https://github.com/LibreScore/webmscore)
                const script = w.document.createElement('script');
                script.src = WEBMSCORE_URL;
                w.document.body.append(script);
                yield new Promise(resolve => { script.onload = resolve; });
            }
            return w['WebMscore'];
        }
        else { // nodejs
            return require('webmscore').default;
        }
    });
    let fonts;
    const initFonts = () => {
        // load CJK fonts
        // CJK (East Asian) characters will be rendered as "tofu" if there is no font
        if (!fonts) {
            if (detectNode) {
                // module.exports.CN = ..., module.exports.KR = ...
                const FONTS = Object.values(require('@librescore/fonts'));
                const fs = require('fs');
                fonts = Promise.all(FONTS.map((path) => fs.promises.readFile(path)));
            }
            else {
                fonts = Promise.all(FONT_URLS.map(url => fetchData(url)));
            }
        }
    };
    const loadSoundFont = (score) => {
        if (!score[SOUND_FONT_LOADED]) {
            const loadPromise = (() => __awaiter(void 0, void 0, void 0, function* () {
                let data;
                if (detectNode) {
                    // module.exports.FluidR3Mono = ...
                    const SF3 = Object.values(require('@librescore/sf3'))[0];
                    const fs = require('fs');
                    data = yield fs.promises.readFile(SF3);
                }
                else {
                    data = yield fetchData(SF3_URL);
                }
                yield score.setSoundFont(data);
            }))();
            score[SOUND_FONT_LOADED] = loadPromise;
        }
        return score[SOUND_FONT_LOADED];
    };
    const loadMscore = (scoreinfo, w) => __awaiter(void 0, void 0, void 0, function* () {
        initFonts();
        const WebMscore = yield initMscore(w);
        // parse mscz data
        const data = new Uint8Array(new Uint8Array(yield fetchMscz(scoreinfo)));
        const score = yield WebMscore.load('mscz', data, yield fonts);
        yield score.generateExcerpts();
        return score;
    });
    const INDV_DOWNLOADS = [
        {
            name: i18n('DOWNLOAD')('PDF'),
            fileExt: 'pdf',
            action: (score) => score.savePdf(),
        },
        {
            name: i18n('DOWNLOAD')('MSCZ'),
            fileExt: 'mscz',
            action: (score) => score.saveMsc('mscz'),
        },
        {
            name: i18n('DOWNLOAD')('MusicXML'),
            fileExt: 'mxl',
            action: (score) => score.saveMxl(),
        },
        {
            name: i18n('DOWNLOAD')('MIDI'),
            fileExt: 'mid',
            action: (score) => score.saveMidi(true, true),
        },
        {
            name: i18n('DOWNLOAD_AUDIO')('MP3'),
            fileExt: 'mp3',
            action: (score) => loadSoundFont(score).then(() => score.saveAudio('mp3')),
        },
        {
            name: i18n('DOWNLOAD_AUDIO')('FLAC'),
            fileExt: 'flac',
            action: (score) => loadSoundFont(score).then(() => score.saveAudio('flac')),
        },
        {
            name: i18n('DOWNLOAD_AUDIO')('OGG'),
            fileExt: 'ogg',
            action: (score) => loadSoundFont(score).then(() => score.saveAudio('ogg')),
        },
    ];

    var btnListCss = "div {\n  width: 422px;\n  right: 0;\n  margin: 0 18px 18px 0;\n\n  text-align: center;\n  align-items: center;\n  font-family: 'Inter', 'Helvetica neue', Helvetica, sans-serif;\n  position: absolute;\n  z-index: 9999;\n  background: #f6f6f6;\n  min-width: 230px;\n\n  /* pass the scroll event through the btns background */\n  pointer-events: none;\n}\n\n@media screen and (max-width: 950px) {\n  div {\n    width: auto !important;\n  }\n}\n\nbutton {\n  width: 178px !important;\n  min-width: 178px;\n  height: 40px;\n\n  color: #fff;\n  background: #2e68c0;\n\n  cursor: pointer;\n  pointer-events: auto;\n\n  margin-bottom: 8px;\n  margin-right: 8px;\n  padding: 4px 12px;\n\n  justify-content: start;\n  align-self: center;\n\n  font-size: 16px;\n  border-radius: 6px;\n  border: 0;\n\n  display: inline-flex;\n  position: relative;\n\n  font-family: inherit;\n}\n\n/* fix `View in LibreScore` button text overflow */\nbutton:last-of-type {\n  width: unset !important;\n}\n\nbutton:hover {\n  background: #1a4f9f;\n}\n\n/* light theme btn */\nbutton.light {\n  color: #2e68c0;\n  background: #e1effe;\n}\n\nbutton.light:hover {\n  background: #c3ddfd;\n}\n\nsvg {\n  display: inline-block;\n  margin-right: 5px;\n  width: 20px;\n  height: 20px;\n  margin-top: auto;\n  margin-bottom: auto;\n}\n\nspan {\n  margin-top: auto;\n  margin-bottom: auto;\n}";

    var ICON;
    (function (ICON) {
        ICON["DOWNLOAD"] = "M9.6 2.4h4.8V12h2.784l-5.18 5.18L6.823 12H9.6V2.4zM19.2 19.2H4.8v2.4h14.4v-2.4z";
        ICON["LIBRESCORE"] = "m5.4837 4.4735v10.405c-1.25-0.89936-3.0285-0.40896-4.1658 0.45816-1.0052 0.76659-1.7881 2.3316-0.98365 3.4943 1 1.1346 2.7702 0.70402 3.8817-0.02809 1.0896-0.66323 1.9667-1.8569 1.8125-3.1814v-5.4822h8.3278v9.3865h9.6438v-2.6282h-6.4567v-12.417c-4.0064-0.015181-8.0424-0.0027-12.06-0.00676zm0.54477 2.2697h8.3278v1.1258h-8.3278v-1.1258z";
    })(ICON || (ICON = {}));
    const getBtnContainer = () => {
        var _a;
        const els = [...document.querySelectorAll('span')];
        const el = els.find(b => {
            var _a;
            const text = ((_a = b === null || b === void 0 ? void 0 : b.textContent) === null || _a === void 0 ? void 0 : _a.replace(/\s/g, '')) || '';
            return text.includes('Download') || text.includes('Print');
        });
        const btnParent = (_a = el === null || el === void 0 ? void 0 : el.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
        if (!btnParent || !(btnParent instanceof HTMLDivElement))
            throw new Error('btn parent not found');
        return btnParent;
    };
    const buildDownloadBtn = (icon, lightTheme = false) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        if (lightTheme)
            btn.className = 'light';
        // build icon svg element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        const svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        svgPath.setAttribute('d', icon);
        svgPath.setAttribute('fill', lightTheme ? '#2e68c0' : '#fff');
        svg.append(svgPath);
        const textNode = document.createElement('span');
        btn.append(svg, textNode);
        return btn;
    };
    const cloneBtn = (btn) => {
        const n = btn.cloneNode(true);
        n.onclick = btn.onclick;
        return n;
    };
    function getScrollParent(node) {
        if (node.scrollHeight > node.clientHeight) {
            return node;
        }
        else {
            return getScrollParent(node.parentNode);
        }
    }
    function onPageRendered(getEl) {
        return new Promise((resolve) => {
            var _a;
            const observer = new MutationObserver(() => {
                try {
                    const el = getEl();
                    if (el) {
                        observer.disconnect();
                        resolve(el);
                    }
                }
                catch (_a) { }
            });
            observer.observe((_a = document.querySelector('div > section')) !== null && _a !== void 0 ? _a : document.body, { childList: true, subtree: true });
        });
    }
    var BtnListMode;
    (function (BtnListMode) {
        BtnListMode[BtnListMode["InPage"] = 0] = "InPage";
        BtnListMode[BtnListMode["ExtWindow"] = 1] = "ExtWindow";
    })(BtnListMode || (BtnListMode = {}));
    class BtnList {
        constructor(getBtnParent = getBtnContainer) {
            this.getBtnParent = getBtnParent;
            this.list = [];
        }
        add(options) {
            var _a;
            const btnTpl = buildDownloadBtn((_a = options.icon) !== null && _a !== void 0 ? _a : ICON.DOWNLOAD, options.lightTheme);
            const setText = (btn) => {
                const textNode = btn.querySelector('span');
                return (str) => {
                    if (textNode)
                        textNode.textContent = str;
                };
            };
            setText(btnTpl)(options.name);
            btnTpl.onclick = function () {
                const btn = this;
                options.action(options.name, btn, setText(btn));
            };
            this.list.push(btnTpl);
            if (options.disabled) {
                btnTpl.disabled = options.disabled;
            }
            if (options.tooltip) {
                btnTpl.title = options.tooltip;
            }
            // add buttons to the userscript manager menu
            if (isGmAvailable('registerMenuCommand')) {
                // eslint-disable-next-line no-void
                void _GM.registerMenuCommand(options.name, () => {
                    options.action(options.name, btnTpl, () => undefined);
                });
            }
            return btnTpl;
        }
        _positionBtns(anchorDiv, newParent) {
            let { top } = anchorDiv.getBoundingClientRect();
            top += window.scrollY; // relative to the entire document instead of viewport
            if (top > 0) {
                newParent.style.top = `${top}px`;
            }
            else {
                newParent.style.top = '0px';
            }
        }
        _commit() {
            const btnParent = document.querySelector('div');
            const shadow = attachShadow(btnParent);
            // style the shadow DOM
            const style = document.createElement('style');
            style.innerText = btnListCss;
            shadow.append(style);
            // hide buttons using the shadow DOM
            const slot = document.createElement('slot');
            shadow.append(slot);
            const newParent = document.createElement('div');
            newParent.append(...this.list.map(e => cloneBtn(e)));
            shadow.append(newParent);
            // default position
            newParent.style.top = `${window.innerHeight - newParent.getBoundingClientRect().height}px`;
            void onPageRendered(this.getBtnParent).then((anchorDiv) => {
                const pos = () => this._positionBtns(anchorDiv, newParent);
                pos();
                // reposition btns when window resizes
                window.addEventListener('resize', pos, { passive: true });
                // reposition btns when scrolling
                const scroll = getScrollParent(anchorDiv);
                scroll.addEventListener('scroll', pos, { passive: true });
            });
            return btnParent;
        }
        /**
         * replace the template button with the list of new buttons
         */
        commit(mode = BtnListMode.InPage) {
            return __awaiter(this, void 0, void 0, function* () {
                switch (mode) {
                    case BtnListMode.InPage: {
                        let el;
                        try {
                            el = this._commit();
                        }
                        catch (_a) {
                            // fallback to BtnListMode.ExtWindow
                            return this.commit(BtnListMode.ExtWindow);
                        }
                        const observer = new MutationObserver(() => {
                            // check if the buttons are still in document when dom updates 
                            if (!document.contains(el)) {
                                // re-commit
                                // performance issue?
                                el = this._commit();
                            }
                        });
                        observer.observe(document, { childList: true, subtree: true });
                        break;
                    }
                    case BtnListMode.ExtWindow: {
                        const div = this._commit();
                        const w = yield windowOpenAsync(undefined, '', undefined, 'resizable,width=230,height=270');
                        // eslint-disable-next-line no-unused-expressions
                        w === null || w === void 0 ? void 0 : w.document.body.append(div);
                        window.addEventListener('unload', () => w === null || w === void 0 ? void 0 : w.close());
                        break;
                    }
                    default:
                        throw new Error('unknown BtnListMode');
                }
            });
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-namespace
    var BtnAction;
    (function (BtnAction) {
        const normalizeUrlInput = (url) => {
            if (typeof url === 'function')
                return url();
            else
                return url;
        };
        BtnAction.download = (url, fallback, timeout, target) => {
            return BtnAction.process(() => __awaiter(this, void 0, void 0, function* () {
                const _url = yield normalizeUrlInput(url);
                const a = document.createElement('a');
                a.href = _url;
                if (target)
                    a.target = target;
                a.dispatchEvent(new MouseEvent('click'));
            }), fallback, timeout);
        };
        BtnAction.openUrl = BtnAction.download;
        BtnAction.mscoreWindow = (scoreinfo, fn) => {
            return (btnName, btn, setText) => __awaiter(this, void 0, void 0, function* () {
                // save btn event for later use
                const _onclick = btn.onclick;
                // clear btn event
                btn.onclick = null;
                // set btn text to "PROCESSING"
                setText(i18n('PROCESSING')());
                // open a new tab
                const w = yield windowOpenAsync(btn, '');
                // add texts to the new tab
                const txt = document.createTextNode(i18n('PROCESSING')());
                w.document.body.append(txt);
                // set page hooks that the new tab also closes as the og tab closes
                let score; // eslint-disable-line prefer-const
                const destroy = () => {
                    score && score.destroy();
                    w.close();
                };
                window.addEventListener('unload', destroy);
                w.addEventListener('beforeunload', () => {
                    score && score.destroy();
                    window.removeEventListener('unload', destroy);
                    // reset btn text
                    setText(btnName);
                    // reinstate btn event
                    btn.onclick = _onclick;
                });
                try {
                    // fetch mscz & process using mscore
                    score = yield loadMscore(scoreinfo, w);
                    fn(w, score, txt);
                }
                catch (err) {
                    console.error(err);
                    // close the new tab & show error popup
                    w.close();
                    BtnAction.errorPopup()(btnName, btn, setText);
                }
            });
        };
        BtnAction.errorPopup = () => {
            return (btnName, btn, setText) => {
                setText(i18n('BTN_ERROR')());
                // ask user to send Discord message
                alert('❌Download Failed!\n\n' +
                    'Send your URL to the #dataset-patcher channel ' +
                    'in the LibreScore Community Discord server:\n' + DISCORD_URL);
                // open Discord on 'OK'
                const a = document.createElement('a');
                a.href = DISCORD_URL;
                a.target = '_blank';
                a.dispatchEvent(new MouseEvent('click'));
            };
        };
        BtnAction.process = (fn, fallback, timeout = 10 * 60 * 1000 /* 10min */) => {
            return (name, btn, setText) => __awaiter(this, void 0, void 0, function* () {
                const _onclick = btn.onclick;
                btn.onclick = null;
                setText(i18n('PROCESSING')());
                try {
                    yield useTimeout(fn(), timeout);
                    setText(name);
                }
                catch (err) {
                    console.error(err);
                    if (fallback) {
                        // use fallback
                        yield fallback();
                        setText(name);
                    }
                    else {
                        BtnAction.errorPopup()(name, btn, setText);
                    }
                }
                btn.onclick = _onclick;
            });
        };
        BtnAction.deprecate = (action) => {
            return (name, btn, setText) => {
                alert(i18n('DEPRECATION_NOTICE')(name));
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return action(name, btn, setText);
            };
        };
    })(BtnAction || (BtnAction = {}));

    const main = () => {
        const btnList = new BtnList();
        btnList.add({
            name: 'Update Script',
            action: BtnAction.openUrl('https://github.com/Xmader/musescore-downloader#deprecated'),
            tooltip: 'Please update to the newest version',
            icon: ICON.LIBRESCORE,
            lightTheme: true,
        });
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        btnList.commit(BtnListMode.InPage);
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    waitForSheetLoaded().then(main);

    }.toString() + ')()')})

}());
