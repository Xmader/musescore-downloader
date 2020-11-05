/* eslint-disable no-extend-native */
/* eslint-disable @typescript-eslint/ban-types */

/**
 * make hooked methods "native"
 */
export const makeNative = (() => {
  const l: Set<Function> = new Set()

  const _toString = Function.prototype['toString']
  const toString = function () {
    if (l.has(this)) {
      // "function () {\n    [native code]\n}"
      return _toString.call(parseInt) as string
    }
    return _toString.call(this) as string
  }
  Function.prototype.toString = toString

  // make `Function.prototype.toString` itself "native"
  l.add(toString)

  return (fn: Function) => {
    l.add(fn)
  }
})()
