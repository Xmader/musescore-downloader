/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { hookNative } from './anti-detection'
import { console, getUnsafeWindow } from './utils'

const CHUNK_PUSH_FN = /^function [^r]\(\w\){/

interface Module {
  (module, exports, __webpack_require__): void;
}

type WebpackJson = [(number | string)[], { [id: string]: Module }, any[]?][]

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

export const ALL = '*'

export const [webpackGlobalOverride, onPackLoad] = (() => {
  type OnPackLoadFn = (pack: WebpackJson[0]) => any

  const moduleOverrides: { [id: string]: Module } = {}
  const onPackLoadFns: OnPackLoadFn[] = []

  function applyOverride (pack: WebpackJson[0]) {
    let entries = Object.entries(moduleOverrides)
    // apply to all
    const all = moduleOverrides[ALL]
    if (all) {
      entries = Object.keys(pack[1]).map(id => [id, all])
    }

    entries.forEach(([id, override]) => {
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
  const _w = getUnsafeWindow()
  let jsonp = _w['webpackJsonpmusescore']
  let hooked = false
  Object.defineProperty(_w, 'webpackJsonpmusescore', {
    get () { return jsonp },
    set (v: WebpackJson) {
      jsonp = v
      if (!hooked && v.push.toString().match(CHUNK_PUSH_FN)) {
        hooked = true
        hookNative(v, 'push', (_fn) => {
          return function (pack) {
            onPackLoadFns.forEach(fn => fn(pack))
            applyOverride(pack)
            return _fn.call(this, pack)
          }
        })
      }
    },
  })

  return [
    // set overrides
    (moduleId: string, override: Module) => {
      moduleOverrides[moduleId] = override
    },
    // set onPackLoad listeners
    (fn: OnPackLoadFn) => {
      onPackLoadFns.push(fn)
    },
  ] as const
})()

export const webpackContext = new Promise<any>((resolve) => {
  webpackGlobalOverride(ALL, (n, r, t) => {
    resolve(t)
  })
})

const PACK_ID_REG = /\+(\{.*?"\})\[\w\]\+/

export const loadAllPacks = () => {
  return webpackContext.then((ctx) => {
    try {
      const fn = ctx.e.toString()
      const packsData = fn.match(PACK_ID_REG)[1] as string
      // eslint-disable-next-line no-new-func, @typescript-eslint/no-implied-eval
      const packs = Function(`return (${packsData})`)() as { [id: string]: string }

      Object.keys(packs).forEach((id) => {
        ctx.e(id)
      })
    } catch (err) {
      console.error(err)
    }
  })
}

const OBF_FN_REG = /\w\(".{4}"\),(\w)=(\[".+?\]);\w=\1,\w=(\d+).+?\);var (\w=.+?,\w\})/
export const OBFUSCATED_REG = /(\w)\((\d+),"(.{4})"\)/g

export const getObfuscationCtx = (mod: Module): (n: number, s: string) => string => {
  const str = mod.toString()
  const m = str.match(OBF_FN_REG)
  if (!m) return () => ''

  try {
    const arrVar = m[1]
    const arr = JSON.parse(m[2])

    let n = +m[3] + 1
    for (; --n;) arr.push(arr.shift())

    const fnStr = m[4]
    const ctxStr = `var ${arrVar}=${JSON.stringify(arr)};return (${fnStr})`
    // eslint-disable-next-line no-new-func, @typescript-eslint/no-implied-eval
    const fn = new Function(ctxStr)()

    return fn
  } catch (err) {
    console.error(err)
    return () => ''
  }
}

export default webpackHook
