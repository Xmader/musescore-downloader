/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { name as pkgName, version as pkgVer } from '../package.json'
import { getFetch } from './utils'

const IS_NPX_REG = /_npx(\/|\\)\d+\1/
const NPM_REGISTRY = 'https://registry.npmjs.org'

export function isNpx (): boolean {
  // file is in a npx cache dir
  // TODO: installed locally?
  return __dirname.match(IS_NPX_REG) !== null
}

export function getSelfVer (): string {
  return pkgVer
}

export async function getLatestVer (_fetch = getFetch()): Promise<string> {
  // fetch pkg info from the npm registry
  const r = await _fetch(`${NPM_REGISTRY}/${pkgName}`)
  const json = await r.json()
  return json['dist-tags'].latest as string
}

export async function getVerInfo () {
  const installed = getSelfVer()
  const latest = await getLatestVer()
  return {
    installed,
    latest,
    isLatest: installed === latest,
  }
}
