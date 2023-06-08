// @ts-check

import AtelierArticles from "../components/screens/AtelierArticles.svelte";
import { svelteTarget } from "../config";
import databaseAPI from "../databaseAPI";
import { replaceComponent } from "../routeComponentLifeCycle";
import store from "../store";
import {
  checkRepositoryAvailabilityThen,
  handleErrors,
  makePublishedWebsiteURL,
  makeRepositoryURL,
} from "../utils";

function mapStateToProps(state) {
  return {
    publishedWebsiteURL: makePublishedWebsiteURL(state),
    articles: state.articles,
    buildStatus: state.buildStatus,
    repositoryURL: makeRepositoryURL(state),
    showArticles: state.blogIndexSha !== undefined || state.articles?.length > 0,
  };
}

export default () => {
  Promise.resolve(store.state.login).then(async (login) => {
    return checkRepositoryAvailabilityThen(
      login,
      store.state.repoName,
      () => {}
    );
  });

  const state = store.state;

  const atelierArticles = new AtelierArticles({
    target: svelteTarget,
    props: mapStateToProps(state),
  });
  replaceComponent(atelierArticles, mapStateToProps);

  Promise.resolve(state.login).then((login) => {
    databaseAPI
      .getArticlesList(login, state.repoName)
      .then((articles) => {
        store.mutations.setArticles(articles);
      })
      .catch((msg) => handleErrors(msg));
  });
};
