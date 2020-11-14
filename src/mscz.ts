
import { saveAs } from './utils'
import scoreinfo from './scoreinfo'

let msczBufferP: Promise<ArrayBuffer> | undefined

export const fetchMscz = async (): Promise<ArrayBuffer> => {
  if (!msczBufferP) {
    const url = scoreinfo.msczCidUrl
    msczBufferP = (async (): Promise<ArrayBuffer> => {
      const r0 = await fetch(url)
      const { Cid: { '/': cid } } = await r0.json()
      const r = await fetch(`https://ipfs.infura.io/ipfs/${cid as string}`)
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
