//@ts-check

import store from './../store.js'
import gitAgent from './../gitAgent'
import ScribouilliGitRepo, {
  makeGithubRepoId,
  makeGithubPublicRepositoryURL,
  makeGithubPublishedWebsiteURL,
} from './../scribouilliGitRepo.js'
import { repoTemplateGitUrl } from './../config.js'
import { getOAuthServiceAPI } from './../oauth-services-api/index.js'
import { makeAtelierListPageURL } from './../routes/urls.js'
import { logMessage } from './../utils.js'

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

  const scribouilliGitRepo = new ScribouilliGitRepo({
    owner: login,
    repoName: escapedRepoName,
    origin: 'https://github.com',
    publishedWebsiteURL: makeGithubPublishedWebsiteURL(login, escapedRepoName),
    publicRepositoryURL: makeGithubPublicRepositoryURL(login, escapedRepoName),
  })

  const waitRepoReady = /** @type {Promise<void>} */ (
    new Promise(resolve => {
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
  )
  const waitGithubPages = /** @type {Promise<void>} */ (
    new Promise(resolve => {
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
  )
  return (
    getOAuthServiceAPI()
      .createDefaultRepository(scribouilliGitRepo)
      .then(() => {
        // Generation from a template repository
        // is asynchronous, so we need to wait a bit
        // for the new repo to be created
        // before the setup of the GitHub Pages branch
        return waitRepoReady
      })
      .then(() => {
        return getOAuthServiceAPI().createPagesWebsiteFromRepository(
          scribouilliGitRepo,
        )
      })
      .then(() => {
        return waitGithubPages
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
