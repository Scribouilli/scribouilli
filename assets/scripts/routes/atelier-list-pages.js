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
    pages: state.pages,
    buildStatus: state.buildStatus,
    currentRepository: state.currentRepository,
    showArticles: state.blogIndexSha !== undefined || state.articles?.length > 0,
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
