
import { createLocale } from './utils'

export default createLocale({
  'PROCESSING' () {
    return '处理中…' as const
  },
  'BTN_ERROR' () {
    return '❌下载失败!' as const
  },

  'DEPRECATION_NOTICE' (btnName: string) {
    return `不建议使用\n请使用 \`单独分谱\` 里的 \`${btnName}\` 按钮代替\n（这也许仍会起作用。单击\`确定\`以继续。）` as const
  },

  'DOWNLOAD' <T extends string> (fileType: T) {
    return `下载 ${fileType}` as const
  },
  'DOWNLOAD_AUDIO' <T extends string> (fileType: T) {
    return `下载 ${fileType} 音频` as const
  },

  'IND_PARTS' () {
    return '单独分谱' as const
  },
  'IND_PARTS_TOOLTIP' () {
    return '下载单独分谱 (BETA)' as const
  },

  'VIEW_IN_LIBRESCORE' () {
    return '在 LibreScore 中查看' as const
  },

  'FULL_SCORE' () {
    return '完整乐谱' as const
  },
})
