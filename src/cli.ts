
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-void */

import fs from 'fs'
import path from 'path'
import os from 'os'
import { fetchMscz, setMscz, MSCZ_URL_SYM } from './mscz'
import { loadMscore, INDV_DOWNLOADS, WebMscore } from './mscore'
import { ScoreInfo, ScoreInfoHtml, ScoreInfoObj, getActualId } from './scoreinfo'
import { getLibreScoreLink } from './librescore-link'
import { escapeFilename } from './utils'
import { isNpx, getVerInfo, getSelfVer } from './npm-data'
import i18n from './i18n'

const inquirer: typeof import('inquirer') = require('inquirer')
const ora: typeof import('ora') = require('ora')
const chalk: typeof import('chalk') = require('chalk')

const SCORE_URL_PREFIX = 'https://(s.)musescore.com/'
const SCORE_URL_REG = /https:\/\/(s\.)?musescore\.com\//
const EXT = '.mscz'

interface Params {
  fileInit: string;
  confirmed: boolean;
  part: number;
  types: number[];
  dest: string;
}

void (async () => {
  const arg = process.argv[2]
  if (['-v', '--version'].includes(arg)) { // ran with flag -v or --version, `msdl -v`
    console.log(getSelfVer()) // print musescore-downloader version
    return // exit process
  }

  // Determine platform and paste message
  const platform = os.platform()
  let pasteMessage = ''
  if (platform === 'win32') {
    pasteMessage = 'right-click to paste'
  } else if (platform === 'linux') {
    pasteMessage = 'usually Ctrl+Shift+V to paste'
  } // For MacOS, no hint is needed because the paste shortcut is universal.

  let scoreinfo: ScoreInfo
  let librescoreLink: Promise<string> | undefined
  // ask for the page url or path to local file
  const { fileInit } = await inquirer.prompt<Params>({
    type: 'input',
    name: 'fileInit',
    message: 'Score URL or path to local MSCZ file:',
    suffix: '\n  ' +
      `(starts with "${SCORE_URL_PREFIX}" or local filepath ends with "${EXT}") ` +
      `${chalk.bgGray(pasteMessage)}\n `,
    validate (input: string) {
      return input &&
        (
          !!input.match(SCORE_URL_REG) ||
          (input.endsWith(EXT) && fs.statSync(input).isFile())
        )
    },
    default: arg,
  })

  const isLocalFile = fileInit.endsWith(EXT)
  if (!isLocalFile) {
    // request scoreinfo
    scoreinfo = await ScoreInfoHtml.request(fileInit)
    try {
      await getActualId(scoreinfo as any)
    } catch (err) {
      console.error(err)
    }

    // confirmation
    const { confirmed } = await inquirer.prompt<Params>({
      type: 'confirm',
      name: 'confirmed',
      message: 'Continue?',
      prefix: `${chalk.yellow('!')} ` +
        `ID: ${scoreinfo.id}\n  ` +
        `Title: ${scoreinfo.title}\n `,
      default: true,
    })
    if (!confirmed) return

    // initiate LibreScore link request
    librescoreLink = getLibreScoreLink(scoreinfo)
    librescoreLink.catch(() => '') // silence this unhandled Promise rejection

    // print a blank line to the terminal
    console.log()
  } else {
    scoreinfo = new ScoreInfoObj(0, path.basename(fileInit, EXT))
  }

  const spinner = ora({
    text: i18n('PROCESSING')(),
    color: 'blue',
    spinner: 'bounce',
    indent: 0,
  }).start()

  let score: WebMscore
  let metadata: import('webmscore/schemas').ScoreMetadata
  try {
    if (!isLocalFile) {
      // fetch mscz file from the dataset, and cache it for side effect
      await fetchMscz(scoreinfo)
    } else {
      // load local file
      const data = await fs.promises.readFile(fileInit)
      await setMscz(scoreinfo, data.buffer)
    }

    spinner.info('MSCZ file loaded')
    if (!isLocalFile) {
      spinner.info(`File URL: ${scoreinfo.store.get(MSCZ_URL_SYM) as string}`)
    }
    if (librescoreLink) {
      try {
        spinner.info(`${i18n('VIEW_IN_LIBRESCORE')()}: ${await librescoreLink}`)
      } catch { } // it doesn't affect the main feature
    }
    spinner.start()

    // load score using webmscore
    score = await loadMscore(scoreinfo)
    metadata = await score.metadata()

    spinner.info('Score loaded by webmscore')
  } catch (err) {
    spinner.fail(err.message)
    spinner.info(
      'Send your URL to the #dataset-bugs channel in the LibreScore Community Discord server:\n  ' +
      'https://discord.gg/kTyx6nUjMv',
    )
    return
  }
  spinner.succeed('OK\n')

  // build part choices
  const partChoices = metadata.excerpts.map(p => ({ name: p.title, value: p.id }))
  // add the "full score" option as a "part" 
  partChoices.unshift({ value: -1, name: i18n('FULL_SCORE')() })
  // build filetype choices
  const typeChoices = INDV_DOWNLOADS.map((d, i) => ({ name: d.name, value: i }))

  // part selection
  const { part } = await inquirer.prompt<Params>({
    type: 'list',
    name: 'part',
    message: 'Part Selection',
    choices: partChoices,
  })
  const partName = partChoices[part + 1].name
  await score.setExcerptId(part)

  // filetype selection
  const { types } = await inquirer.prompt<Params>({
    type: 'checkbox',
    name: 'types',
    message: 'Filetype Selection',
    choices: typeChoices,
    validate (input: number[]) {
      return input.length >= 1
    },
  })
  const filetypes = types.map(i => INDV_DOWNLOADS[i])

  // destination directory
  const { dest } = await inquirer.prompt<Params>({
    type: 'input',
    name: 'dest',
    message: 'Destination Directory:',
    validate (input: string) {
      return input && fs.statSync(input).isDirectory()
    },
    default: process.cwd(),
  })

  // export files
  const fileName = scoreinfo.fileName || await score.titleFilenameSafe()
  spinner.start()
  await Promise.all(
    filetypes.map(async (d) => {
      const data = await d.action(score)
      const n = `${fileName} - ${escapeFilename(partName)}.${d.fileExt}`
      const f = path.join(dest, n)
      await fs.promises.writeFile(f, data)
      spinner.info(`Saved ${chalk.underline(f)}`)
      spinner.start()
    }),
  )
  spinner.succeed('OK')

  if (!isNpx()) {
    const { installed, latest, isLatest } = await getVerInfo()
    if (!isLatest) {
      console.log(chalk.yellowBright(`\nYour installed version (${installed}) of the musescore-downloader CLI is not the latest one (${latest})!\nRun npm i -g musescore-downloader@${latest} to update.`))
    }
  }
})()
