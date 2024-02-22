/**
 * @type {ScribouilliGitRepo}
 */
export default class {
  /**
   *
   * @param { object } _
   * @param { string } [_.repoId]
   * @param { string } _.origin
   * @param { string } _.publicRepositoryURL
   * @param { string } _.owner
   * @param { string } _.repoName
   * @param { OAuthServiceAPI } _.gitServiceProvider
   */
  constructor({
    repoId,
    origin,
    publicRepositoryURL,
    owner,
    repoName,
    gitServiceProvider
  }) {
    this.origin = origin
    this.publicRepositoryURL = publicRepositoryURL
    this.owner = owner
    this.repoName = repoName

    this.repoId = repoId ? repoId : makeRepoId(owner, repoName)

    this.publishedWebsiteURL = new Promise(resolve => {
      const interval = setInterval(() => {
        gitServiceProvider.getPublishedWebsiteURL(this)
        .then(url => { 
          if(url){
            clearInterval(interval)
            resolve(url) 
          }
        })
      }, 1000)
    })
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


