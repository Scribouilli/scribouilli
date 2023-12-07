// @ts-check

import store from '../store.js'

import ResolutionDesynchronisation from '../components/screens/ResolutionDesynchronisation.svelte'

import { svelteTarget } from '../config.js'
import { replaceComponent } from '../routeComponentLifeCycle.js'
import { setCurrentRepositoryFromQuerystring } from '../actions/current-repository.js'

/**
 *
 * @param {import('../store.js').ScribouilliState} state
 * @returns
 */
const mapStateToProps = state => {
  const { conflict, currentRepository, buildStatus, pages, articles } = state

  return {
    conflict,
    currentRepository,
    showArticles:
      (pages && pages.find(p => p.path === 'blog.md') !== undefined) ||
      (articles && articles.length > 0),
    buildStatus,
  }
}

/**
 * @param {import('page').Context} _
 */
export default ({ querystring }) => {
  setCurrentRepositoryFromQuerystring(querystring)

  const conflictResolution = new ResolutionDesynchronisation({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  })

  replaceComponent(conflictResolution, mapStateToProps)
}
