/* eslint-disable */
const w = typeof unsafeWindow == 'object' ? unsafeWindow : window;

// GM APIs glue
const _GM = typeof GM == 'object' ? GM : undefined;
const gmId = '' + Math.random();
w[gmId] = _GM;

if (_GM && _GM.registerMenuCommand && _GM.openInTab) {
  // add buttons to the userscript manager menu
  _GM.registerMenuCommand(
    '** Source Code **',
    () => _GM.openInTab(_GM.info.script.homepage, { active: true })
  )

  _GM.registerMenuCommand(
    '** Discord **',
    () => _GM.openInTab("https://discord.gg/DKu7cUZ4XQ", { active: true })
  )
}

// get rid of `Disable Tampermonkey`
const observer = new MutationObserver((mutations) => {
  mutations.forEach(x => [...x.addedNodes].forEach(e => {
    if (!document.querySelector('.js-page')) {
      e.replaceWith(...x.removedNodes)
    }
  }))
})
observer.observe(document, { childList: true, subtree: true })

// script loader
new Promise(resolve => {
  const id = '' + Math.random();
  w[id] = resolve;
  setTimeout(`(function a(){window['${id}'](new Image());delete window['${id}'];})()//# sourceURL=${location.href}`)
}).then(d => {
  d.style.display = 'none';
  d.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  d.once = false;
  d.setAttribute('onload', `if(this.once)return;this.once=true;this.remove();const GM=window['${gmId}'];delete window['${gmId}'];(` + function a () {
  /** script code here */

}.toString() + ')()');document.body.prepend(d)})