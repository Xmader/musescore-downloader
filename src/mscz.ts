
import { saveAs, assertRes } from './utils'
import { ScoreInfo } from './scoreinfo'

const MSCZ_BUF_SYM = Symbol('msczBufferP')

export const fetchMscz = async (scoreinfo: ScoreInfo): Promise<ArrayBuffer> => {
  let msczBufferP = scoreinfo.store.get(MSCZ_BUF_SYM) as Promise<ArrayBuffer> | undefined

  if (!msczBufferP) {
    const url = scoreinfo.msczCidUrl
    msczBufferP = (async (): Promise<ArrayBuffer> => {
      const r0 = await fetch(url)
      assertRes(r0)
      const { Key } = await r0.json()
      const r = await fetch(`https://ipfs.infura.io/ipfs/${Key as string}`)
      assertRes(r)
      const data = await r.arrayBuffer()
      return data
    })()
    scoreinfo.store.set(MSCZ_BUF_SYM, msczBufferP)
  }

  return msczBufferP
}

export const downloadMscz = async (scoreinfo: ScoreInfo): Promise<void> => {
  const data = new Blob([await fetchMscz(scoreinfo)])
  const filename = scoreinfo.fileName
  saveAs(data, `${filename}.mscz`)
}
