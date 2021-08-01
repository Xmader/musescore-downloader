
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-void */

import fs from 'fs'
import path from 'path'
import os from 'os'
import { fetchMscz, setMscz, MSCZ_URL_SYM } from './mscz'
import { loadMscore, INDV_DOWNLOADS, WebMscore } from './mscore'
import { ScoreInfo, ScoreInfoHtml, ScoreInfoObj, getActualId } from './scoreinfo'
import { getLibreScoreLink } from './librescore-link'
import { escapeFilename, DISCORD_URL, fetchBuffer } from './utils'
import { isNpx, getVerInfo, getSelfVer } from './npm-data'
import { getFileUrl } from './file'
import { exportPDF } from './pdf'
import i18n from './i18n'

const inquirer: typeof import('inquirer') = require('inquirer')
const ora: typeof import('ora') = require('ora')
const chalk: typeof import('chalk') = require('chalk')

const SCORE_URL_PREFIX = 'https://(s.)musescore.com/'
const SCORE_URL_REG = /https:\/\/(s\.)?musescore\.com\//
const EXT = '.mscz'

type ExpDlType = 'midi' | 'mp3' | 'pdf'

interface Params {
  fileInit: string;
  confirmed: boolean;
  useExpDL: boolean;
  expDlTypes: ExpDlType[];
  part: number;
  types: number[];
  dest: string;
}

/**
 * Prompt for destination directory
 */
const promptDest = async () => {
  const { dest } = await inquirer.prompt<Params>({
    type: 'input',
    name: 'dest',
    message: 'Destination Directory:',
    validate (input: string) {
      return input && fs.statSync(input).isDirectory()
    },
    default: process.cwd(),
  })
  return dest
}

const createSpinner = () => {
  return ora({
    text: i18n('PROCESSING')(),
    color: 'blue',
    spinner: 'bounce',
    indent: 0,
  }).start()
}

const checkboxValidate = (input: number[]) => {
  return input.length >= 1
}

/**
 * MIDI/MP3/PDF express download using the file API (./file.ts)
 */
const expDL = async (scoreinfo: ScoreInfoHtml) => {
  // print a blank line
  console.log()

  // filetype selection
  const { expDlTypes } = await inquirer.prompt<Params>({
    type: 'checkbox',
    name: 'expDlTypes',
    message: 'Filetype Selection',
    choices: [
      'midi', 'mp3', 'pdf', // ExpDlType
      new inquirer.Separator(),
      new inquirer.Separator(
        'Unavailable in express download\n' +
        ' - MSCZ\n' +
        ' - MusicXML\n' +
        ' - FLAC/OGG Audio\n' +
        ' - Individual Parts',
      ),
    ],
    validate: checkboxValidate,
    pageSize: Infinity,
  })

  // destination directory selection
  const dest = await promptDest()
  const spinner = createSpinner()

  await Promise.all(
    expDlTypes.map(async (type) => {
      // download/generate file data
      let fileData: Buffer
      switch (type) {
        case 'midi':
        case 'mp3': {
          const fileUrl = await getFileUrl(scoreinfo.id, type)
          fileData = await fetchBuffer(fileUrl)
          break
        }

        case 'pdf': {
          fileData = Buffer.from(
            await exportPDF(scoreinfo, scoreinfo.sheet),
          )
          break
        }
      }

      // save to filesystem
      const f = path.join(dest, `${scoreinfo.fileName}.${type}`)
      await fs.promises.writeFile(f, fileData)
      spinner.info(`Saved ${chalk.underline(f)}`)
    }),
  )

  spinner.succeed('OK')
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

    // print a blank line
    console.log()

    // ask for express download
    const { useExpDL } = await inquirer.prompt<Params>({
      type: 'confirm',
      name: 'useExpDL',
      prefix: `${chalk.blueBright('ℹ')} ` +
        'MIDI/MP3/PDF express download is now available.\n ',
      message: '🚀 Give it a try?',
      default: true,
    })
    if (useExpDL) return expDL(scoreinfo as ScoreInfoHtml)

    // initiate LibreScore link request
    librescoreLink = getLibreScoreLink(scoreinfo)
    librescoreLink.catch(() => '') // silence this unhandled Promise rejection

    // print a blank line to the terminal
    console.log()
  } else {
    scoreinfo = new ScoreInfoObj(0, path.basename(fileInit, EXT))
  }

  const spinner = createSpinner()

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
      'Send your URL to the #dataset-patcher channel in the LibreScore Community Discord server:\n  ' +
      DISCORD_URL,
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
    validate: checkboxValidate,
  })
  const filetypes = types.map(i => INDV_DOWNLOADS[i])

  // destination directory
  const dest = await promptDest()

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
