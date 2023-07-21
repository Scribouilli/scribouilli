//@ts-check

import page from "page";

import databaseAPI from "./databaseAPI.js";
import store from "./store.js";
import makeBuildStatus from "./buildStatus.js";
import { handleErrors, logMessage, delay } from "./utils";

const logout = () => {
  store.mutations.setLogin(undefined)
  store.mutations.invalidateToken()
  store.mutations.removeSite()
  console.info('[logout] redirecting to /login')
  page("/login")
}

/**
 * @summary Fetch the current authenticated user login and set it in the store.
 *
 * @description This function is called on every page that needs authentication.
 * It returns the login of the user or the organization. If the user is not
 * logged in, it redirects to the authentication page.
 *
 * @returns {Promise<{login: string, email: string}>} A promise that resolves to the login of the
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
          console.info('[token error] redirecting to /account')
          page("/account");

          break;
        }

        default:
          const message = `The access token is invalid. ${errorMessage}`;

          logMessage(message, "fetchAuthenticatedUserLogin");
      }

      throw errorMessage;
    });

  const emailP = databaseAPI.getUserEmails()
    .then((emails) => {
      const email = (emails.find(e => e.primary) ?? emails[0]).email
      store.mutations.setEmail(email)
      return email
    })
    .catch(err => {
      // If we can't get email addresses, we ask the user to login again
      logout()
      throw err;
    })

  store.mutations.setLogin(loginP);

  return Promise.all([loginP, emailP]).then(([login, email]) => ({login, email}));
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
  const {login} = await fetchAuthenticatedUserLogin();
  const currentUserRepositoriesP = databaseAPI
    .getCurrentUserRepositories()
    .then((repos) => {
      store.mutations.setReposForAccount({ login, repos });

      return repos
    })

  store.mutations.setReposForAccount(currentUserRepositoriesP);

  return currentUserRepositoriesP
}

export const getCurrentRepoPages = () => {
  const { owner, name } = store.state.currentRepository;

  return databaseAPI
    .getPagesList(owner, name)
    .then((pages) => {
      store.mutations.setPages(pages);
    })
    .catch((msg) => handleErrors(msg));
};

export const getCurrentRepoArticles = () => {
  const { owner, name } = store.state.currentRepository;

  return databaseAPI
    .getArticlesList(owner, name)
    .then((articles) => {
      store.mutations.setArticles(articles);
    })
    .catch((msg) => handleErrors(msg));
};

export const addTopicRepo = (login, repo) =>
  databaseAPI.createTopicGithubRepository(login, repo);

/**
 * @summary Set the current repository from the owner and the name
 * of the repository in the URL
 *
 * @description This function is called on every page that needs a current
 * repository to be functionnal. It sets the current repository in the store,
 * but also the build status and the site repo config. If the user is not
 * logged in, it redirects to the authentication page.
 *
 * @returns {Promise<void>}
 */
export const setCurrentRepositoryFromQuerystring = async (querystring) => {
  const params = new URLSearchParams(querystring);
  const repoName = params.get("repoName");
  const owner = params.get("account");

  if (!repoName || !owner) { 
    const message = !repoName ? `Missing parameter 'repoName' in URL` : `Missing parameter 'account' in URL`

    console.info('[missing URL param] redirecting to /', message)
    page("/")
    throw new Error(message)
  }

  const {login, email} = await fetchAuthenticatedUserLogin()

  // protection temporaire contre le fait d'éditer des repo d'un autre compte
  // PPP: à enlever quand on travaillera sur l'édition sur les repos d'organisations
  if (login !== owner) {
    console.info('[login !== owner] redirecting to /', login, owner)
    page("/");
    return;
  }

  const currentRepository = {
    name: repoName,
    owner,
    publishedWebsiteURL: `${owner.toLowerCase()}.github.io/${repoName.toLowerCase()}`,
    repositoryURL: `https://github.com/${owner}/${repoName}`
  };

  databaseAPI.setAuthor(login, store.state.currentRepository.name, email)

  store.mutations.setCurrentRepository(currentRepository);

  setBuildStatus(login, repoName);
  setArticles(login);
}

/**
 * 
 * @param {string} login 
 */
export const setArticles = async (login) => {
  const articles = await databaseAPI.getArticlesList(
    login,
    store.state.currentRepository.name
  );
  store.mutations.setArticles(articles);
};

/**
 * 
 * @param {string} login 
 * @param {string} repoName 
 */
export const setBuildStatus = (login, repoName) => {
  store.mutations.setBuildStatus(makeBuildStatus(login, repoName));
  /*
  Appel sans vérification,
  On suppose qu'au chargement initial,
  on peut faire confiance à ce que renvoit l'API
  */
  store.state.buildStatus.checkStatus();
};

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
  const login = await store.state.login;
  const escapedRepoName = repoName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .toLowerCase();

  return databaseAPI
    .createDefaultRepository(login, escapedRepoName)
    .then(() => {
      // Generation from a template repository
      // is asynchronous, so we need to wait a bit
      // for the new repo to be created
      // before the setup of the Github Pages branch
      return delay(1000);
    })
    .then(() => {
      return databaseAPI.createRepoGithubPages(login, escapedRepoName);
    })
    .then(() => {
      page(`/atelier-list-pages?repoName=${escapedRepoName}&account=${login}`);
    })
    .catch((errorMessage) => {
      logMessage(errorMessage, "createRepositoryForCurrentAccount");

      throw errorMessage;
    });
};
