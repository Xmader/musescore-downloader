
type BtnElement = HTMLElement

/**
 * Select the original Download Button
 */
export const getDownloadBtn = (): BtnElement => {
  const btnsDiv = document.querySelector('.score-right .buttons-wrapper') || document.querySelectorAll('aside section section > div')[4]
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

  export const openUrl = (url: string): BtnAction => {
    return (): any => window.open(url)
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

}
