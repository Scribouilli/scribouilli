//@ts-check

import page from 'page'
import yaml from 'js-yaml'

import store from './../store.js'
import gitAgent from './../gitAgent'
import ScribouilliGitRepo, {
  makeRepoId,
  makePublicRepositoryURL,
} from './../scribouilliGitRepo.js'
import { handleErrors } from './../utils.js'
import { fetchAuthenticatedUserLogin } from './current-user.js'
import makeBuildStatus from './../buildStatus.js'
import { writeFileAndPushChanges } from './file.js'
import { getOAuthServiceAPI } from '../oauth-services-api/index.js'

/** @typedef {import('isomorphic-git')} isomorphicGit */

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

  const oAuthProvider = store.state.oAuthProvider

  let message

  if (!repoName || !owner || !oAuthProvider) {
    if (!repoName) {
      message = `Missing parameter 'repoName' in URL`
    } else {
      if (!owner) {
        message = `Missing parameter 'account' in URL`
      } else {
        message = `Missing store.state.oAuthProvider`
      }
    }

    console.info('[missing URL param or oauthConfig] redirecting to /', message)
    page('/')
    throw new Error(message)
  }

  const origin = oAuthProvider.origin

  const scribouilliGitRepo = new ScribouilliGitRepo({
    owner,
    repoName,
    repoId: makeRepoId(owner, repoName),
    origin: origin,
    publicRepositoryURL: makePublicRepositoryURL(owner, repoName, origin),
    gitServiceProvider: getOAuthServiceAPI(),
  })

  store.mutations.setCurrentRepository(scribouilliGitRepo)

  const { login, email } = await fetchAuthenticatedUserLogin()

  await gitAgent.pullOrCloneRepo(scribouilliGitRepo)
  await gitAgent.setAuthor(scribouilliGitRepo, login, email)
  await setBaseUrlInConfigIfNecessary()

  getCurrentRepoArticles()
  getCurrentRepoPages()

  setBuildStatus(scribouilliGitRepo)
}

/**
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


/**
 * @description if baseurl param is set, always update the config with it
 * otherwise, wait for currentRepository.publishedWebsiteURL and 
 * compute the new config.baseurl from it
 *
 * @param {string} [baseUrl]
 * @returns {Promise<any>}
 */
export const setBaseUrlInConfigIfNecessary = async (baseUrl) => {
  const currentRepository = store.state.currentRepository

  if (!currentRepository) {
    throw new TypeError('currentRepository is undefined')
  }

  let publishedWebsiteURL;
  if(!baseUrl){
    publishedWebsiteURL = await currentRepository.publishedWebsiteURL
  }

  if (!publishedWebsiteURL) {
    throw new TypeError('publishedWebsiteURL is undefined')
  }

  const config = await getCurrentRepoConfig()
  /** @type {string} */
  const currentBaseURL = config.baseurl || ''
  
  let newBaseUrl;
  if(baseUrl){
    newBaseUrl = baseUrl
  }
  else{
    const url = new URL(publishedWebsiteURL)
    newBaseUrl = url.pathname.replace(/\/$/, '')
  }

  if(currentBaseURL === newBaseUrl) {
    // the config does not need to be changed, so let's skip both write/commit/push
    return;
  }
  else{
    if (newBaseUrl === '') {
      console.log('delete baseurl from config')
      delete config.baseurl
    } else {
      console.log('update baseurl in config')
      config.baseurl = newBaseUrl
    }
  
    const configYmlContent = yaml.dump(config)
  
    console.log('configYmlContent', configYmlContent)
    return writeFileAndPushChanges(
      '_config.yml',
      configYmlContent,
      'Mise à jour de `baseurl` dans la config',
    )
  }

}

/**
 * @returns {Promise<any>}
 */
export const getCurrentRepoConfig = () => {
  const currentRepository = store.state.currentRepository

  if (!currentRepository) {
    throw new TypeError('currentRepository is undefined')
  }

  return gitAgent
    .getFile(currentRepository, '_config.yml')
    .then(configStr => {
      const config = yaml.load(configStr)

      return config
    })
    .catch(msg => handleErrors(msg))
}
