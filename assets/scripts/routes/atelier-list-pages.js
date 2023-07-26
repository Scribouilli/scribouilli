// @ts-check

import { svelteTarget } from "../config";
import { replaceComponent } from "../routeComponentLifeCycle";
import store from "../store";
import {
  getCurrentRepoPages,
  setCurrentRepositoryFromQuerystring,
} from "../actions";
import AtelierPages from "../components/screens/AtelierPages.svelte";

/**
 * 
 * @param {import("../store").ScribouilliState} state 
 * @returns 
 */
const mapStateToProps = (state) => {
  return {
    pages: state.pages.filter(p => p.path !== 'blog.md'),
    buildStatus: state.buildStatus,
    currentRepository: state.currentRepository,
    showArticles: state.pages.find(p => p.path === 'blog.md') !== undefined || state.articles?.length > 0,
  };
}

export default async ({ querystring }) => {
  setCurrentRepositoryFromQuerystring(querystring)
    .then(getCurrentRepoPages);

  const state = store.state;
  const atelierPages = new AtelierPages({
    target: svelteTarget,
    props: mapStateToProps(state),
  });

  replaceComponent(atelierPages, mapStateToProps);
}

/**
 * 
 * @param {string} account 
 * @param {string} repoName 
 * @returns {string}
 */
export function makeAtelierListPageURL(account, repoName){
  return `/atelier-list-pages?account=${account}&repoName=${repoName}`
}