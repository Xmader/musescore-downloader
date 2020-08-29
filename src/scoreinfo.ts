
import { ScorePlayerData } from './types'

const scoreinfo = {

  get playerdata (): ScorePlayerData {
    // @ts-ignore
    return window.UGAPP.store.jmuse_settings.score_player
  },

  get id (this: typeof scoreinfo): number {
    return this.playerdata.json.id
  },

  get title (this: typeof scoreinfo): string {
    try {
      return this.playerdata.json.metadata.title
    } catch (_) {
      return ''
    }
  },

  get fileName (this: typeof scoreinfo): string {
    return this.title.replace(/[\s<>:{}"/\\|?*~.\0\cA-\cZ]+/g, '_')
  },

  get pageCount (this: typeof scoreinfo): number {
    try {
      return this.playerdata.json.metadata.pages
    } catch (_) {
      return document.querySelectorAll('img[src*=score_]').length
    }
  },

  get baseUrl (this: typeof scoreinfo): string {
    return this.playerdata.urls.image_path
  },

  get mxlUrl (this: typeof scoreinfo): string {
    return this.baseUrl + 'score.mxl'
  },

  get midiUrl (this: typeof scoreinfo): string {
    return this.playerdata.urls.midi
  },

  get mp3Url (this: typeof scoreinfo): string {
    return this.playerdata.urls.mp3
  },

  get msczUrl (this: typeof scoreinfo): string {
    // https://github.com/Xmader/cloudflare-worker-musescore-mscz
    return `https://mscz.librescore.org/?id=${this.id}&name=${this.fileName}&token=`
  },

  get sheetImgType (): 'svg' | 'png' {
    try {
      const imgE = document.querySelector('img[src*=score_]') as HTMLImageElement
      const { pathname } = new URL(imgE.src)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const imgtype = pathname.match(/\.(\w+)$/)![1]
      return imgtype as 'svg' | 'png'
    } catch (_) {
      // return null
      return 'svg'
    }
  },
}

export default scoreinfo
