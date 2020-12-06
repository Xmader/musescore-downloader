
/**
 * UserScript APIs
 */
declare const GM: {
  /** https://www.tampermonkey.net/documentation.php#GM_info */
  info: Record<string, any>;

  /** https://www.tampermonkey.net/documentation.php#GM_registerMenuCommand */
  registerMenuCommand (name: string, fn: () => any, accessKey?: string): Promise<number>;

  /** https://github.com/Tampermonkey/tampermonkey/issues/881#issuecomment-639705679 */
  addElement<K extends keyof HTMLElementTagNameMap> (tagName: K, properties: Record<string, any>): Promise<HTMLElementTagNameMap[K]>;
}
export const _GM = GM

type GM = typeof GM

export const isGmAvailable = (requiredMethod: keyof GM = 'info'): boolean => {
  return typeof GM !== 'undefined' &&
    typeof GM[requiredMethod] !== 'undefined'
}
