
import { createLocale } from './utils'

export default createLocale({
  'PROCESSING' () {
    return 'Caricamento…' as const
  },
  'BTN_ERROR' () {
    return '❌Download Fallito!' as const
  },

  'DEPRECATION_NOTICE' (btnName: string) {
    return `¡DEPRECATO!\nUtilizzare \`${btnName}\` all'interno di \`Parti Indivduali\`.\n(Qusto potrebbe funzionare. Cliccare \`Ok\` per continuare.)` as const
  },

  'DOWNLOAD' <T extends string> (fileType: T) {
    return `Scaricare ${fileType}` as const
  },
  'DOWNLOAD_AUDIO' <T extends string> (fileType: T) {
    return `Scaricare ${fileType} Audio` as const
  },

  'IND_PARTS' () {
    return 'Parti Singole' as const
  },
  'IND_PARTS_TOOLTIP' () {
    return 'Scaricare Parti Singole (BETA)' as const
  },

  'VIEW_IN_LIBRESCORE' () {
    return 'Visualizzare in LibreScore' as const
  },

  'FULL_SCORE' () {
    return 'Spartito Completo' as const
  },
})
