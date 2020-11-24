
import { assertRes, getFetch } from './utils'
import { ScoreInfo } from './scoreinfo'

const MSCZ_BUF_SYM = Symbol('msczBufferP')

export const fetchMscz = async (scoreinfo: ScoreInfo, _fetch = getFetch()): Promise<ArrayBuffer> => {
  let msczBufferP = scoreinfo.store.get(MSCZ_BUF_SYM) as Promise<ArrayBuffer> | undefined

  if (!msczBufferP) {
    const url = scoreinfo.msczCidUrl
    msczBufferP = (async (): Promise<ArrayBuffer> => {
      const r0 = await _fetch(url)
      // ipfs-http-gateway specific error
      // may read further error msg as json
      if (r0.status !== 500) {
        assertRes(r0)
      }
      const cidRes = await r0.json()

      const r = await _fetch(scoreinfo.loadMsczUrl(cidRes))
      assertRes(r)
      const data = await r.arrayBuffer()
      return data
    })()
    scoreinfo.store.set(MSCZ_BUF_SYM, msczBufferP)
  }

  return msczBufferP
}

export const downloadMscz = async (scoreinfo: ScoreInfo, saveAs: typeof import('file-saver').saveAs): Promise<void> => {
  const data = new Blob([await fetchMscz(scoreinfo)])
  const filename = scoreinfo.fileName
  saveAs(data, `${filename}.mscz`)
}
