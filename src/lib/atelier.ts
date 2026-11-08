import yaml from 'js-yaml'
import git from 'isomorphic-git'

import * as store from '#lib/store.svelte.ts'
import ScribouilliGitRepo from '#lib/git/repo.ts'
import { GitAgent } from '#lib/git/agent.ts'
import type { ResolutionOption } from '#lib/git/agent.ts'
import { logMessage } from '#lib/logger.ts'
import { handleErrors } from '#lib/error.ts'
import { fetchAuthenticatedUserLogin } from '#lib/user.ts'
import { scheduleCheck, setBuildingAndCheckStatusLater } from '#lib/build-status.ts'
import { file } from '#lib/git/file.ts'
import { getPagesList } from '#lib/page.ts'
import { getArticlesList } from '#lib/article.ts'
import { getOAuthServiceAPI } from '#lib/providers/index.ts'
import type { GitSiteTemplate } from '#lib/providers/index.ts'
import { CUSTOM_CSS_PATH, PROVIDERS_MAP } from '#lib/config.ts'
import type { ReadonlyURLSearchParams } from '$app/state'
import { resolve } from '$app/paths'
import { goto } from '$app/navigation'
import { makeAtelierListPageURL } from './urls'

export interface EditeurFile {
  fileName: string
  content: string
  previousContent: string | undefined
  title: string
  index: number
  previousTitle: string | undefined
  blogIndex: boolean
}

export interface FileContenu {
  path: string
  title: string
  content: string
  index: number
  inMenu: boolean
  blogIndex: boolean
}

export const getCurrentRepoPages = () => {
  return getPagesList().then(store.setPages).catch(handleErrors)
}

export const getCurrentRepoArticles = () => {
  return getArticlesList().then(store.setArticles).catch(handleErrors)
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
  params: ReadonlyURLSearchParams,
): Promise<void> => {
  const repoPath = params.get('repoPath')
  const owner = params.get('account') ?? undefined

  const oAuthProvider = store.state.oAuthProvider

  let message
  const provider = PROVIDERS_MAP.get(oAuthProvider?.id ?? '')

  if (!repoPath || !oAuthProvider || !provider) {
    if (!oAuthProvider) {
      message = `Missing store.state.oAuthProvider`
    } else if (!provider) {
      message = `Unkown provider ${oAuthProvider.id}`
    } else if (provider.type !== 'scribouilli' && !owner) {
      message = `Missing parameter 'account' in URL`
    } else {
      message = `Missing parameter 'repoPath' in URL`
    }

    console.info('[missing URL param or oauthConfig] redirecting to /', message)
    goto(resolve('/'))
    throw new Error(message)
  }

  const origin = oAuthProvider.origin
  const oAuthServiceAPI = getOAuthServiceAPI()

  const scribouilliGitRepo = new ScribouilliGitRepo({
    owner,
    repoPath,
    repoType: provider.type,
    origin: origin,
    gitServiceProvider: getOAuthServiceAPI(),
  })

  store.state.currentRepository = scribouilliGitRepo

  const { repoId } = scribouilliGitRepo

  const gitAgent = new GitAgent({
    repoId: repoId,
    remoteURL: oAuthServiceAPI.makePublicRepositoryURL(owner, repoPath),
    corsProxyURL: provider.corsProxy,
    gitServiceProvider: oAuthServiceAPI,
    onMergeConflict: resolutionOptions => {
      store.state.conflict = resolutionOptions
    },
  })

  store.state.gitAgent = gitAgent

  const { login, email } = await fetchAuthenticatedUserLogin()

  await gitAgent.pullOrCloneRepo()
  await gitAgent.setAuthor(login, email)
  await setBaseUrlInConfigIfNecessary()
  await installPluginIfNecessary('jekyll-git-hash', '0.1.1')

  getCurrentRepoArticles()
  getCurrentRepoPages()

  setBuildStatus(scribouilliGitRepo, gitAgent)
}

export const setBuildStatus = (scribouilliGitRepo: ScribouilliGitRepo, gitAgent: GitAgent) => {
  store.state.buildStatus = 'in_progress' as const
  scheduleCheck(scribouilliGitRepo, gitAgent)
  // TODO: see what’s needed here
  /*
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
   */
}

/**
 * @description if baseurl param is set, always update the config with it
 * otherwise, wait for currentRepository.publishedWebsiteURL and
 * compute the new config.baseurl from it
 */
