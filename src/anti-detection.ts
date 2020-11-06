/* eslint-disable no-extend-native */
/* eslint-disable @typescript-eslint/ban-types */

/**
 * make hooked methods "native"
 */
export const makeNative = (() => {
  const l = new Set<Function>()

  hookNative(Function.prototype, 'toString', (_toString) => {
    return function () {
      if (l.has(this)) {
        // "function () {\n    [native code]\n}"
        return _toString.call(parseInt) as string
      }
      return _toString.call(this) as string
    }
  }, true)

  return (fn: Function) => {
    l.add(fn)
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
    makeNative(hookedFn as any)
  } else {
    setTimeout(() => {
      makeNative(hookedFn as any)
    })
  }
}

export const hideFromArrFilter = (() => {
  const l = new Set()

  const qsaHook = (_fn) => {
    return function (...args) {
      const arr = _fn.apply(this, args)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Array.prototype.filter.call(arr, (e) => !l.has(e))
    }
  }
  hookNative(Element.prototype, 'querySelectorAll', qsaHook)
  hookNative(document, 'querySelectorAll', qsaHook)

  return (item: any) => {
    l.add(item)
  }
})()
