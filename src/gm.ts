
/**
 * UserScript APIs
 */
declare const GM: {
  /** https://www.tampermonkey.net/documentation.php#GM_info */
  info: Record<string, any>;

  /** https://www.tampermonkey.net/documentation.php#GM_registerMenuCommand */
  registerMenuCommand (name: string, fn: () => any, accessKey?: string): Promise<number>;
}
export const _GM = GM

type GM = typeof GM

export const isGmAvailable = (requiredMethod: keyof GM = 'info'): boolean => {
  return typeof GM !== 'undefined' &&
    typeof GM[requiredMethod] !== 'undefined'
}
