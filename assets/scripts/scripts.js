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

page("/atelier-article", ({ querystring }) => {
  Promise.resolve(store.state.login).then(async (login) => {
    return checkRepositoryAvailabilityThen(
      login,
      store.state.repoName,
      () => {}
    );
  });

  const state = store.state;
  const fileName = new URLSearchParams(querystring).get("article");
  console.log("filename : ", fileName);

  function mapStateToProps(state) {
    console.log(makeRepositoryURL(state));
    return {
      fileName: fileName,
      title: "",
      content: "",
      imageDirUrl: "",
      previousTitle: undefined,
      previousContent: undefined,
      makeFileNameFromTitle: makeFileNameFromTitle,
      // TOUTDOUX Il se passe un truc bizarre ici quand on recharge la page
      articlesP: Promise.resolve(state.login).then((login) =>
        databaseAPI
          .getArticlesList(login, state.repoName)
          .catch((msg) => handleErrors(msg))
      ),
      sha: "",
      publishedWebsiteURL: makePublishedWebsiteURL(state),
      buildStatus: state.buildStatus,
      repositoryURL: makeRepositoryURL(state),
    };
  }

  //@ts-ignore
  const articleContenu = new ArticleContenu({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  });

  replaceComponent(articleContenu, mapStateToProps);

  Promise.resolve(state.login).then((login) => {
    // @ts-ignore
    articleContenu.$set({
      imageDirUrl: `https://github.com/${login}/${state.repoName}/tree/main/images`,
    });
  });
  // @ts-ignore
  articleContenu.$on("delete", ({ detail: { sha } }) => {
    Promise.resolve(state.login).then((login) => {
      store.mutations.setArticles(
        state.articles.filter((article) => {
          return article.path !== fileName;
        })
      );
      databaseAPI
        .deleteFile(login, state.repoName, fileName, sha)
        .then(() => {
          state.buildStatus.setBuildingAndCheckStatusLater();
          page("/atelier-list-articles");
        })
        .catch((msg) => handleErrors(msg));
    });
  });

  // @ts-ignore
  articleContenu.$on(
    "save",
    ({
      detail: { fileName, content, previousContent, title, previousTitle, sha },
    }) => {
      const hasContentChanged = content !== previousContent;
      const hasTitleChanged = title !== previousTitle;

      // If no content changed, just redirect
      if (!hasTitleChanged && !hasContentChanged) {
        page("/atelier-list-articles");
        return;
      }

      let newFileName = fileName;
      if (fileName !== "index.md") {
        newFileName = makeFileNameFromTitle(title);
      }

      const body = {
        message: `création de l'article ${title || "index.md"}`,
        content: Buffer.from(
          `${
            title ? makeFrontMatterYAMLJsaisPasQuoiLa(title) + "\n" : ""
          }${content}`
        ).toString("base64"),
      };

      let newArticles =
        state.articles?.filter((article) => {
          console.log(article.path, fileName);
          return article.path !== fileName;
        }) || [];
      newArticles.push({ title: title, path: "_posts/" + newFileName });

      store.mutations.setArticles(newArticles);

      // If title changed
      if (fileName && fileName !== newFileName) {
        Promise.resolve(state.login).then((login) => {
          databaseAPI
            .updateFile(
              login,
              state.repoName,
              "_posts/" + fileName,
              "_posts/" + newFileName,
              body,
              sha
            )
            .then(() => {
              if (body.sha) {
                console.log("article mise à jour");
              } else {
                console.log("nouvel article créé");
              }
              state.buildStatus.setBuildingAndCheckStatusLater();
              page("/atelier-list-articles");
            })
            .catch((msg) => handleErrors(msg));
        });
      } else {
        Promise.resolve(state.login).then((login) => {
          body.sha = sha;
          databaseAPI
            .createFile(login, state.repoName, "_posts/" + newFileName, body)
            .then(() => {
              if (body.sha) {
                console.log("article mise à jour");
              } else {
                console.log("nouvel article créé");
              }
              state.buildStatus.setBuildingAndCheckStatusLater();
              page("/atelier-list-articles");
            })
            .catch((msg) => handleErrors(msg));
        });
      }
    }
  );

  // Display existing file
  if (fileName) {
    Promise.resolve(store.state.login).then((login) => {
      databaseAPI
        .getFile(login, store.state.repoName, fileName)
        //@ts-ignore
        .then(({ content, sha }) => {
          //@ts-ignore
          const contenu = Buffer.from(content, "base64").toString();
          const {
            data,
            content: markdownContent,
            errors,
          } = parseMarkdown(contenu);

          //@ts-ignore
          articleContenu.$set({
            fileName: fileName,
            content: markdownContent,
            previousContent: markdownContent,
            // @ts-ignore
            title: data.title,
            // @ts-ignore
            previousTitle: data.title,
            sha: sha,
          });
        })
        .catch((msg) => handleErrors(msg));
    });
  }
});

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
