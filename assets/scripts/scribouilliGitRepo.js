/**
 * @type {ScribouilliGitRepo}
 */
export default class {
  /**
   *
   * @param { object } _
   * @param { string } [_.repoId]
   * @param { string } _.origin
   * @param { string } _.publishedWebsiteURL
   * @param { string } _.publicRepositoryURL
   * @param { string } _.owner
   * @param { string } _.repoName
   */
  constructor({
    repoId,
    origin,
    publishedWebsiteURL,
    publicRepositoryURL,
    owner,
    repoName,
  }) {
    this.origin = origin
    this.publishedWebsiteURL = publishedWebsiteURL
    this.publicRepositoryURL = publicRepositoryURL
    this.owner = owner
    this.repoName = repoName

    this.repoId = repoId ? repoId : makeRepoId(owner, repoName)

    Object.freeze(this)
  }

  get hostname() {
    return new URL(origin).hostname
  }

  get repoDirectory() {
    return `/${this.hostname}/${this.repoId}`
  }

  get remoteURL() {
    return `${this.origin}/${this.repoId}.git`
  }

  /**
   *
   * @param {string} filename
   * @returns {string}
   */
  path(filename) {
    return `${this.repoDirectory}/${filename}`
  }
}

/**
 *
 * @param {string} owner // may be an individual Github user or an organisation
 * @param {string} repoName
 * @returns {string}
 */
export function makeRepoId(owner, repoName) {
  return `${owner}/${repoName}`
}

/**
 *
 * @param {string} owner // may be an individual Github user or an organisation
 * @param {string} repoName
 * @param {string} origin
 * @returns {string}
 */
export function makePublicRepositoryURL(owner, repoName, origin) {
  return `${origin}/${owner}/${repoName}`
}

/**
 *
 * @param {string} owner // may be an individual Github user or an organisation
 * @param {string} repoName
 * @param {string} origin
 * @returns {string}
 */
export function makePublishedWebsiteURL(owner, repoName, origin) {
  if (origin === 'https://github.com') {
    const publishedOrigin = `${owner.toLowerCase()}.github.io`
    repoName = repoName.toLowerCase()

    if (publishedOrigin === repoName) {
      return `https://${publishedOrigin}/`
    } else {
      return `https://${publishedOrigin}/${repoName}`
    }
  } else if (origin === 'https://gitlab.com') {
    return `https://${owner.toLowerCase()}.gitlab.io/${repoName.toLowerCase()}`
  }

  return ''
}
