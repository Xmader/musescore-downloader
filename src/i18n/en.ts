
import { createLocale } from './utils'

export default createLocale({
  'PROCESSING' () {
    return 'Processing…' as const
  },
  'BTN_ERROR' () {
    return '❌Download Failed!' as const
  },

  'DEPRECATION_NOTICE' (btnName: string) {
    return `DEPRECATED!\nUse \`${btnName}\` inside \`Individual Parts\` instead.\n(This may still work. Click \`OK\` to continue.)` as const
  },

  'DOWNLOAD' <T extends string> (fileType: T) {
    return `Download ${fileType}` as const
  },
  'DOWNLOAD_AUDIO' <T extends string> (fileType: T) {
    return `Download ${fileType} Audio` as const
  },

  'IND_PARTS' () {
    return 'Individual Parts' as const
  },
  'IND_PARTS_TOOLTIP' () {
    return 'Download individual parts (BETA)' as const
  },

  'VIEW_IN_LIBRESCORE' () {
    return 'View in LibreScore' as const
  },

  'FULL_SCORE' () {
    return 'Full score' as const
  },
})
