import page from 'page'
import yaml from 'js-yaml'

import store, { type PartialStore } from './../store.ts'
import ScribouilliGitRepo, {
  makeRepoId,
  makePublicRepositoryURL,
} from './../scribouilliGitRepo.ts'
import GitAgent from '../GitAgent.ts'
import { handleErrors, logMessage } from './../utils.ts'
import { fetchAuthenticatedUserLogin } from './current-user.ts'
import {
  scheduleCheck,
  setBuildingAndCheckStatusLater,
} from './../buildStatus.ts'
import { file } from './file.ts'
import { getPagesList } from './page.ts'
import { getArticlesList } from './article.ts'
import { getOAuthServiceAPI } from '../oauth-services-api/index.ts'
import { CUSTOM_CSS_PATH } from '../config.ts'
import type { BuildStatus } from '../types/git.ts'

export const getCurrentRepoPages = () => {
  return getPagesList().then(store.mutations.setPages).catch(handleErrors)
}

export const getCurrentRepoArticles = () => {
  return getArticlesList().then(store.mutations.setArticles).catch(handleErrors)
}

/**
 * @summary Set the current repository from the owner and the name
 * of the repository in the URL
 *
 * @description This function is called on every page that needs a current
 * repository to be functionnal. It sets the current repository in the store,
 * but also the build status and the site repo config. If the user is not
 * logged in, it redirects to the authentication page.
 */
export const setCurrentRepositoryFromQuerystring = async (
  querystring: string,
): Promise<void> => {
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
  const repoId = makeRepoId(owner, repoName)

  const scribouilliGitRepo = new ScribouilliGitRepo({
    owner,
    repoName,
    repoId,
    origin: origin,
    publicRepositoryURL: makePublicRepositoryURL(owner, repoName, origin),
    gitServiceProvider: getOAuthServiceAPI(),
  })

  store.mutations.setCurrentRepository(scribouilliGitRepo)

  const gitAgent = new GitAgent({
    repoId,
    remoteURL: `${origin}/${repoId}.git`,
    onMergeConflict: resolutionOptions => {
      store.mutations.setConflict(resolutionOptions)
    },
    auth: getOAuthServiceAPI().getOauthUsernameAndPassword(),
  })

  store.mutations.setGitAgent(gitAgent)

  const { login, email } = await fetchAuthenticatedUserLogin()

  await gitAgent.pullOrCloneRepo()
  await gitAgent.setAuthor(login, email)
  await setBaseUrlInConfigIfNecessary()
  await installPluginIfNecessary('jekyll-git-hash', '0.1.1')

  getCurrentRepoArticles()
  getCurrentRepoPages()

  setBuildStatus(scribouilliGitRepo, gitAgent)
}

export const setBuildStatus = (
  scribouilliGitRepo: ScribouilliGitRepo,
  gitAgent: GitAgent,
) => {
  store.mutations.setBuildStatus('in_progress')
  let lastBuildStatus: BuildStatus | undefined = undefined
  store.subscribe(state => {
    if (state.buildStatus !== lastBuildStatus) {
      lastBuildStatus = state.buildStatus

      if (
        state.buildStatus === 'in_progress' ||
        state.buildStatus === 'needs_account_verification'
      ) {
        scheduleCheck(scribouilliGitRepo, gitAgent)
      }
    }
  })

  scheduleCheck(scribouilliGitRepo, gitAgent)
}

/**
 * @description if baseurl param is set, always update the config with it
 * otherwise, wait for currentRepository.publishedWebsiteURL and
 * compute the new config.baseurl from it
 */
export const setBaseUrlInConfigIfNecessary = async (
  baseUrl?: string,
): Promise<any> => {
  const currentRepository = store.state.currentRepository

  if (!currentRepository) {
    throw new TypeError('currentRepository is undefined')
  }

  let newBaseUrl

  if (baseUrl) {
    newBaseUrl = baseUrl.replace(/\/$/, '')
  } else {
    if (currentRepository.origin === 'https://github.com') {
      const publishedWebsiteURL = await currentRepository.publishedWebsiteURL
      const url = new URL(publishedWebsiteURL)

      newBaseUrl = url.pathname.replace(/\/$/, '')
    } else {
      // GitLab instances use Single Domain Pages
      newBaseUrl = ''
    }
  }

  const config = await getCurrentRepoConfig()
  const currentBaseURL = config.baseurl || ''

  if (currentBaseURL === newBaseUrl) {
    // the config does not need to be changed, so let's skip both write/commit/push
    return
  } else {
    if (newBaseUrl === '') {
      console.log('delete baseurl from config')
      delete config.baseurl
    } else {
      console.log('update baseurl in config')
      config.baseurl = newBaseUrl
    }

    const configYmlContent = yaml.dump(config)

    console.log('configYmlContent', configYmlContent)
    return file.writeFileAndPushChanges(
      '_config.yml',
      configYmlContent,
      'Mise à jour de `baseurl` dans la config',
    )
  }
}
/**
 * @returns true if the plugin was installed, false if it was already here.
 */
export async function installPluginIfNecessary(
  plugin: string,
  version: string,
): Promise<boolean> {
  const config: { plugins: string[] } = await getCurrentRepoConfig()
  if (config.plugins.includes(plugin)) {
    return false
  }

  config.plugins.push(plugin)
  const newConfig = yaml.dump(config)

  try {
    const { gitAgent } = store.state
    if (!gitAgent) {
      throw new TypeError('gitAgent is undefined')
    }

    const gemFile = await gitAgent.getFile('Gemfile')
    const SECTION_START = 'group :jekyll_plugins do\n'
    const pluginSectionStart =
      gemFile.indexOf(SECTION_START) + SECTION_START.length
    const newGemfile =
      gemFile.slice(0, pluginSectionStart) +
      `  gem "${plugin}", "~> ${version}"\n\n` +
      gemFile.slice(pluginSectionStart)

    await file.writeFileAndCommit(
      'Gemfile',
      newGemfile,
      'Ajout de la gem ' + plugin,
    )
  } catch (e) {
    const message = e instanceof Error ? e.message : 'erreur inconnue'
    logMessage(
      "Erreur lors de la mise à jour du Gemfile, il n'existe probablement pas: " +
        message,
      'installPluginIfNecessary',
      'warn',
    )
  }

  await file.writeFileAndPushChanges(
    '_config.yml',
    newConfig,
    'Ajout du plugin ' + plugin,
  )
  return true
}

const getCurrentRepoConfig = (): Promise<any> => {
  const { currentRepository, gitAgent } = store.state

  if (!currentRepository) {
    throw new TypeError('currentRepository is undefined')
  }
  if (!gitAgent) {
    throw new TypeError('gitAgent is undefined')
  }

  return gitAgent
    .getFile('_config.yml')
    .then(configStr => yaml.load(configStr))
    .catch(handleErrors)
}

const defaultStore = store
export function saveCustomCSS(
  css: string,
  store: PartialStore<
    'currentRepository' | 'gitAgent',
    'setTheme'
  > = defaultStore,
): ReturnType<typeof file.writeFileAndPushChanges> | Promise<void> {
  if (!store.state.currentRepository || !store.state.gitAgent) {
    return Promise.resolve()
  }

  store.mutations.setTheme(css)
  setBuildingAndCheckStatusLater(
    store.state.currentRepository,
    store.state.gitAgent,
    10000,
  )
  return file.writeFileAndPushChanges(
    CUSTOM_CSS_PATH,
    css,
    'mise à jour du fichier de styles custom',
  )
}
