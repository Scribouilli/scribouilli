//@ts-check

import remember from 'remember'
import page from 'page'

import store from './../store.js'
import gitAgent from './../gitAgent'
import ScribouilliGitRepo, {
  makeRepoId,
  makePublicRepositoryURL,
  makePublishedWebsiteURL,
} from './../scribouilliGitRepo.js'
import { repoTemplateGitUrl, OAUTH_PROVIDER_STORAGE_KEY } from './../config.js'
import { getOAuthServiceAPI } from './../oauth-services-api/index.js'
import { makeAtelierListPageURL } from './../routes/urls.js'
import { logMessage } from './../utils.js'

/**
 * @param {ScribouilliGitRepo} scribouilliGitRepo
 * @returns {Promise<void>}
 */
const waitRepoReady = scribouilliGitRepo => {
  return new Promise(resolve => {
    const timer = setInterval(() => {
      getOAuthServiceAPI()
        .then(api => api.isRepositoryReady(scribouilliGitRepo))
        // @ts-ignore
        .then(res => {
          if (res) {
            clearInterval(timer)
            resolve()
          }
        })
    }, 1000)
  })
}

/**
 * @param {ScribouilliGitRepo} scribouilliGitRepo
 * @returns {Promise<void>}
 */
const waitGithubPages = scribouilliGitRepo => {
  return new Promise(resolve => {
    const timer = setInterval(() => {
      getOAuthServiceAPI()
        .then(api => api.isPagesWebsiteBuilt(scribouilliGitRepo))
        // @ts-ignore
        .then(res => {
          if (res) {
            clearInterval(timer)
            resolve()
          }
        })
    }, 5000)
  })
}

/**
 * @summary Create a repository for the current account
 *
 * @description This function creates a repository for the current account
 * and set a GitHub Pages branch. It redirects to the
 * list of pages for the atelier.
 *
 * @param {string} repoName - The name of the repository to create
 *
 * @returns {Promise<void>} A promise that resolves when the repository
 * is created.
 *
 * @throws {string} An error message if the repository cannot be created.
 *
 */
export const createRepositoryForCurrentAccount = async repoName => {
  const login = await store.state.login

  if (!login) {
    throw new TypeError(`login manquant dans createRepositoryForCurrentAccount`)
  }

  const escapedRepoName = repoName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .toLowerCase()

  const oAuthProvider = await remember(OAUTH_PROVIDER_STORAGE_KEY)
  const origin = oAuthProvider.origin

  const scribouilliGitRepo = new ScribouilliGitRepo({
    owner: login,
    repoName: escapedRepoName,
    origin: origin,
    publishedWebsiteURL: makePublishedWebsiteURL(
      login,
      escapedRepoName,
      origin,
    ),
    publicRepositoryURL: makePublicRepositoryURL(
      login,
      escapedRepoName,
      origin,
    ),
  })

  return (
    getOAuthServiceAPI()
      .then(api => api.createDefaultRepository(scribouilliGitRepo))
      .then(() => {
        // We check that the repository is effectively created
        return waitRepoReady(scribouilliGitRepo)
      })
      .then(() => {
        page(makeAtelierListPageURL(scribouilliGitRepo))
      })
      // @ts-ignore
      .catch(errorMessage => {
        logMessage(errorMessage, 'createRepositoryForCurrentAccount')
        throw errorMessage
      })
  )
}
