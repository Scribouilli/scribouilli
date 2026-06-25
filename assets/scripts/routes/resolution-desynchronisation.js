// @ts-check

import ResolutionDesynchronisation from '../components/screens/ResolutionDesynchronisation.svelte'
import { replaceComponent } from '../routeComponentLifeCycle.svelte.js'
import { setCurrentRepositoryFromQuerystring } from '../actions/current-repository.js'
import { showArticles } from '../actions/article.js'

/**
 *
 * @param {import('../store.js').ScribouilliState} state
 * @returns
 */
const mapStateToProps = state => {
  const { conflict, currentRepository, buildStatus } = state

  return {
    conflict,
    currentRepository,
    showArticles: showArticles(state),
    buildStatus,
  }
}

/**
 * @param {import('page').Context} _
 */
export default async ({ querystring }) => {
  await setCurrentRepositoryFromQuerystring(querystring)

  replaceComponent(ResolutionDesynchronisation, mapStateToProps)
}
