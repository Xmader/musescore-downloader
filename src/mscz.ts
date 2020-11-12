
import { saveAs } from './utils'
import scoreinfo from './scoreinfo'

let msczBufferP: Promise<ArrayBuffer> | undefined

export const fetchMscz = async (): Promise<ArrayBuffer> => {
  if (!msczBufferP) {
    const url = scoreinfo.msczUrl
    msczBufferP = (async (): Promise<ArrayBuffer> => {
      const r = await fetch(url)
      const data = await r.arrayBuffer()
      return data
    })()
  }

  return msczBufferP
}

export const downloadMscz = async (): Promise<void> => {
  const data = new Blob([await fetchMscz()])
  const filename = scoreinfo.fileName
  saveAs(data, `${filename}.mscz`)
}
