
import isNodeJs from 'detect-node'

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

export const getSandboxWindow = (): Window => {
  if (typeof document === 'undefined') return {} as any as Window
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  document.body.append(iframe)
  const w = iframe.contentWindow
  return w as Window
}

export const sandboxWindow = getSandboxWindow()
export const console: Console = sandboxWindow['console']
export const _Element: typeof Element = sandboxWindow['Element']

export const windowOpen: Window['open'] = (...args): Window | null => {
  return sandboxWindow.open(...args)
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
