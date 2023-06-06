// @ts-check

import parseMarkdown from "@github-docs/frontmatter";
import store from "../store";
import { checkRepositoryAvailabilityThen, handleErrors, makeFileNameFromTitle, makeFrontMatterYAMLJsaisPasQuoiLa, makePublishedWebsiteURL, makeRepositoryURL } from "../utils";
import databaseAPI from "../databaseAPI";
import { svelteTarget } from "../config";
import { replaceComponent } from "../routeComponentLifeCycle";
import ArticleContenu from "../components/ArticleContenu.svelte";

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

export default ({ querystring }) => {
    Promise.resolve(store.state.login).then(async (login) => {
      return checkRepositoryAvailabilityThen(
        login,
        store.state.repoName,
        () => {}
      );
    });
  
    const state = store.state;
    const fileName = new URLSearchParams(querystring).get("article");
    const mapStateToProps = makeMapStateToProps(fileName)
  
    const articleContenu = new ArticleContenu({
      target: svelteTarget,
      props: mapStateToProps(store.state),
    });
  
    replaceComponent(articleContenu, mapStateToProps);
  
    Promise.resolve(state.login).then((login) => {
      articleContenu.$set({
        imageDirUrl: `https://github.com/${login}/${state.repoName}/tree/main/images`,
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
}