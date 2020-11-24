/* eslint-disable no-void */

import inquirer from 'inquirer'
import ora from 'ora'
import chalk from 'chalk'
import fs from 'fs'
import { fetchMscz } from './mscz'
import { loadMscore, INDV_DOWNLOADS, WebMscore } from './mscore'
import { ScoreInfoHtml } from './scoreinfo'
import i18n from './i18n'

const SCORE_URL_PREFIX = 'https://musescore.com/'

void (async () => {
  // ask for the page url
  const { url } = await inquirer.prompt({
    type: 'input',
    name: 'url',
    message: 'Score URL:',
    suffix: ` (starts with "${SCORE_URL_PREFIX}")\n `,
    validate (input: string) {
      return input && input.startsWith(SCORE_URL_PREFIX)
    },
  })

  // request scoreinfo
  const scoreinfo = await ScoreInfoHtml.request(url)
  const fileName = scoreinfo.fileName

  // confirmation
  const { confirmed } = await inquirer.prompt({
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
    spinner.info(`File URL: ${scoreinfo.msczUrl}`)
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
  const { part }: { part: number } = await inquirer.prompt({
    type: 'list',
    name: 'part',
    message: 'Part Selection',
    choices: partChoices,
  })
  const partName = partChoices[part + 1].name
  await score.setExcerptId(part)

  // filetype selection
  const { types }: { types: number[] } = await inquirer.prompt({
    type: 'checkbox',
    name: 'types',
    message: 'Filetype Selection',
    choices: typeChoices,
  })
  const filetypes = types.map(i => INDV_DOWNLOADS[i])

  // export files
  spinner.start()
  await Promise.all(
    filetypes.map(async (d) => {
      const data = await d.action(score)
      const f = `${fileName} - ${encodeURIComponent(partName)}.${d.fileExt}`
      await fs.promises.writeFile(f, data)
      spinner.info(`Saved ${chalk.underline(f)}`)
      spinner.start()
    }),
  )
  spinner.succeed('OK')
})()
