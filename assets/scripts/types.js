/**
 * @typedef {Object} OAuthProvider
 * @property {function} getServiceAPI
 */

/**
 * @typedef {Object} OAuthServiceAPI
 * @property {function} callAPI
 * @property {function} getAuthenticatedUser
 * @property {function} getUserEmails
 * @property {function} getRepository
 * @property {function} getCurrentUserRepositories
 * @property {function} createDefaultRepository
 * @property {function} setupRepository
 * @property {function} deleteRepository
 * @property {function} createPagesWebsiteFromRepository
 * @property {function} getPagesWebsite
 * @property {function} isPagesWebsiteBuilt
 * @property {function} isRepositoryReady
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
