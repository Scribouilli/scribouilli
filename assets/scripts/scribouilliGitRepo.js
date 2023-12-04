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

    this.repoId = repoId ? repoId : makeGithubRepoId(owner, repoName)

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
export function makeGithubRepoId(owner, repoName) {
  return `${owner}/${repoName}`
}

/**
 *
 * @param {string} owner // may be an individual Github user or an organisation
 * @param {string} repoName
 * @returns {string}
 */
export function makeGithubPublicRepositoryURL(owner, repoName) {
  return `https://github.com/${owner}/${repoName}`
}

/**
 *
 * @param {string} owner // may be an individual Github user or an organisation
 * @param {string} repoName
 * @returns {string}
 */
export function makeGithubPublishedWebsiteURL(owner, repoName) {
  const publishedOrigin = `${owner.toLowerCase()}.github.io`
  repoName = repoName.toLowerCase()

  if (publishedOrigin === repoName) {
    return `https://${publishedOrigin}/`
  } else {
    return `https://${publishedOrigin}/${repoName}`
  }
}
