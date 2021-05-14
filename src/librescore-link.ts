import { assertRes, getFetch } from './utils'
import { getMainCid } from './mscz'
import { ScoreInfo } from './scoreinfo'

const _getLink = (indexingInfo: string) => {
  const { scorepack } = JSON.parse(indexingInfo)
  return `https://librescore.org/score/${scorepack as string}`
}

export const getLibreScoreLink = async (scoreinfo: ScoreInfo, _fetch = getFetch()): Promise<string> => {
  const mainCid = await getMainCid(scoreinfo, _fetch)
  const ref = scoreinfo.getScorepackRef(mainCid)
  const url = `https://ipfs.infura.io:5001/api/v0/dag/get?arg=${ref}`

  const r0 = await _fetch(url)
  if (r0.status !== 500) {
    assertRes(r0)
  }
  const res: { Message: string } | string = await r0.json()
  if (typeof res !== 'string') {
    // read further error msg
    throw new Error(res.Message)
  }

  return _getLink(res)
}
