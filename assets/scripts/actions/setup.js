//@ts-check

import page from 'page'

import store from './../store.js'
import gitAgent from './../gitAgent.js'
import ScribouilliGitRepo, {
  makePublicRepositoryURL,
} from './../scribouilliGitRepo.js'
import { getOAuthServiceAPI } from './../oauth-services-api/index.js'
import { makeAtelierListPageURL } from './../routes/urls.js'
import { logMessage } from './../utils.js'
import { setBaseUrlInConfigIfNecessary } from './current-repository.js'

import '../types.js'

/** @typedef {import('isomorphic-git')} isomorphicGit */

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
 * @param {ScribouilliGitRepo} scribouilliGitRepo
 * @returns {Promise<ReturnType<isomorphicGit["setConfig"]>>}
 */
export const setupLocalRepository = async scribouilliGitRepo => {
  const login = await store.state.login
  const email = store.state.email

  if (!login) {
    throw new TypeError(`missing login in setupLocalRepository`)
  }

  if (!email) {
    throw new TypeError(`missing email in setupLocalRepository`)
  }

  await gitAgent.clone(scribouilliGitRepo)

  return gitAgent.setAuthor(scribouilliGitRepo, login, email)
}

/**
 * @summary guess the published URL until a call to OAuthServiceAPI.getPublishedWebsiteURL is made
 *
 * @param {ScribouilliGitRepo} _
 * @returns {string}
 */
export function guessBaseURL({ owner, repoName, origin }) {
  if (origin === 'https://github.com') {
    const publishedHostname = `${owner.toLowerCase()}.github.io`
    repoName = repoName.toLowerCase()

    return publishedHostname === repoName ? '' : `/${repoName}`
  } else if (
    origin === 'https://gitlab.com' ||
    origin === 'https://git.scribouilli.org'
  ) {
    // because of Single Pages Domain enabled by default
    return `/`
  }

  return ''
}

/**
 * @summary Create a repository for the current account
 *
 * @description This function creates a repository for the current account
 * and set a GitHub Pages branch. It redirects to the
 * list of pages for the atelier.
 *
 * @param {string} repoName - The name of the repository to create
 * @param {GitSiteTemplate} template - The git site template to use
 *
 * @returns {Promise<void>} A promise that resolves when the repository
 * is created.
 *
 * @throws {string} An error message if the repository cannot be created.
 *
 */
export const createRepositoryForCurrentAccount = async (repoName, template) => {
  const login = await store.state.login

  if (!login) {
    throw new TypeError(`missing login in createRepositoryForCurrentAccount`)
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
    publicRepositoryURL: makePublicRepositoryURL(
      login,
      escapedRepoName,
      origin,
    ),
    gitServiceProvider: getOAuthServiceAPI(),
  })

  store.mutations.setCurrentRepository(scribouilliGitRepo)

  return (
    getOAuthServiceAPI()
      .createDefaultRepository(scribouilliGitRepo, template)
      .then(() => {
        // Il est nécessaire d'attendre que le repo soit prêt sur la remote
        // avant de pouvoir le cloner localement.
        return waitRepoReady(scribouilliGitRepo)
      })
      .then(() => {
        return setupLocalRepository(scribouilliGitRepo)
      })
      .then(() => {
        return getOAuthServiceAPI().deploy(scribouilliGitRepo)
      })
      .then(() => {
        return setBaseUrlInConfigIfNecessary(guessBaseURL(scribouilliGitRepo))
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
