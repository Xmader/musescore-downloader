import './meta'

import { waitForSheetLoaded } from './utils'
import { BtnList, BtnAction, BtnListMode, ICON } from './btn'
import i18n from './i18n'

const main = (): void => {
  const btnList = new BtnList()

  btnList.add({
    name: 'Update Script',
    action: BtnAction.openUrl('https://github.com/Xmader/musescore-downloader#deprecated'),
    tooltip: 'Please update to the newest version',
    icon: ICON.LIBRESCORE,
    lightTheme: true,
  })

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  btnList.commit(BtnListMode.InPage)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
waitForSheetLoaded().then(main)
