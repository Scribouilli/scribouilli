/**
 * @typedef {Object} OAuthProvider
 * @property {function} getServiceAPI
 */

/**
 * @typedef {Object} OAuthServiceAPI
 * @property {(url: string, requestParams?: RequestInit) => Promise<Response>} callAPI
 * @property {() => Promise<any>} getAuthenticatedUser
 * @property {() => Promise<GithubUserEmails[]>} getUserEmails
 * @property {(account: string, repositoryName: string) => Promise<GithubRepository>} getRepository
 * @property {() => Promise<GithubRepository[]>} getCurrentUserRepositories
 * @property {(account: string, repositoryName: string) => Promise<any>} createDefaultRepository
 * @property {(account: string, repositoryName: string) => Promise<any>} setupRepository
 * @property {(account: string, repositoryName: string) => Promise<any>} deleteRepository
 * @property {(account: string, repositoryName: string) => Promise<any>} createPagesWebsiteFromRepository
 * @property {(account: string, repositoryName: string) => Promise<any>} getPagesWebsite
 * @property {(account: string, repositoryName: string) => Promise<boolean>} isPagesWebsiteBuilt
 * @property {(account: string, repositoryName: string) => Promise<boolean>} isRepositoryReady
 */

/**
 * @typedef {Object} GithubOptions
 * @property {string} accessToken
 */

/**
 * @typedef {Object} GitlabOptions
 * @property {string} accessToken
 * @property {string} origin
 * @property {string} refreshToken
 * @property {string} expiredIn
 * @property {string} state
 */

/**
 * @typedef {Object} GithubUserEmails
 * @property {string} email
 * @property {boolean} primary
 */

/**
 * @typedef {Object} GithubDeployment
 * @property {string} statuses_url
 */

/**
 * @typedef {Object} GithubRepository
 * @property {string} name
 * @property {Object} owner
 * @property {string} owner.login
 */

/** @typedef {"building" | "built" | "errored"} BuildStatus */

/**
 * @typedef {Object} EditeurFile
 * @property {string} fileName
 * @property {string} content
 * @property {string | undefined} previousContent
 * @property {string} title
 * @property {number} index
 * @property {string | undefined} previousTitle
 */

/**
 * @typedef {Object} FileContenu
 * @property {string} path
 * @property {string} title
 * @property {string} content
 * @property {number} index
 * @property {boolean} inMenu
 */
