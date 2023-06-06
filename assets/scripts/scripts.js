//@ts-check

import parseMarkdown from "@github-docs/frontmatter";

import makeCreateProjectButtonListener from "./makeCreateProjectButtonListener.js";
// import prepareCreatePageScreen from "./prepareCreatePageScreen.js";
import "./routes/main.js";
import store from "./store.js";
import {
  ACCESS_TOKEN_STORAGE_KEY,
  TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER,
  svelteTarget,
} from "./config.js";
import { checkRepositoryAvailabilityThen, handleErrors, makeFileNameFromTitle, makeFrontMatterYAMLJsaisPasQuoiLa, makePublishedWebsiteURL, makeRepositoryURL } from "./utils.js";
import { replaceComponent } from "./routeComponentLifeCycle.js";
import databaseAPI from './databaseAPI.js'

import page from "page";

import CreateGithubAccount from "./components/CreateGithubAccount.svelte";
import PageContenu from "./components/PageContenu.svelte";
import ArticleContenu from "./components/ArticleContenu.svelte";
import Settings from "./components/Settings.svelte";

// @ts-ignore
window.Buffer = buffer.Buffer;

// Store access_token in browser
const url = new URL(location.href);
if (url.searchParams.has(TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER)) {
  url.searchParams.delete(TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER);
  history.replaceState(undefined, "", url);

  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, store.state.accessToken);
}

/**
 * Par ici, y'a des routes
 */

page("/create-github-account", () => {
  // @ts-ignore
  const createGithubAccount = new CreateGithubAccount({
    target: svelteTarget,
    props: {},
  });

  replaceComponent(createGithubAccount, () => {});
});

page("/settings", () => {
  Promise.resolve(store.state.login).then(async (login) => {
    return checkRepositoryAvailabilityThen(
      login,
      store.state.repoName,
      () => {}
    );
  });

  function mapStateToProps(state) {
    return {
      publishedWebsiteURL: makePublishedWebsiteURL(state),
      buildStatus: state.buildStatus,
      theme: state.theme,
      deleteRepositoryUrl: `https://github.com/${state.login}/${state.repoName}/settings#danger-zone`,
      repositoryURL: makeRepositoryURL(state),
    };
  }

  // @ts-ignore
  const settings = new Settings({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  });

  //@ts-ignore
  settings.$on("delete-site", () => {
    Promise.resolve(store.state.login).then((login) => {
      databaseAPI
        .deleteRepository(login, store.state.repoName)
        .then(() => {
          store.mutations.removeSite(store.state);
          page("/create-project");
        })
        .catch((msg) => handleErrors(msg));
    });
  });

  // @ts-ignore
  settings.$on("update-theme", ({ detail: { theme } }) => {
    Promise.resolve(store.state.login).then((login) => {
      databaseAPI
        .updateCustomCSS(login, store.state.repoName, theme.css, theme.sha)
        .then((response) => {
          store.mutations.setTheme(store.state.theme.css, response.content.sha);
          store.state.buildStatus.setBuildingAndCheckStatusLater(10000);
        })
        .catch((msg) => handleErrors(msg));
    });
  });

  if (!store.state.theme.sha) {
    Promise.resolve(store.state.login).then((login) => {
      databaseAPI
        .getFile(login, store.state.repoName, databaseAPI.customCSSPath)
        .then(({ content, sha }) => {
          store.mutations.setTheme(
            Buffer.from(content, "base64").toString().trim(),
            sha
          );
        })
        .catch((msg) => handleErrors(msg));
    });
  }

  replaceComponent(settings, mapStateToProps);
});

page.base(store.state.basePath);

page.start();