export const setBaseUrlInConfigIfNecessary = async (baseUrl?: string): Promise<any> => {
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
export async function installPluginIfNecessary(plugin: string, version: string): Promise<boolean> {
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
    const pluginSectionStart = gemFile.indexOf(SECTION_START) + SECTION_START.length
    const newGemfile =
      gemFile.slice(0, pluginSectionStart) +
      `  gem "${plugin}", "~> ${version}"\n\n` +
      gemFile.slice(pluginSectionStart)

    await file.writeFileAndCommit('Gemfile', newGemfile, 'Ajout de la gem ' + plugin)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'erreur inconnue'
    logMessage(
      "Erreur lors de la mise à jour du Gemfile, il n'existe probablement pas: " + message,
      'installPluginIfNecessary',
      'warn',
    )
  }

  await file.writeFileAndPushChanges('_config.yml', newConfig, 'Ajout du plugin ' + plugin)
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

export function saveCustomCSS(
  css: string,
): ReturnType<typeof file.writeFileAndPushChanges> | Promise<void> {
  if (!store.state.currentRepository || !store.state.gitAgent) {
    return Promise.resolve()
  }

  store.state.theme.css = css
  setBuildingAndCheckStatusLater(store.state.currentRepository, store.state.gitAgent, 10000)
  return file.writeFileAndPushChanges(
    CUSTOM_CSS_PATH,
    css,
    'mise à jour du fichier de styles custom',
  )
}

const waitRepoReady = (scribouilliGitRepo: ScribouilliGitRepo): Promise<void> => {
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

export const setupLocalRepository = async (): Promise<ReturnType<typeof git.setConfig>> => {
  const login = await store.state.login
  const { gitAgent, email } = store.state

  if (!gitAgent) {
    throw new TypeError('gitAgent is undefined')
  }
  if (!login) {
    throw new TypeError(`missing login in setupLocalRepository`)
  }
  if (!email) {
    throw new TypeError(`missing email in setupLocalRepository`)
  }

  await gitAgent.clone()

  return gitAgent.setAuthor(login, email)
}

/**
 * @summary guess the published URL until a call to OAuthServiceAPI.getPublishedWebsiteURL is made
 */
export function guessBaseURL({ owner, repoPath, origin }: ScribouilliGitRepo): string {
  if (origin === 'https://github.com') {
    const publishedHostname = `${owner?.toLowerCase()}.github.io`
    repoPath = repoPath.toLowerCase()

    return publishedHostname === repoPath ? '' : `/${repoPath}`
  } else if (origin === 'https://gitlab.com' || origin === 'https://git.scribouilli.org') {
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
 * @param repoName The name of the repository to create
 * @param template The git site template to use
 *
 * @returns A promise that resolves when the repository
 * is created.
 *
 * @throws An error message if the repository cannot be created.
 *
 */
export const createRepositoryForCurrentAccount = async (
  repoName: string,
  template: GitSiteTemplate,
): Promise<void> => {
  const owner = await store.state.login

  if (!owner) {
    throw new TypeError(`missing login in createRepositoryForCurrentAccount`)
  }

  // On creation, on both GitHub and GitLab, the name matches the repository path
  const escapedRepoPath = repoName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\.-]/g, '-') // see https://stackoverflow.com/a/59082561
    .toLowerCase()

  const oAuthProvider = store.state.oAuthProvider
  if (!oAuthProvider) {
    console.error('Missing oAuthProvider')
    goto(resolve('/'))
    return
  }

  const origin = oAuthProvider.origin
  const provider = PROVIDERS_MAP.get(oAuthProvider.id)
  if (!provider) {
    throw new TypeError(`Unkown provider ${oAuthProvider.id}`)
  }
  const oAuthServiceAPI = getOAuthServiceAPI()

  const scribouilliGitRepo = new ScribouilliGitRepo({
    owner: owner,
    repoPath: escapedRepoPath,
    repoType: provider.type,
    origin: origin,
    gitServiceProvider: oAuthServiceAPI,
  })

  const { repoId } = scribouilliGitRepo

  store.state.currentRepository = scribouilliGitRepo

  return (
    oAuthServiceAPI
      .createDefaultRepository(scribouilliGitRepo, template)
      .then(({ remoteURL }) => {
        const gitAgent = new GitAgent({
          repoId,
          remoteURL: remoteURL,
          corsProxyURL: provider.corsProxy,
          onMergeConflict: (resolutionOptions: ResolutionOption[] | undefined) => {
            store.state.conflict = resolutionOptions
          },
          gitServiceProvider: oAuthServiceAPI,
        })

        store.state.gitAgent = gitAgent

        // Il est nécessaire d'attendre que le repo soit prêt sur la remote
        // avant de pouvoir le cloner localement.
        return waitRepoReady(scribouilliGitRepo)
      })
      .then(() => {
        return setupLocalRepository()
      })
      .then(() => {
        return getOAuthServiceAPI().deploy(scribouilliGitRepo)
      })
      .then(() => {
        return setBaseUrlInConfigIfNecessary(guessBaseURL(scribouilliGitRepo))
      })
      .then(() => {
        goto(makeAtelierListPageURL(scribouilliGitRepo))
      })
      // @ts-ignore
      .catch(errorMessage => {
        logMessage(errorMessage, 'createRepositoryForCurrentAccount')
        handleErrors(errorMessage)
      })
  )
}
