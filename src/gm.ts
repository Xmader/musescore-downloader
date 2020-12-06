
/**
 * UserScript APIs
 */
declare const GM: {
  /** https://www.tampermonkey.net/documentation.php#GM_registerMenuCommand */
  registerMenuCommand (name: string, fn: () => any, accessKey?: string): Promise<number>;
}

type GM = typeof GM

export const isGmAvailable = (): boolean => {
  return typeof GM !== 'undefined' &&
    typeof GM.registerMenuCommand === 'function'
}

export const registerMenuCommand: GM['registerMenuCommand'] = (...args) => {
  return GM.registerMenuCommand(...args)
}
