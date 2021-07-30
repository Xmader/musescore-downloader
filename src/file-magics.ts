
import isNodeJs from 'detect-node'
import { hookNative } from './anti-detection'
import type { FileType } from './file'

const TYPE_REG = /type=(img|mp3|midi)/

/**
 * I know this is super hacky.
 */
const magicHookConstr = (() => {
  const l = {}

  if (isNodeJs) { // noop in CLI
    return () => Promise.resolve('')
  }

  try {
    const p = Object.getPrototypeOf(document.body)
    Object.setPrototypeOf(document.body, null)

    hookNative(document.body, 'append', () => {
      return function (...nodes: Node[]) {
        p.append.call(this, ...nodes)

        if (nodes[0].nodeName === 'IFRAME') {
          const iframe = nodes[0] as HTMLIFrameElement
          const w = iframe.contentWindow as Window

          hookNative(w, 'fetch', () => {
            return function (url, init) {
              const token = init?.headers?.Authorization
              if (typeof url === 'string' && token) {
                const m = url.match(TYPE_REG)
                console.debug(url, token, m)
                if (m) {
                  const type = m[1]
                  // eslint-disable-next-line no-unused-expressions
                  l[type]?.(token)
                }
              }
              return fetch(url, init)
            }
          })
        }
      }
    })

    Object.setPrototypeOf(document.body, p)
  } catch (err) {
    console.error(err)
  }

  return async (type: FileType) => {
    return new Promise<string>((resolve) => {
      l[type] = (token) => {
        resolve(token)
        magics[type] = token
      }
    })
  }
})()

export const magics: Record<FileType, Promise<string>> = {
  img: magicHookConstr('img'),
  midi: magicHookConstr('midi'),
  mp3: magicHookConstr('mp3'),
}
