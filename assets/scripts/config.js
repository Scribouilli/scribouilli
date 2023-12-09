export const OAUTH_PROVIDER_STORAGE_KEY = 'scribouilli_oauth_provider'
export const TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER = 'access_token'
export const TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER = 'type'
export const defaultRepositoryName = 'mon-scribouilli'
export const gitHubApiBaseUrl = 'https://api.github.com'

export const templates = [
  {
    url: 'https://github.com/Scribouilli/site-template.git',
    description: 'Un petit site Scribouilli tout simple',
    githubRepoId: 'Scribouilli/site-template',
  },
  {
    url: 'https://github.com/Scribouilli/site-template-framalibre.git',
    description: 'Un mini-site Framalibre',
    githubRepoId: 'Scribouilli/site-template-framalibre',
  },
]

const body = document.querySelector('body')
if (!body) {
  throw new TypeError(
    `Missing <body>. Maybe the script should be loaded as @defer`,
  )
}

/** @type {Element} */
export const svelteTarget = body
