//@ts-check

import Store from "baredux";

import {
  ACCESS_TOKEN_STORAGE_KEY,
  TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER,
} from "./config.js";

//@ts-ignore
export default new Store({
  state: {
    // @ts-ignore
    accessToken:
      new URL(location.toString()).searchParams.get(
        TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER
      ) || localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY),
    login: undefined, // Promise<string> | string
    origin: undefined, // Promise<string> | string
    currentRepository: {
      name: undefined, // Promise<string> | string
      owner: undefined, // Promise<string> | string
      publishedWebsiteURL: undefined, // Promise<string> | string
      repositoryURL: undefined, // Promise<string> | string
    },
    // We use the term "account" to refer to user or organization.
    reposByAccount: {
      // [login: string]: Promise<Repository[]>
    },
    pages: undefined,
    articles: undefined,
    buildStatus: undefined,
    basePath: location.hostname.endsWith(".github.io") ? "/scribouilli" : "",
    siteRepoConfig: undefined,
    theme: {
      css: undefined,
      sha: undefined,
    },
    blogIndexSha: undefined,
  },
  mutations: {
    setLogin(state, login) {
      state.login = login;
    },
    setCurrentRepository(state, repository) {
      state.currentRepository = repository;
    },
    setPages(state, pages) {
      state.pages = pages.sort((pageA, pageB) => {
        if (pageA.path < pageB.path) {
          return -1;
        }
        if (pageA.path > pageB.path) {
          return 1;
        }
        if (pageA.path === pageB.path) {
          return 0;
        }
      });
    },
    setArticles(state, articles) {
      state.articles = articles.sort((pageA, pageB) => {
        if (pageA.path < pageB.path) {
          return -1;
        }
        if (pageA.path > pageB.path) {
          return 1;
        }
        if (pageA.path === pageB.path) {
          return 0;
        }
      });
    },
    setBuildStatus(state, buildStatus) {
      state.buildStatus = buildStatus;
    },
    setReposForAccount(state, { login, repos }) {
      state.reposByAccount[login] = repos;
    },
    setCurrentRepoName(state, repoName) {
      state.currentRepoName = repoName;
    },
    setSiteRepoConfig(state, repo) {
      state.siteRepoConfig = repo;
    },
    setTheme(state, css, sha) {
      state.theme.css = css;
      state.theme.sha = sha;
    },
    setBlogIndexSha(state, sha) {
      state.blogIndexSha = sha
    },
    removeSite(state) {
      state.pages = undefined;
      state.articles = undefined;
      state.siteRepoConfig = undefined;
    },
    invalidateToken(state) {
      state.accessToken = undefined;
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      console.log("Token has been invalidated");
    },
  },
});
