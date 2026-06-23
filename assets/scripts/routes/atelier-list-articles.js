// @ts-check

import AtelierArticles from '../components/screens/AtelierArticles.svelte'
import { replaceComponent } from '../routeComponentLifeCycle.svelte'
import {
  getCurrentRepoArticles,
  setCurrentRepositoryFromQuerystring,
} from '../actions/current-repository.js'
import { showArticles } from '../actions/article'

/**
 *
 * @param {import('../store').ScribouilliState} state
 * @returns
 */
function mapStateToProps(state) {
  if (!state.currentRepository) {
    throw new TypeError('currentRepository is undefined')
  }

  return {
    articles: state.articles,
    buildStatus: state.buildStatus,
    currentRepository: state.currentRepository,
    showArticles: showArticles(state),
    conflict: state.conflict,
  }
}

/**
 * @param {import('page').Context} _
 */
export default async ({ querystring }) => {
  await setCurrentRepositoryFromQuerystring(querystring)

  getCurrentRepoArticles()

  replaceComponent(AtelierArticles, mapStateToProps)
}

/**
 *
 * @param {ScribouilliGitRepo} scribouilliGitRepo
 * @returns {string}
 */
export function makeAtelierListArticlesURL({ owner, repoName }) {
  return `/atelier-list-articles?account=${owner}&repoName=${repoName}`
}
