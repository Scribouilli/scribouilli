// @ts-check

import AtelierArticles from "../components/screens/AtelierArticles.svelte";
import { svelteTarget } from "../config";
import databaseAPI from "../databaseAPI";
import { replaceComponent } from "../routeComponentLifeCycle";
import store from "../store";
import {
  getCurrentRepoArticles,
  setCurrentRepositoryFromQuerystring,
} from "../actions";

function mapStateToProps(state) {
  return {
    articles: state.articles,
    buildStatus: state.buildStatus,
    currentRepository: state.currentRepository,
    showArticles: state.pages.find(p => p.path === 'blog.md') !== undefined || state.articles?.length > 0,
  };
}

export default ({ querystring }) => {
  setCurrentRepositoryFromQuerystring(querystring);

  const state = store.state;
  const atelierArticles = new AtelierArticles({
    target: svelteTarget,
    props: mapStateToProps(state),
  });

  replaceComponent(atelierArticles, mapStateToProps);

  Promise.resolve(state.login).then(() => getCurrentRepoArticles());
}
