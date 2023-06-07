// @ts-check

import parseMarkdown from "@github-docs/frontmatter";
import page from "page";

import { svelteTarget } from "../config";
import databaseAPI from "../databaseAPI";
import { replaceComponent } from "../routeComponentLifeCycle";
import store from "../store";
import {
  checkRepositoryAvailabilityThen,
  handleErrors,
  makeFileNameFromTitle,
  makeFrontMatterYAMLJsaisPasQuoiLa,
  makePublishedWebsiteURL,
  makeRepositoryURL,
} from "../utils";
import PageContenu from "../components/screens/PageContenu.svelte";

const makeMapStateToProps = (fileName) => (state) => {
  return {
    fileName: fileName,
    title: "",
    content: "",
    imageDirUrl: "",
    previousTitle: undefined,
    previousContent: undefined,
    makeFileNameFromTitle: makeFileNameFromTitle,
    // TOUTDOUX Il se passe un truc bizarre ici quand on recharge la page
    pagesP: Promise.resolve(state.login).then((login) =>
      databaseAPI
        .getPagesList(login, state.repoName)
        .catch((msg) => handleErrors(msg))
    ),
    sha: "",
    publishedWebsiteURL: makePublishedWebsiteURL(state),
    buildStatus: state.buildStatus,
    repositoryURL: makeRepositoryURL(state),
  };
};

export default ({ querystring }) => {
  Promise.resolve(store.state.login).then(async (login) => {
    return checkRepositoryAvailabilityThen(
      login,
      store.state.repoName,
      () => {}
    );
  });

  const state = store.state;
  const fileName = new URLSearchParams(querystring).get("page");
  const mapStateToProps = makeMapStateToProps(fileName);

  const pageContenu = new PageContenu({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  });

  replaceComponent(pageContenu, mapStateToProps);

  Promise.resolve(state.login).then((login) => {
    // @ts-ignore
    pageContenu.$set({
      imageDirUrl: `https://github.com/${login}/${state.repoName}/tree/main/images`,
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
        .deleteFile(login, state.repoName, fileName, sha)
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
          `${
            title ? makeFrontMatterYAMLJsaisPasQuoiLa(title) + "\n" : ""
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
            .updateFile(login, state.repoName, fileName, newFileName, body, sha)
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
            .createFile(login, state.repoName, newFileName, body)
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
          pageContenu.$set({
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
};
