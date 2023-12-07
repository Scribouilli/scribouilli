//@ts-check

import store from './../store.js'
import gitAgent from './../gitAgent'
import ScribouilliGitRepo, {
  makeRepoId,
  makePublicRepositoryURL,
  makePublishedWebsiteURL,
} from './../scribouilliGitRepo.js'
import { getOAuthServiceAPI } from './../oauth-services-api/index.js'
import { handleErrors } from './../utils.js'
import { fetchAuthenticatedUserLogin } from './current-user.js'
import makeBuildStatus from './../buildStatus.js'

/**
 * @summary Delete a repository from the local indexedDB and from the OAuth service
 *
 * @param {ScribouilliGitRepo} scribouilliGitRepo
 *
 * @return {Promise<any>} - A promise that resolves when the repository has been deleted
 */
export const deleteRepository = scribouilliGitRepo => {
  return gitAgent.deleteRepository(scribouilliGitRepo).then(() => {
    return getOAuthServiceAPI().then(api =>
      api.deleteRepository(scribouilliGitRepo),
    )
  })
}

export const getCurrentRepoPages = () => {
  const currentRepository = store.state.currentRepository

  if (!currentRepository) {
    throw new TypeError('currentRepository is undefined')
  }

  return gitAgent
    .getPagesList(currentRepository)
    .then(pages => {
      store.mutations.setPages(pages)
    })
    .catch(msg => handleErrors(msg))
}

export const getCurrentRepoArticles = () => {
  const currentRepository = store.state.currentRepository

  if (!currentRepository) {
    throw new TypeError('currentRepository is undefined')
  }

  return gitAgent
    .getArticlesList(currentRepository)
    .then(articles => {
      store.mutations.setArticles(articles)
    })
    .catch(msg => handleErrors(msg))
}

/**
 * @summary Set the current repository from the owner and the name
 * of the repository in the URL
 *
 * @description This function is called on every page that needs a current
 * repository to be functionnal. It sets the current repository in the store,
 * but also the build status and the site repo config. If the user is not
 * logged in, it redirects to the authentication page.
 *
 * @param {string} querystring
 * @returns {Promise<void>}
 */
export const setCurrentRepositoryFromQuerystring = async querystring => {
  const params = new URLSearchParams(querystring)
  const repoName = params.get('repoName')
  const owner = params.get('account')

  if (!repoName || !owner) {
    const message = !repoName
      ? `Missing parameter 'repoName' in URL`
      : `Missing parameter 'account' in URL`

    console.info('[missing URL param] redirecting to /', message)
    page('/')
    throw new Error(message)
  }

  const oAuthProvider = await store.state.oAuthProvider
  const origin = oAuthProvider?.origin || ''

  const scribouilliGitRepo = new ScribouilliGitRepo({
    owner,
    repoName,
    repoId: makeRepoId(owner, repoName),
    origin: origin,
    publishedWebsiteURL: makePublishedWebsiteURL(owner, repoName, origin),
    publicRepositoryURL: makePublicRepositoryURL(owner, repoName, origin),
  })

  console.log('scribouilliGitRepo', scribouilliGitRepo)

  store.mutations.setCurrentRepository(scribouilliGitRepo)

  const { login, email } = await fetchAuthenticatedUserLogin()

  await gitAgent.pullOrCloneRepo(scribouilliGitRepo)
  await gitAgent.setAuthor(scribouilliGitRepo, login, email)

  getCurrentRepoArticles()
  getCurrentRepoPages()

  setBuildStatus(scribouilliGitRepo)
}

/**
 *
 * @param {ScribouilliGitRepo} scribouilliGitRepo
 */
export const setBuildStatus = scribouilliGitRepo => {
  store.mutations.setBuildStatus(makeBuildStatus(scribouilliGitRepo))
  /*
  Appel sans vérification,
  On suppose qu'au chargement initial,
  on peut faire confiance à ce que renvoit l'API
  */
  store.state.buildStatus.checkStatus()
}
