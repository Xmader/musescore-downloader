
import FileSaver from 'file-saver/dist/FileSaver.js'

export const saveAs: typeof import('file-saver').saveAs = FileSaver.saveAs

export const getIndexPath = (id: number): string => {
  const idStr = String(id)
  // 获取最后三位，倒序排列
  // x, y, z are the reversed last digits of the score id. Example: id 123456789, x = 9, y = 8, z = 7
  // https://developers.musescore.com/#/file-urls
  // "5449062" -> ["2", "6", "0"]
  const indexN = idStr.split('').reverse().slice(0, 3)
  return indexN.join('/')
}

export const fetchData = async (url: string, init?: RequestInit): Promise<Uint8Array> => {
  const r = await fetch(url, init)
  const data = await r.arrayBuffer()
  return new Uint8Array(data)
}

export const waitForDocumentLoaded = (): Promise<void> => {
  if (document.readyState !== 'complete') {
    return new Promise(resolve => {
      document.addEventListener('readystatechange', () => {
        if (document.readyState === 'complete') {
          resolve()
        }
      }, { once: true })
    })
  } else {
    return Promise.resolve()
  }
}
