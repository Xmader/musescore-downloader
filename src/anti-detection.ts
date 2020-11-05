/* eslint-disable no-extend-native */
/* eslint-disable @typescript-eslint/ban-types */

/**
 * make hooked methods "native"
 */
export const makeNative = (() => {
  const l: Set<Function> = new Set()

  const target = Function.prototype
  const method = 'toString'
  const _toString = target[method]
  const toString = function () {
    if (l.has(this)) {
      // "function () {\n    [native code]\n}"
      return _toString.call(parseInt) as string
    }
    return _toString.call(this) as string
  }
  target[method] = toString

  // make `Function.prototype.toString` itself "native"
  l.add(toString)

  return (fn: Function) => {
    l.add(fn)
  }
})()

export const hookNative = <T extends object, M extends (keyof T)> (
  target: T,
  method: M,
  hook: (originalFn: T[M], detach: () => void) => T[M],
): void => {
  // reserve for future hook update
  const _fn = target[method]
  const detach = () => {
    target[method] = _fn // detach
  }

  // This script can run before anything on the page,  
  // so setting this function to be non-configurable and non-writable is no use.
  const hookedFn = hook(_fn, detach)
  target[method] = hookedFn

  makeNative(hookedFn as any)
}
