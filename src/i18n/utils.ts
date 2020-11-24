
import type { LOCALE } from './'

/**
 * type checking only so no missing keys
 */
export function createLocale<OBJ extends LOCALE> (obj: OBJ): OBJ {
  return Object.freeze(obj)
}
