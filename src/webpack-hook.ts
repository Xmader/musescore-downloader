/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { hookNative } from './anti-detection'

interface Module {
  (module, exports, __webpack_require__): void;
}

type WebpackJson = [number[], { [id: string]: Module }][]

const moduleLookup = (id: string, globalWebpackJson: WebpackJson) => {
  const pack = globalWebpackJson.find(x => x[1][id])!
  return pack[1][id]
}

/**
 * Retrieve (webpack_require) a module from the page's webpack package
 * 
 * I know this is super hacky.
 */
export const webpackHook = (moduleId: string, moduleOverrides: { [id: string]: Module } = {}, globalWebpackJson: WebpackJson = window['webpackJsonpmusescore']) => {
  const t = Object.assign((id: string, override = true) => {
    const r: any = {}
    const m: Module = (override && moduleOverrides[id])
      ? moduleOverrides[id]
      : moduleLookup(id, globalWebpackJson)
    m(r, r, t)
    if (r.exports) return r.exports
    return r
  }, {
    d (exp, name, fn) {
      return Object.prototype.hasOwnProperty.call(exp, name) ||
        Object.defineProperty(exp, name, { enumerable: true, get: fn })
    },
    n (e) {
      const m = e.__esModule ? () => e.default : () => e
      t.d(m, 'a', m)
      return m
    },
    r (r) {
      Object.defineProperty(r, '__esModule', { value: true })
    },
    e () {
      return Promise.resolve()
    },
  })

  return t(moduleId)
}

export const webpackGlobalOverride = (() => {
  const moduleOverrides: { [id: string]: Module } = {}

  function applyOverride (pack: WebpackJson[0]) {
    Object.entries(moduleOverrides).forEach(([id, override]) => {
      const mod = pack[1][id]
      if (mod) {
        pack[1][id] = function (n, r, t) {
          // make exports configurable
          t = Object.assign(t, {
            d (exp, name, fn) {
              return Object.defineProperty(exp, name, { enumerable: true, get: fn, configurable: true })
            },
          })
          mod(n, r, t)
          override(n, r, t)
        }
      }
    })
  }

  // hook `webpackJsonpmusescore.push` as soon as `webpackJsonpmusescore` is available
  let jsonp
  Object.defineProperty(window, 'webpackJsonpmusescore', {
    get () { return jsonp },
    set (v: WebpackJson) {
      jsonp = v
      hookNative(v, 'push', (_fn) => {
        return function (pack) {
          applyOverride(pack)
          return _fn.call(this, pack)
        }
      })
    },
  })

  // set overrides
  return (moduleId: string, override: Module) => {
    moduleOverrides[moduleId] = override
  }
})()

export default webpackHook
