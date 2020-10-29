// entry file for the Web Extension
/* eslint-disable no-undef */

const MAIN_FILE = 'dist/main.js'

const script = document.createElement('script')
script.src = chrome.runtime.getURL(MAIN_FILE)
script.addEventListener('load', () => script.remove())

document.documentElement.appendChild(script)
