import { exec as _exec } from 'child_process'
import { promisify } from 'util'

const exec = promisify(_exec)

export async function isNpx() {
  const output = await exec('npm list -g musescore-downloader')
  return output.stdout.includes('(empty)')
}

export async function installedVersion() {
  return require('../package.json').version
}

export async function latestVersion() {
  return (await exec('npm info musescore-downloader version')).stdout.trim()
}

export async function isLatest() {
  return await installedVersion() === await latestVersion()
}
