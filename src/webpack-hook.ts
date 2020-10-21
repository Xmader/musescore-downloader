/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

interface Module {
  (module, exports, __webpack_require__): void;
}

type WebpackJson = [number, { [id: string]: Module }][]

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
      return e.__esModule ? () => e.default : () => e
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

export default webpackHook
