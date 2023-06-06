//@ts-check

import page from 'page'

import databaseAPI from './databaseAPI.js';
import store from './store.js';
import { handleErrors } from "./utils";

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

export const setCurrentRepositoryFromQuerystring = (querystring) => {
  const params = new URLSearchParams(querystring);
  const name = params.get("repoName");
  const owner = params.get("account");
  const publishedWebsiteURL =
    `${owner.toLowerCase()}.github.io/${name.toLowerCase()}`;
  const repositoryURL = `https://github.com/${owner}/${name}`;

  const currentRepository = {
    name,
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
