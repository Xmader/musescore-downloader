
import { createLocale } from './utils'

export default createLocale({
  'PROCESSING' () {
    return 'Cargando…' as const
  },
  'BTN_ERROR' () {
    return '❌¡Descarga Fallida!' as const
  },

  'DEPRECATION_NOTICE' (btnName: string) {
    return `¡OBSOLETO!\nUtilizar \`${btnName}\` dentro de \`Partes Indivduales\` en su lugar.\n(Esto todavía puede funcionar. Pulsa \`Aceptar\` para continuar.)` as const
  },

  'DOWNLOAD' <T extends string> (fileType: T) {
    return `Descargar ${fileType}` as const
  },
  'DOWNLOAD_AUDIO' <T extends string> (fileType: T) {
    return `Descargar Audio ${fileType}` as const
  },

  'IND_PARTS' () {
    return 'Partes individuales' as const
  },
  'IND_PARTS_TOOLTIP' () {
    return 'Descargar partes individuales (BETA)' as const
  },

  'VIEW_IN_LIBRESCORE' () {
    return 'Visualizar en LibreScore' as const
  },

  'FULL_SCORE' () {
    return 'Partitura Completa' as const
  },
})
