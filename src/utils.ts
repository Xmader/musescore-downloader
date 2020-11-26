
import isNodeJs from 'detect-node'

export const escapeFilename = (s: string): string => {
  return s.replace(/[\s<>:{}"/\\|?*~.\0\cA-\cZ]+/g, '_')
}

export const getIndexPath = (id: number): string => {
  const idStr = String(id)
  // 获取最后三位，倒序排列
  // x, y, z are the reversed last digits of the score id. Example: id 123456789, x = 9, y = 8, z = 7
  // https://developers.musescore.com/#/file-urls
  // "5449062" -> ["2", "6", "0"]
  const indexN = idStr.split('').reverse().slice(0, 3)
  return indexN.join('/')
}

export const getFetch = (): typeof fetch => {
  if (!isNodeJs) {
    return fetch
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return require('node-fetch')
  }
}

export const fetchData = async (url: string, init?: RequestInit): Promise<Uint8Array> => {
  const r = await fetch(url, init)
  const data = await r.arrayBuffer()
  return new Uint8Array(data)
}

export const assertRes = (r: Response): void => {
  if (!r.ok) throw new Error(`${r.url} ${r.status} ${r.statusText}`)
}

export const useTimeout = async <T> (promise: T | Promise<T>, ms: number): Promise<T> => {
  if (!(promise instanceof Promise)) {
    return promise
  }

  return new Promise((resolve, reject) => {
    const i = setTimeout(() => {
      reject(new Error('timeout'))
    }, ms)
    promise.then(resolve, reject).finally(() => clearTimeout(i))
  })
}

export const getSandboxWindowAsync = async (): Promise<Window> => {
  if (typeof document === 'undefined') return {} as any as Window

  return new Promise((resolve) => {
    const targetEl = document.documentElement
    const eventName = 'onmousemove'

    const unsafe = getUnsafeWindow()
    const id = Math.random().toString()

    unsafe[id] = (iframe: HTMLIFrameElement) => {
      delete unsafe[id]
      targetEl.removeAttribute(eventName)

      iframe.style.display = 'none'
      targetEl.append(iframe)
      const w = iframe.contentWindow
      resolve(w as Window)
    }

    targetEl.setAttribute(eventName, `window['${id}'](document.createElement('iframe'))`)
  })
}

export const getUnsafeWindow = (): Window => {
  // eslint-disable-next-line no-eval
  return window.eval('window') as Window
}

export const console: Console = (window || global).console // Object.is(window.console, unsafeWindow.console) == false

export const windowOpenAsync = (...args: Parameters<Window['open']>): Promise<Window | null> => {
  return getSandboxWindowAsync().then(w => w.open(...args))
}

export const attachShadow = (el: Element): ShadowRoot => {
  return Element.prototype.attachShadow.call(el, { mode: 'closed' }) as ShadowRoot
}

export const waitForDocumentLoaded = (): Promise<void> => {
  if (document.readyState !== 'complete') {
    return new Promise(resolve => {
      const cb = () => {
        if (document.readyState === 'complete') {
          resolve()
          document.removeEventListener('readystatechange', cb)
        }
      }
      document.addEventListener('readystatechange', cb)
    })
  } else {
    return Promise.resolve()
  }
}
