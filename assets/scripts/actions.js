//@ts-check

import page from 'page'

import databaseAPI from './databaseAPI.js';
import store from './store.js';
import makeBuildStatus from "./buildStatus.js";
import { handleErrors, logError, delay } from "./utils";

/**
 * @summary Fetch the current authenticated user login and set it in the store.
 *
 * @description This function is called on every page that needs authentication.
 * It returns the login of the user or the organization. If the user is not
 * logged in, it redirects to the authentication page.
 *
 * @returns {Promise<string>} A promise that resolves to the login of the
 * authenticated user or organization.
 *
 */
export const fetchAuthenticatedUserLogin = () => {
  const loginP = databaseAPI
    .getAuthenticatedUser()
    .then(({ login }) => {
      store.mutations.setLogin(login);

      return login;
    })
    .catch((errorMessage) => {
      switch (errorMessage) {
        case "INVALIDATE_TOKEN": {
          store.mutations.invalidateToken();
          page("/account");

          break;
        }

        default:
          const message = `The access token is invalid. ${errorMessage}`

          logError(message, "fetchAuthenticatedUserLogin", "log");
      }
    });

  store.mutations.setLogin(loginP);

  return loginP;
}

/**
 * @summary Fetch the list of repositories for the current user
 * and set it in the store.
 *
 * @description This function is called on every page that needs the list of
 * repositories for the current user. It returns a promise that resolves to the
 * list of repositories. If the user is not logged in, it redirects to the
 * authentication page.
 *
 * @returns A promise that resolves to the list of
 * repositories for the current user.
 *
*/

export const fetchCurrentUserRepositories = async () => {
    const login = await fetchAuthenticatedUserLogin();
    const currentUserRepositoriesP = databaseAPI
      .getCurrentUserRepositories()
      .then((repos) => {
        store.mutations.setReposForAccount({ login, repos });

        return repos
      })

    store.mutations.setReposForAccount(currentUserRepositoriesP);

    return currentUserRepositoriesP
}

export const getCurrentRepository = () => {
  return store.state.currentRepository;
}

export const getCurrentRepoPages = () => {
  const { owner, name  } = store.state.currentRepository;

  return databaseAPI
    .getPagesList(owner, name)
    .then((pages) => {
      store.mutations.setPages(pages);
    })
    .catch((msg) => handleErrors(msg));
}

export const getCurrentRepoArticles = () => {
  const { owner, name  } = store.state.currentRepository;

  return databaseAPI
    .getArticlesList(owner, name)
    .then((articles) => {
      store.mutations.setArticles(articles);
    })
    .catch((msg) => handleErrors(msg));
}

/**
 * @typedef {Object} CurrentRepository
 * @property {string} name - The name of the repository
 * @property {string} owner - The owner of the repository
 * @property {string} publishedWebsiteURL - The URL of the published website
 * @property {string} repositoryURL - The URL of the repository
 *
 * @summary Set the current repository from the owner and the name
 * of the repository in the URL
 *
 * @description This function is called on every page that needs a current
 * repository to be functionnal. It sets the current repository in the store,
 * but also the build status and the site repo config. If the user is not
 * logged in, it redirects to the authentication page.
 *
 * @returns {CurrentRepository} The current repository
 */
export const setCurrentRepositoryFromQuerystring = (querystring) => {
  const params = new URLSearchParams(querystring);
  const repoName = params.get("repoName");
  const owner = params.get("account");
  const publishedWebsiteURL =
    `${owner.toLowerCase()}.github.io/${repoName.toLowerCase()}`;
  const repositoryURL = `https://github.com/${owner}/${repoName}`;
  const loginP = fetchAuthenticatedUserLogin()

  setBuildStatus(loginP, repoName);
  setSiteRepoConfig(loginP);
  setBlogIndexSha(loginP);
  setArticles(loginP);

  const currentRepository = {
    name: repoName,
    owner,
    publishedWebsiteURL,
    repositoryURL,
  };

  store.mutations.setCurrentRepository(currentRepository);

  return currentRepository;
}

const setBlogIndexSha = async (loginP) => {
  try {
    const { sha: blogIndexSha } = await databaseAPI.getFile(
      await loginP,
      store.state.currentRepository.name,
      'blog.md'
    )
    store.mutations.setBlogIndexSha(blogIndexSha)
  } catch (errorMessage) {
    if (errorMessage !== 'NOT_FOUND') {
      throw errorMessage
    }
  }
}

export const setArticles = async (loginP) => {
  const articles = await databaseAPI.getArticlesList(
    await loginP,
    store.state.currentRepository.name
  )
  store.mutations.setArticles(articles)
}

export const setSiteRepoConfig = (loginP) => {
  const siteRepoConfigP = loginP
    .then((login) =>
      databaseAPI.getRepository(login, store.state.currentRepository.name)
    )
    .catch((error) => handleErrors(error));

  store.mutations.setSiteRepoConfig(siteRepoConfigP);
}

export const setBuildStatus = (loginP, repoName) => {
  store.mutations.setBuildStatus(makeBuildStatus(loginP, repoName));
  /*
  Appel sans vérification,
  On suppose qu'au chargement initial,
  on peut faire confiance à ce que renvoit l'API
  */
  store.state.buildStatus.checkStatus();
}

/**
 * @summary Create a repository for the current account
 *
 * @description This function creates a repository for the current account (user
 * or organization) and set a Github Pages branch. It redirects to the
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
export const createRepositoryForCurrentAccount = async (repoName) => {
  const login = await store.state.login

  return databaseAPI.createDefaultRepository(login, repoName)
    .then(() => {
      // Forks are created asynchronously, so we need to wait a bit
      // before creating the Github Pages branch
      return delay(1000)
    })
    .then(() => {
      return databaseAPI.createRepoGithubPages(login, repoName)
    })
    .then(() => {
      page(`/atelier-list-pages?repoName=${repoName}&account=${login}`)
    })
    .catch((errorMessage) => {
      logError(errorMessage, "createRepositoryForCurrentAccount")

      throw errorMessage
    })
}
