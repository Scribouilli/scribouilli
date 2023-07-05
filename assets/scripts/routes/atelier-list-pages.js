// @ts-check

import { svelteTarget } from "../config";
import databaseAPI from '../databaseAPI'
import { replaceComponent } from "../routeComponentLifeCycle";
import store from "../store";
import {
  getCurrentRepoPages,
  setCurrentRepositoryFromQuerystring,
} from "../actions";
import AtelierPages from "../components/screens/AtelierPages.svelte";

const mapStateToProps = (state) => {
  return {
    pages: state.pages.filter(p => p.path !== 'blog.md'),
    buildStatus: state.buildStatus,
    currentRepository: state.currentRepository,
    showArticles: state.pages.find(p => p.path === 'blog.md') !== undefined || state.articles?.length > 0,
  };
}

export default async ({ querystring }) => {
  setCurrentRepositoryFromQuerystring(querystring);

  const state = store.state;
  const atelierPages = new AtelierPages({
    target: svelteTarget,
    props: mapStateToProps(state),
  });

  replaceComponent(atelierPages, mapStateToProps);

  Promise.resolve(state.login).then(() => getCurrentRepoPages());
}
