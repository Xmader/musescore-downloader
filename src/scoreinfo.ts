/* eslint-disable @typescript-eslint/no-unsafe-return */

const scoreinfo = {

  get playerdata (): any {
    // @ts-ignore
    return window.UGAPP.store.page.data.score
  },

  get id (this: typeof scoreinfo): number {
    return this.playerdata.id
  },

  get title (this: typeof scoreinfo): string {
    try {
      return this.playerdata.title
    } catch (_) {
      return ''
    }
  },

  get fileName (this: typeof scoreinfo): string {
    return this.title.replace(/[\s<>:{}"/\\|?*~.\0\cA-\cZ]+/g, '_')
  },

  get pageCount (this: typeof scoreinfo): number {
    try {
      return this.playerdata.pages_count
    } catch (_) {
      return document.querySelectorAll('img[src*=score_]').length
    }
  },

  get baseUrl (this: typeof scoreinfo): string {
    const thumbnailUrl = this.playerdata.thumbnails.original
    const { origin, pathname } = new URL(thumbnailUrl)
    // remove the last part
    return origin + pathname.split('/').slice(0, -1).join('/') + '/'
  },

  get midiUrl (this: typeof scoreinfo): string {
    return this.baseUrl + 'score.mid'
  },

  get mp3Url (this: typeof scoreinfo): string {
    return this.baseUrl + 'score.mp3'
  },

  get msczUrl (this: typeof scoreinfo): string {
    // https://github.com/Xmader/cloudflare-worker-musescore-mscz
    return `https://musescore.now.sh/api/mscz?id=${this.id}&token=`
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
