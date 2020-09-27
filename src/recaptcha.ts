
/**
 * the site key for Google reCAPTCHA v3
 */
const SITE_KEY = '6Ldxtt8UAAAAALvcRqWTlVOVIB7MmEWwN-zw_9fM'

type token = string;
interface GRecaptcha {
  ready (cb: () => any): void;
  execute (siteKey: string, opts: { action: string }): Promise<token>;
}

let gr: GRecaptcha | Promise<GRecaptcha>

/**
 * load reCAPTCHA
 */
const load = (): Promise<GRecaptcha> => {
  // load script
  const script = document.createElement('script')
  script.src = `https://www.recaptcha.net/recaptcha/api.js?render=${SITE_KEY}`
  script.async = true
  document.body.appendChild(script)

  // add css
  const style = document.createElement('style')
  style.innerHTML = '.grecaptcha-badge { display: none !important; }'
  document.head.appendChild(style)

  return new Promise((resolve) => {
    script.onload = (): void => {
      const grecaptcha: GRecaptcha = window['grecaptcha']
      grecaptcha.ready(() => resolve(grecaptcha))
    }
  })
}

export const init = (): GRecaptcha | Promise<GRecaptcha> => {
  if (!gr) {
    gr = load()
  }
  return gr
}

export const execute = async (): Promise<token> => {
  const captcha = await init()
  return captcha.execute(SITE_KEY, { action: 'downloadmscz' })
}
