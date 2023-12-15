export const OAUTH_PROVIDER_STORAGE_KEY = 'scribouilli_oauth_provider'
export const TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER = 'access_token'
export const TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER = 'type'
export const TOCTOCTOC_OAUTH_PROVIDER_ORIGIN_PARAMETER = 'origin'
export const defaultRepositoryName = 'mon-scribouilli'
export const gitHubApiBaseUrl = 'https://api.github.com'

/** @type {GitSiteTemplate[] & {default: GitSiteTemplate}} */
// @ts-ignore
export const templates = [
  {
    url: 'https://github.com/Scribouilli/site-template.git',
    description: 'mon site vitrine ou mon blog',
    githubRepoId: 'Scribouilli/site-template',
  },
  {
    url: 'https://github.com/Scribouilli/site-template-framalibre.git',
    description: 'ma liste de recommandations liée à Framalibre',
    githubRepoId: 'Scribouilli/site-template-framalibre',
  },
]

templates.default = templates[0]

const body = document.querySelector('body')
if (!body) {
  throw new TypeError(
    `Missing <body>. Maybe the script should be loaded as @defer`,
  )
}

/** @type {Element} */
export const svelteTarget = body
