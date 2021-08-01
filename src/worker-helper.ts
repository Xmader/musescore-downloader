
import { PDFWorkerMessage } from './worker'
import { PDFWorker } from '../dist/cache/worker'

const scriptUrlFromFunction = (fn: () => any): string => {
  const blob = new Blob(['(' + fn.toString() + ')()'], { type: 'application/javascript' })
  return window.URL.createObjectURL(blob)
}

// Node.js fix
if (typeof Worker === 'undefined') {
  globalThis.Worker = class { } as any // noop shim
}

export class PDFWorkerHelper extends Worker {
  constructor () {
    const url = scriptUrlFromFunction(PDFWorker)
    super(url)
  }

  generatePDF (imgURLs: string[], imgType: 'svg' | 'png', width: number, height: number): Promise<ArrayBuffer> {
    const msg: PDFWorkerMessage = [
      imgURLs,
      imgType,
      width,
      height,
    ]
    this.postMessage(msg)
    return new Promise((resolve) => {
      this.addEventListener('message', (e) => {
        resolve(e.data)
      })
    })
  }
}
