import page from 'page'

import store, { ResolutionOption } from './../store.ts'
import ScribouilliGitRepo from './../scribouilliGitRepo.ts'
import { getOAuthServiceAPI } from './../oauth-services-api/index.ts'
import { makeAtelierListPageURL } from './../routes/urls.ts'
import { logMessage } from './../utils.ts'
import { setBaseUrlInConfigIfNecessary } from './current-repository.ts'
import GitAgent from '../GitAgent.ts'
import git from 'isomorphic-git'
import type { GitSiteTemplate } from '../types/git.ts'
import { PROVIDERS_MAP } from '../config.ts'

const waitRepoReady = (
  scribouilliGitRepo: ScribouilliGitRepo,
): Promise<void> => {
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

export const waitOauthProvider = (): Promise<void> => {
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

export const setupLocalRepository = async (): Promise<
  ReturnType<typeof git.setConfig>
> => {
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
export function guessBaseURL({
  owner,
  repoName,
  origin,
}: ScribouilliGitRepo): string {
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

  const escapedRepoName = repoName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\.-]/g, '-') // see https://stackoverflow.com/a/59082561
    .toLowerCase()

  const oAuthProvider = store.state.oAuthProvider
  if (!oAuthProvider) {
    console.error('Missing oAuthProvider')
    page('/')
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
    repoName: escapedRepoName,
    repoType: provider.type,
    origin: origin,
    gitServiceProvider: oAuthServiceAPI,
  })

  store.mutations.setCurrentRepository(scribouilliGitRepo)

  return (
    oAuthServiceAPI
      .createDefaultRepository(scribouilliGitRepo, template)
      .then(({ remoteURL }) => {
        const gitAgent = new GitAgent({
          repoId: oAuthServiceAPI.makeRepoId(owner, escapedRepoName),
          remoteURL: remoteURL,
          corsProxyURL: provider.corsProxy,
          onMergeConflict: (
            resolutionOptions: ResolutionOption[] | undefined,
          ) => {
            store.mutations.setConflict(resolutionOptions)
          },
          gitServiceProvider: oAuthServiceAPI,
        })

        store.mutations.setGitAgent(gitAgent)

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
        page(makeAtelierListPageURL(scribouilliGitRepo))
      })
      // @ts-ignore
      .catch(errorMessage => {
        logMessage(errorMessage, 'createRepositoryForCurrentAccount')
        throw errorMessage
      })
  )
}
