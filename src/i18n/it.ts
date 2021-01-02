
import { createLocale } from './utils'

export default createLocale({
  'PROCESSING' () {
    return 'Caricamento…' as const
  },
  'BTN_ERROR' () {
    return '❌Download Fallito!' as const
  },

  'DEPRECATION_NOTICE' (btnName: string) {
    return `¡DEPRECATO!\nUtilizza invece \`${btnName}\` all'interno di \`Parti Indivduali\`.\n(Qusto potrebbe funzionare. Clicca \`Ok\` per continuare.)` as const
  },

  'DOWNLOAD' <T extends string> (fileType: T) {
    return `Scarica ${fileType}` as const
  },
  'DOWNLOAD_AUDIO' <T extends string> (fileType: T) {
    return `Scarica ${fileType} Audio` as const
  },

  'IND_PARTS' () {
    return 'Parti Singole' as const
  },
  'IND_PARTS_TOOLTIP' () {
    return 'Scarica Parti Singole (BETA)' as const
  },

  'VIEW_IN_LIBRESCORE' () {
    return 'Visualizzare in LibreScore' as const
  },

  'FULL_SCORE' () {
    return 'Spartito Completo' as const
  },
})
