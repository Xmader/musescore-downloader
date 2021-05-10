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
  const d = new Image()
  document.body.prepend(d)
  resolve(d)
}).then(d => {
  const stackN = 10
  let loaderIntro = ''
  for (let i = 0; i < stackN; i++) {
    loaderIntro += `(function ${getRandL()}(){`
  }
  const loaderOutro = '})()'.repeat(stackN)
  const mockUrl = "https://c.amazon-adsystem.com/aax2/apstag.js"

  d.style.display = 'none';
  d.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  d.once = false;
  d.setAttribute('onload', `const self=this;${loaderIntro}if(self.once)return;self.once=true;self.remove();const GM=window['${gmId}'];delete window['${gmId}'];(` + function a () {
  /** script code here */

}.toString() + `)()${loaderOutro}//# sourceURL=${mockUrl}`)})