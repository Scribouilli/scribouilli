export const ACCESS_TOKEN_STORAGE_KEY = 'scribouilli_access_token'
export const OAUTH_PROVIDER_STORAGE_KEY = 'scribouilli_oauth_service'
export const OAUTH_PROVIDER_ORIGIN_STORAGE_KEY =
  'scribouilli_oauth_service_origin'
export const TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER = 'access_token'
export const TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER = 'type'
export const defaultRepositoryName = 'mon-scribouilli'
export const gitHubApiBaseUrl = 'https://api.github.com'
export const defaultRepoOwner = 'Scribouilli'
export const defaultThemeRepoName = 'site-template'
export const repoTemplateGitUrl =
  'https://gitlab.com/scribouilli/site-template.git'

const body = document.querySelector('body')
if (!body) {
  throw new TypeError(
    `Missing <body>. Maybe the script should be loaded as @defer`,
  )
}

/** @type {Element} */
export const svelteTarget = body
