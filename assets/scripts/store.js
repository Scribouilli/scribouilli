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
    repoName: "test-website-repo-3796",
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
