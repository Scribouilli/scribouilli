export const ACCESS_TOKEN_STORAGE_KEY = 'scribouilli_access_token'
export const OAUTH_PROVIDER_STORAGE_KEY = 'scribouilli_oauth_service'
export const TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER = 'access_token'
export const TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER = 'type'
export const defaultRepositoryName = 'mon-scribouilli'

const body = document.querySelector('body')
if (!body) {
  throw new TypeError(
    `Missing <body>. Maybe the script should be loaded as @defer`,
  )
}

/** @type {Element} */
export const svelteTarget = body
