
import { loadMscore, WebMscore } from './mscore'
import { saveAs } from './utils'

type BtnElement = HTMLButtonElement

/**
 * Select the original Download Button
 */
export const getDownloadBtn = (): BtnElement => {
  const btnsDiv = document.querySelector('.score-right .buttons-wrapper') || document.querySelectorAll('aside > section > section > div')[3]
  const btn = btnsDiv.querySelector('button, .button') as BtnElement
  btn.onclick = null

  // fix the icon of the download btn
  // if the `btn` seleted was a `Print` btn, replace the `print` icon with the `download` icon
  const svgPath: SVGPathElement | null = btn.querySelector('svg > path')
  if (svgPath) {
    svgPath.setAttribute('d', 'M9.6 2.4h4.8V12h2.784l-5.18 5.18L6.823 12H9.6V2.4zM19.2 19.2H4.8v2.4h14.4v-2.4z')
  }

  if (btn.nodeName.toLowerCase() === 'button') {
    btn.setAttribute('style', 'width: 205px !important')
  } else {
    btn.dataset.target = ''
  }

  return btn
}

interface BtnOptions {
  readonly name: string;
  readonly action: BtnAction;
  readonly disabled?: boolean;
  readonly tooltip?: string;
}

export class BtnList {
  private readonly list: BtnElement[] = [];

  constructor (private templateBtn: BtnElement) { }

  add (options: BtnOptions): BtnElement {
    const btn = this.templateBtn.cloneNode(true) as HTMLButtonElement

    const textNode = [...btn.childNodes].find((x) => {
      const txt = x.textContent as string
      return txt.includes('Download') || txt.includes('Print')
    }) as Node

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

  /**
   * replace the template button with the list of new buttons
   */
  commit (): void {
    this.templateBtn.replaceWith(...this.list)
  }
}

type BtnAction = (btnName: string, btnEl: BtnElement, setText: (str: string) => void) => any

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace BtnAction {

  export const PROCESSING_TEXT = 'Processing…'
  export const ERROR_TEXT = '❌Download Failed!'

  const deprecationNotice = (btnName: string): string => {
    return `DEPRECATED!\nUse \`${btnName}\` inside \`Individual Parts\` instead.\n(This may still work. Click \`OK\` to continue.)`
  }

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

  export const download = (url: UrlInput): BtnAction => {
    return process(async (): Promise<any> => {
      const _url = await normalizeUrlInput(url)
      const a = document.createElement('a')
      a.href = _url
      a.dispatchEvent(new MouseEvent('click'))
    })
  }

  export const mscoreWindow = (fn: (w: Window, score: WebMscore, processingTextEl: ChildNode) => any): BtnAction => {
    return async (btnName, btn, setText) => {
      const _onclick = btn.onclick
      btn.onclick = null
      setText(BtnAction.PROCESSING_TEXT)

      const w = window.open('') as Window
      const txt = document.createTextNode(BtnAction.PROCESSING_TEXT)
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
      setText(PROCESSING_TEXT)

      try {
        await fn()
        setText(name)
      } catch (err) {
        setText(ERROR_TEXT)
        console.error(err)
      }

      btn.onclick = _onclick
    }
  }

  export const deprecate = (action: BtnAction): BtnAction => {
    return (name, btn, setText) => {
      alert(deprecationNotice(name))
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return action(name, btn, setText)
    }
  }

}
