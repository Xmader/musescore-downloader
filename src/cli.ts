
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-void */

import fs from 'fs'
import { fetchMscz, MSCZ_URL_SYM } from './mscz'
import { loadMscore, INDV_DOWNLOADS, WebMscore } from './mscore'
import { ScoreInfoHtml } from './scoreinfo'
import { escapeFilename } from './utils'
import i18n from './i18n'

const inquirer: typeof import('inquirer') = require('inquirer')
const ora: typeof import('ora') = require('ora')
const chalk: typeof import('chalk') = require('chalk')

const SCORE_URL_PREFIX = 'https://musescore.com/'

interface Params {
  url: string;
  confirmed: boolean;
  part: number;
  types: number[];
  dest: string;
}

void (async () => {
  // ask for the page url
  const { url } = await inquirer.prompt<Params>({
    type: 'input',
    name: 'url',
    message: 'Score URL:',
    suffix: ` (starts with "${SCORE_URL_PREFIX}")\n `,
    validate (input: string) {
      return input && input.startsWith(SCORE_URL_PREFIX)
    },
    default: process.argv[2],
  })

  // request scoreinfo
  const scoreinfo = await ScoreInfoHtml.request(url)
  const fileName = scoreinfo.fileName

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

  console.log()
  const spinner = ora({
    text: i18n('PROCESSING')(),
    color: 'blue',
    spinner: 'bounce',
    indent: 0,
  }).start()

  let score: WebMscore
  let metadata: import('webmscore/schemas').ScoreMetadata
  try {
    // fetch mscz file from the dataset, and cache it for side effect
    await fetchMscz(scoreinfo)

    spinner.info('MSCZ file loaded')
    spinner.info(`File URL: ${scoreinfo.store.get(MSCZ_URL_SYM) as string}`)
    spinner.start()

    // load score using webmscore
    score = await loadMscore(scoreinfo)
    metadata = await score.metadata()

    spinner.info('Score loaded by webmscore')
  } catch (err) {
    spinner.fail(err.message)
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
  // change working directory
  process.chdir(dest)

  // export files
  spinner.start()
  await Promise.all(
    filetypes.map(async (d) => {
      const data = await d.action(score)
      const f = `${fileName} - ${escapeFilename(partName)}.${d.fileExt}`
      await fs.promises.writeFile(f, data)
      spinner.info(`Saved ${chalk.underline(f)}`)
      spinner.start()
    }),
  )
  spinner.succeed('OK')
})()
