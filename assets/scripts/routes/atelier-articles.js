// @ts-check

import lireFrontMatter from 'front-matter'
import page from "page";

import store from "../store";
import {
  checkRepositoryAvailabilityThen,
  handleErrors,
  makeFileNameFromTitle,
  makeArticleFileName,
  makeFrontMatterYAMLJsaisPasQuoiLa,
  makePublishedWebsiteURL,
} from "../utils";
import { setCurrentRepositoryFromQuerystring } from "../actions";
import databaseAPI from "../databaseAPI";
import { svelteTarget } from "../config";
import { replaceComponent } from "../routeComponentLifeCycle";
import ArticleContenu from "../components/screens/ArticleContenu.svelte";


const makeMapStateToProps = (fileName) => (state) => {
  // Display existing file
  let file;
  if (fileName) {
    file = Promise.resolve(store.state.login).then((login) => {
      return databaseAPI
        .getFile(login, store.state.currentRepository.name, fileName)
        .then(({ content, sha }) => {
          const contenu = Buffer.from(content, "base64").toString();
          const {
            attributes: data,
            body: markdownContent,
          } = lireFrontMatter(contenu);

          return {
            fileName: fileName,
            content: markdownContent,
            previousContent: markdownContent,
            title: data?.title,
            previousTitle: data?.title,
            sha: sha,
          };
        })
        .catch((msg) => handleErrors(msg));
    });
    return {
      fileP: file,
      imageDirUrl: "",
      contenus: state.articles,
      buildStatus: state.buildStatus,
      showArticles: state.blogIndexSha !== undefined || state.articles?.length > 0,
      currentRepository: state.currentRepository,
    };
  } else {
    return {
      fileP: Promise.resolve({
        fileName: "",
        content: "",
        previousContent: undefined,
        title: "",
        previousTitle: undefined,
        sha: "",
      }),
      imageDirUrl: "",
      contenus: state.articles,
      buildStatus: state.buildStatus,
      showArticles: state.blogIndexSha !== undefined || state.articles?.length > 0,
      currentRepository: state.currentRepository,
    };
  }
};

export default ({ querystring }) => {
  setCurrentRepositoryFromQuerystring(querystring);

  Promise.resolve(store.state.login).then(async (login) => {
    return checkRepositoryAvailabilityThen(
      login,
      store.state.currentRepository.name,
      () => { }
    );
  });

  const state = store.state;
  const fileName = new URLSearchParams(querystring).get("path");
  const mapStateToProps = makeMapStateToProps(fileName);
  const currentRepository = state.currentRepository;

  const articleContenu = new ArticleContenu({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  });

  replaceComponent(articleContenu, mapStateToProps);

  Promise.resolve(state.login).then((login) => {
    articleContenu.$set({
      imageDirUrl: `https://github.com/${login}/${state.currentRepository.name}/tree/main/images`,
    });
  });
  articleContenu.$on("delete", ({ detail: { sha } }) => {
    Promise.resolve(state.login).then((login) => {
      store.mutations.setArticles(
        state.articles.filter((article) => {
          return article.path !== fileName;
        })
      );
      databaseAPI
        .deleteFile(login, state.currentRepository.name, fileName, sha)
        .then(() => {
          state.buildStatus.setBuildingAndCheckStatusLater();
          page(`/atelier-list-pages?repoName=${currentRepository.name}&account=${currentRepository.owner}`);
        })
        .catch((msg) => handleErrors(msg));
    });
  });

  articleContenu.$on(
    "save",
    ({
      detail: { fileName, content, previousContent, title, previousTitle, sha },
    }) => {
      const hasContentChanged = content !== previousContent;
      const hasTitleChanged = title !== previousTitle;

      // If no content changed, just redirect
      if (!hasTitleChanged && !hasContentChanged) {
        page(`/atelier-list-articles?repoName=${currentRepository.name}&account=${currentRepository.owner}`);
        return;
      }

      const existingDate = fileName.slice('_posts/'.length, '_posts/YYYY-MM-DD'.length)
      let date = new Date()
      if (existingDate !== '') {
        date = new Date(existingDate)
      }

      const newFileName = makeArticleFileName(title, date);

      const body = {
        message: `création de l'article ${title || "index.md"}`,
        content: Buffer.from(
          `${title ? makeFrontMatterYAMLJsaisPasQuoiLa(title) + "\n" : ""
          }${content}`
        ).toString("base64"),
      };

      let newArticles =
        state.articles?.filter((article) => {
          console.log(article.path, fileName);
          return article.path !== fileName;
        }) || [];
      newArticles.push({ title: title, path: newFileName });

      store.mutations.setArticles(newArticles);

      // If title changed
      if (fileName && fileName !== newFileName) {
        Promise.resolve(state.login).then((login) => {
          databaseAPI
            .updateFile(login, state.currentRepository.name, fileName, newFileName, body, sha)
            .then(() => {
              if (body.sha) {
                console.log("article mise à jour");
              } else {
                console.log("nouvel article créé");
              }
              state.buildStatus.setBuildingAndCheckStatusLater();
              page(`/atelier-list-pages?repoName=${currentRepository.name}&account=${currentRepository.owner}`);
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
                console.log("article mise à jour");
              } else {
                console.log("nouvel article créé");
              }
              state.buildStatus.setBuildingAndCheckStatusLater();
              page(`/atelier-list-pages?repoName=${currentRepository.name}&account=${currentRepository.owner}`);
            })
            .catch((msg) => handleErrors(msg));
        });
      }
    }
  );
};
