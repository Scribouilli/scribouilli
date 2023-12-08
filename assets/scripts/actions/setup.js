//@ts-check

import page from 'page'

import store from './../store.js'
import ScribouilliGitRepo, {
  makePublicRepositoryURL,
  makePublishedWebsiteURL,
} from './../scribouilliGitRepo.js'
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
        .isRepositoryReady(scribouilliGitRepo)
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
        .isPagesWebsiteBuilt(scribouilliGitRepo)
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
 *
 * @returns {Promise<void>}
 */
export const waitOauthProvider = () => {
  return new Promise(resolve => {
    if (store.state.oAuthProvider) resolve()
    else {
      const unsubscribe = store.subscribe(state => {
        if (state.oAuthProvider) {
          unsubscribe()
          resolve()
        }
      })
    }
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

  const oAuthProvider = store.state.oAuthProvider
  if (!oAuthProvider) {
    console.error('Missing oAuthProvider')
    page('/')
    return
  }

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
      .createDefaultRepository(scribouilliGitRepo)
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
