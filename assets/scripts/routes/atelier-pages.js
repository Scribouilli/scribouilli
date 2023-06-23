// @ts-check

import lireFrontMatter from 'front-matter'
import page from "page";

import { svelteTarget } from "../config";
import databaseAPI from "../databaseAPI";
import { replaceComponent } from "../routeComponentLifeCycle";
import store from "../store";
import {
  checkRepositoryAvailabilityThen,
  handleErrors,
  logMessage,
  makeFileNameFromTitle,
  makeFrontMatterYAMLJsaisPasQuoiLa,
  makePublishedWebsiteURL,
} from "../utils";
import { setCurrentRepositoryFromQuerystring } from "../actions";
import PageContenu from "../components/screens/PageContenu.svelte";

const makeMapStateToProps = (fileName) => (state) => {
  // Display existing file
  if (fileName) {
    const fileP = async function () {
      try {
        const login = await Promise.resolve(store.state.login)
        const { content, sha } = await databaseAPI.getFile(
          login,
          store.state.currentRepository.name,
          fileName
        )
        const contenu = Buffer.from(content, "base64").toString();
        const {
          attributes: data,
          body: markdownContent,
        } = lireFrontMatter(contenu);

        return {
          fileName,
          content: markdownContent,
          previousContent: markdownContent,
          title: data?.title,
          previousTitle: data?.title,
          sha: sha,
        }
      } catch (errorMessage) {
        logMessage(errorMessage, "routes/atelier-pages.js:makeMapStateToProps");
      }
    };

    return {
      fileP: fileP(),
      imageDirUrl: "",
      contenus: state.articles,
      buildStatus: state.buildStatus,
      showArticles: state.blogIndexSha !== undefined || state.articles?.length > 0,
      currentRepository: state.currentRepository,
    }
  } else {
    return {
      fileP: Promise.resolve({
        fileName: "",
        title: "",
        content: "",
        previousTitle: undefined,
        previousContent: undefined,
        sha: "",
      }),
      imageDirUrl: "",
      makeFileNameFromTitle: makeFileNameFromTitle,
      contenus: state.pages,
      buildStatus: state.buildStatus,
      showArticles: state.blogIndexSha !== undefined || state.articles?.length > 0,
      currentRepository: state.currentRepository,
    };
  }
};

export default ({ querystring }) => {
  setCurrentRepositoryFromQuerystring(querystring);

  const state = store.state;
  const fileName = new URLSearchParams(querystring).get("path");
  const mapStateToProps = makeMapStateToProps(fileName);

  const pageContenu = new PageContenu({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  });

  replaceComponent(pageContenu, mapStateToProps);

  Promise.resolve(state.login).then((login) => {
    // @ts-ignore
    pageContenu.$set({
      imageDirUrl: `https://github.com/${login}/${state.currentRepository.name}/tree/main/images`,
    });
  });
  // @ts-ignore
  pageContenu.$on("delete", ({ detail: { sha } }) => {
    Promise.resolve(state.login).then((login) => {
      store.mutations.setPages(
        state.pages.filter((page) => {
          return page.path !== fileName;
        })
      );
      databaseAPI
        .deleteFile(login, state.currentRepository.name, fileName, sha)
        .then(() => {
          state.buildStatus.setBuildingAndCheckStatusLater();
          page("/atelier-list-pages");
        })
        .catch((msg) => handleErrors(msg));
    });
  });

  // @ts-ignore
  pageContenu.$on(
    "save",
    ({
      detail: { fileName, content, previousContent, title, previousTitle, sha },
    }) => {
      const hasContentChanged = content !== previousContent;
      const hasTitleChanged = title !== previousTitle;

      // If no content changed, just redirect
      if (!hasTitleChanged && !hasContentChanged) {
        page("/atelier-list-pages");
        return;
      }

      let newFileName = fileName;
      if (fileName !== "index.md") {
        newFileName = makeFileNameFromTitle(title);
      }

      const body = {
        message: `création de la page ${title || "index.md"}`,
        content: Buffer.from(
          `${title ? makeFrontMatterYAMLJsaisPasQuoiLa(title) + "\n" : ""
          }${content}`
        ).toString("base64"),
      };

      let newPages =
        state.pages?.filter((page) => {
          return page.path !== fileName;
        }) || [];
      newPages.push({ title: title, path: newFileName });

      store.mutations.setPages(newPages);

      // If title changed
      if (fileName && fileName !== newFileName) {
        Promise.resolve(state.login).then((login) => {
          databaseAPI
            .updateFile(login, state.currentRepository.name, fileName, newFileName, body, sha)
            .then(() => {
              if (body.sha) {
                console.log("page mise à jour");
              } else {
                console.log("nouvelle page créée");
              }
              state.buildStatus.setBuildingAndCheckStatusLater();
              page("/atelier-list-pages");
            })
            .catch((msg) => handleErrors(msg));
        });
      } else {
        Promise.resolve(state.login).then((login) => {
          body.sha = sha;
          databaseAPI
            .createFile(login, state.currentRepository.name, newFileName, body)
            .then(() => {
              if (body.sha) {
                console.log("page mise à jour");
              } else {
                console.log("nouvelle page créée");
              }
              state.buildStatus.setBuildingAndCheckStatusLater();
              page("/atelier-list-pages");
            })
            .catch((msg) => handleErrors(msg));
        });
      }
    }
  );
};
