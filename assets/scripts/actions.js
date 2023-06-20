//@ts-check

import page from 'page'

import databaseAPI from './databaseAPI.js';
import store from './store.js';
import makeBuildStatus from "./buildStatus.js";
import { handleErrors, logError } from "./utils";

/**
 * @summary Get the current authenticated user login
 *
 * @description This function is called on every page that needs authentication.
 * It returns the login of the user or the organization. If the user is not
 * logged in, it redirects to the authentication page.
 *
 * @returns {Promise<string>} A promise that resolves to the login of the
 * authenticated user or organization.
 *
 */
export const getAuthenticatedUserLogin = () => {
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

          logError(message, "getAuthenticatedUserLogin", "log");
      }
    });

  store.mutations.setLogin(loginP);

  return loginP;
}

export const getCurrentUserRepositories = async () => {
    const { login, reposByAccount } = store.state;

    if (reposByAccount[login] && reposByAccount[login].length > 0) {
      return reposByAccount[login];
    }

    return databaseAPI.getCurrentUserRepositories()
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

export const setCurrentRepositoryFromQuerystring = (querystring) => {
  const params = new URLSearchParams(querystring);
  const repoName = params.get("repoName");
  const owner = params.get("account");
  const publishedWebsiteURL =
    `${owner.toLowerCase()}.github.io/${repoName.toLowerCase()}`;
  const repositoryURL = `https://github.com/${owner}/${repoName}`;
  const loginP = getAuthenticatedUserLogin();

  setBuildStatus(loginP, repoName);
  setSiteRepoConfig(loginP);

  const currentRepository = {
    name: repoName,
    owner,
    publishedWebsiteURL,
    repositoryURL,
  };

  store.mutations.setCurrentRepository(currentRepository);

  return currentRepository;
}

export const createRepositoryForCurrentAccount = async (repoName) => {
  const login = await store.state.login
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  return databaseAPI.createDefaultRepository(login, repoName)
    .then(() => {
      // Forks are created asynchronously, so we need to wait a bit
      // before creating the Github Pages branch
      return delay(1000)
    })
    .then(() => {
      return databaseAPI.createRepoGithubPages(login, repoName)
    })
    .finally(() => {
      page(`/atelier-list-pages?repoName=${repoName}&login=${login}`)
    })
}
