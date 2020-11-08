/* eslint-disable no-extend-native */
/* eslint-disable @typescript-eslint/ban-types */

/**
 * make hooked methods "native"
 */
export const makeNative = (() => {
  const l = new Map<Function, Function>()

  hookNative(Function.prototype, 'toString', (_toString) => {
    return function () {
      if (l.has(this)) {
        const _fn = l.get(this) || parseInt // "function () {\n    [native code]\n}"
        if (l.has(_fn)) { // nested
          return _fn.toString()
        } else {
          return _toString.call(_fn) as string
        }
      }
      return _toString.call(this) as string
    }
  }, true)

  return (fn: Function, original: Function) => {
    l.set(fn, original)
  }
})()

export function hookNative<T extends object, M extends (keyof T)> (
  target: T,
  method: M,
  hook: (originalFn: T[M], detach: () => void) => T[M],
  async = false,
): void {
  // reserve for future hook update
  const _fn = target[method]
  const detach = () => {
    target[method] = _fn // detach
  }

  // This script can run before anything on the page,  
  // so setting this function to be non-configurable and non-writable is no use.
  const hookedFn = hook(_fn, detach)
  target[method] = hookedFn

  if (!async) {
    makeNative(hookedFn as any, _fn as any)
  } else {
    setTimeout(() => {
      makeNative(hookedFn as any, _fn as any)
    })
  }
}
