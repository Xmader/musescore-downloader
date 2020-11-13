
import { loadMscore, WebMscore } from './mscore'
import { useTimeout } from './utils'
import i18n from './i18n'
// @ts-ignore
import btnListCss from './btn.css'

type BtnElement = HTMLButtonElement

const getBtnContainer = (): HTMLDivElement => {
  const container = document.querySelectorAll('aside>section>section')[0]
  return [...container.children].find((div) => {
    const b = div.querySelector('button, .button')
    return b && b.outerHTML.replace(/\s/g, '').includes('Download')
  }) as HTMLDivElement
}

const buildDownloadBtn = () => {
  const btn = document.createElement('button')
  btn.type = 'button'

  // build icon svg element
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  const svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  svgPath.setAttribute('d', 'M9.6 2.4h4.8V12h2.784l-5.18 5.18L6.823 12H9.6V2.4zM19.2 19.2H4.8v2.4h14.4v-2.4z')
  svgPath.setAttribute('fill', '#fff')
  svg.append(svgPath)

  const textNode = document.createElement('span')
  btn.append(svg, textNode)

  return {
    btn,
    textNode,
  }
}

interface BtnOptions {
  readonly name: string;
  readonly action: BtnAction;
  readonly disabled?: boolean;
  readonly tooltip?: string;
}

export enum BtnListMode {
  InPage,
  ExtWindow,
}

export class BtnList {
  private readonly list: BtnElement[] = [];

  constructor (private getBtnParent: () => HTMLDivElement = getBtnContainer) { }

  add (options: BtnOptions): BtnElement {
    const { btn, textNode } = buildDownloadBtn()
    const setText = (str: string): void => {
      textNode.textContent = str
    }

    setText(options.name)

    btn.onclick = (): void => {
      options.action(options.name, btn, setText)
    }

    this.list.push(btn)

    if (options.disabled) {
      btn.disabled = options.disabled
    }

    if (options.tooltip) {
      btn.title = options.tooltip
    }

    return btn
  }

  private _commit () {
    let btnParent: HTMLDivElement = document.createElement('div')
    try {
      btnParent = this.getBtnParent()
    } catch (err) {
      console.error(err)
    }
    const shadow = btnParent.attachShadow({ mode: 'closed' })

    // style the shadow DOM
    const style = document.createElement('style')
    style.innerText = btnListCss
    shadow.append(style)

    // hide buttons using the shadow DOM
    const newParent = btnParent.cloneNode(false) as HTMLDivElement
    newParent.append(...this.list)
    shadow.append(newParent)

    return btnParent
  }

  /**
   * replace the template button with the list of new buttons
   */
  commit (mode: BtnListMode = BtnListMode.InPage): void {
    switch (mode) {
      case BtnListMode.InPage: {
        // fallback to BtnListMode.ExtWindow
        try {
          this.getBtnParent()
        } catch {
          return this.commit(BtnListMode.ExtWindow)
        }

        let el: Element = this._commit()
        const observer = new MutationObserver(() => {
          // check if the buttons are still in document when dom updates 
          if (!document.contains(el)) {
            // re-commit
            // performance issue?
            el = this._commit()
          }
        })
        observer.observe(document, { childList: true, subtree: true })
        break
      }

      case BtnListMode.ExtWindow: {
        const div = this._commit()
        const w = window.open('', undefined, 'resizable,width=230,height=270')
        // eslint-disable-next-line no-unused-expressions
        w?.document.body.append(div)
        window.addEventListener('unload', () => w?.close())
        break
      }

      default:
        throw new Error('unknown BtnListMode')
    }
  }
}

type BtnAction = (btnName: string, btnEl: BtnElement, setText: (str: string) => void) => any

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace BtnAction {

  type Promisable<T> = T | Promise<T>
  type UrlInput = Promisable<string> | (() => Promisable<string>)

  const normalizeUrlInput = (url: UrlInput) => {
    if (typeof url === 'function') return url()
    else return url
  }

  export const openUrl = (url: UrlInput): BtnAction => {
    return process(async (): Promise<any> => {
      window.open(await normalizeUrlInput(url))
    })
  }

  export const download = (url: UrlInput, fallback?: () => Promisable<void>, timeout = 30 * 1000): BtnAction => {
    return process(async (): Promise<void> => {
      try {
        const _url = await useTimeout(normalizeUrlInput(url), timeout)
        const a = document.createElement('a')
        a.href = _url
        a.dispatchEvent(new MouseEvent('click'))
      } catch (err) {
        // use fallback
        console.error(err)
        return fallback?.()
      }
    })
  }

  export const mscoreWindow = (fn: (w: Window, score: WebMscore, processingTextEl: ChildNode) => any): BtnAction => {
    return async (btnName, btn, setText) => {
      const _onclick = btn.onclick
      btn.onclick = null
      setText(i18n('PROCESSING')())

      const w = window.open('') as Window
      const txt = document.createTextNode(i18n('PROCESSING')())
      w.document.body.append(txt)

      // set page hooks
      // eslint-disable-next-line prefer-const
      let score: WebMscore
      const destroy = (): void => {
        score && score.destroy()
        w.close()
      }
      window.addEventListener('unload', destroy)
      w.addEventListener('beforeunload', () => {
        score && score.destroy()
        window.removeEventListener('unload', destroy)
        setText(btnName)
        btn.onclick = _onclick
      })

      score = await loadMscore(w)

      fn(w, score, txt)
    }
  }

  export const process = (fn: () => any): BtnAction => {
    return async (name, btn, setText): Promise<void> => {
      const _onclick = btn.onclick

      btn.onclick = null
      setText(i18n('PROCESSING')())

      try {
        await fn()
        setText(name)
      } catch (err) {
        setText(i18n('BTN_ERROR')())
        console.error(err)
      }

      btn.onclick = _onclick
    }
  }

  export const deprecate = (action: BtnAction): BtnAction => {
    return (name, btn, setText) => {
      alert(i18n('DEPRECATION_NOTICE')(name))
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return action(name, btn, setText)
    }
  }

}
