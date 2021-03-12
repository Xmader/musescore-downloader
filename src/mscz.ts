
import { assertRes, getFetch } from './utils'
import { ScoreInfo } from './scoreinfo'

export const MSCZ_BUF_SYM = Symbol('msczBufferP')
export const MSCZ_URL_SYM = Symbol('msczUrl')
export const MAIN_CID_SYM = Symbol('mainCid')

const IPNS_KEY = 'QmSdXtvzC8v8iTTZuj5cVmiugnzbR1QATYRcGix4bBsioP'
const IPNS_RS_URL = `https://ipfs.io/api/v0/dag/resolve?arg=/ipns/${IPNS_KEY}`

export const getMainCid = async (scoreinfo: ScoreInfo, _fetch = getFetch()): Promise<string> => {
  // look for the persisted msczUrl inside scoreinfo
  let result = scoreinfo.store.get(MAIN_CID_SYM) as string
  if (result) {
    return result
  }

  const r = await _fetch(IPNS_RS_URL)
  assertRes(r)
  const json = await r.json()
  result = json.Cid['/']

  scoreinfo.store.set(MAIN_CID_SYM, result) // persist to scoreinfo
  return result
}

export const loadMsczUrl = async (scoreinfo: ScoreInfo, _fetch = getFetch()): Promise<string> => {
  // look for the persisted msczUrl inside scoreinfo
  let result = scoreinfo.store.get(MSCZ_URL_SYM) as string
  if (result) {
    return result
  }

  const mainCid = await getMainCid(scoreinfo, _fetch)

  const url = scoreinfo.getMsczCidUrl(mainCid)
  const r0 = await _fetch(url)
  // ipfs-http-gateway specific error
  // may read further error msg as json
  if (r0.status !== 500) {
    assertRes(r0)
  }
  const cidRes: { Key: string; Message: string } = await r0.json()

  const cid = cidRes.Key
  if (!cid) {
    // read further error msg
    const err = cidRes.Message
    if (err.includes('no link named')) { // file not found
      throw new Error('Score not in dataset')
    } else {
      throw new Error(err)
    }
  }
  result = `https://ipfs.infura.io/ipfs/${cid}`

  scoreinfo.store.set(MSCZ_URL_SYM, result) // persist to scoreinfo
  return result
}

export const fetchMscz = async (scoreinfo: ScoreInfo, _fetch = getFetch()): Promise<ArrayBuffer> => {
  let msczBufferP = scoreinfo.store.get(MSCZ_BUF_SYM) as Promise<ArrayBuffer> | undefined

  if (!msczBufferP) {
    msczBufferP = (async (): Promise<ArrayBuffer> => {
      const url = await loadMsczUrl(scoreinfo, _fetch)
      const r = await _fetch(url)
      assertRes(r)
      const data = await r.arrayBuffer()
      return data
    })()
    scoreinfo.store.set(MSCZ_BUF_SYM, msczBufferP)
  }

  return msczBufferP
}

// eslint-disable-next-line @typescript-eslint/require-await
export const setMscz = async (scoreinfo: ScoreInfo, buffer: ArrayBuffer): Promise<void> => {
  scoreinfo.store.set(MSCZ_BUF_SYM, Promise.resolve(buffer))
}

export const downloadMscz = async (scoreinfo: ScoreInfo, saveAs: typeof import('file-saver').saveAs): Promise<void> => {
  const data = new Blob([await fetchMscz(scoreinfo)])
  const filename = scoreinfo.fileName
  saveAs(data, `${filename}.mscz`)
}
