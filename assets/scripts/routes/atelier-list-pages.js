// @ts-check

import { svelteTarget } from '../config'
import { replaceComponent } from '../routeComponentLifeCycle'
import store from '../store'
import {
  getCurrentRepoConfig,
  setCurrentRepositoryFromQuerystring,
} from '../actions/current-repository.js'
import AtelierPages from '../components/screens/AtelierPages.svelte'

/**
 *
 * @param {import("../store").ScribouilliState} state
 * @returns
 */
const mapStateToProps = state => {
  if (!state.currentRepository) {
    throw new TypeError('currentRepository is undefined')
  }

  return {
    pages: state.pages && state.pages.filter(p => p.path !== 'blog.md'),
    buildStatus: state.buildStatus,
    currentRepository: state.currentRepository,
    showArticles:
      (state.pages &&
        state.pages.find(p => p.path === 'blog.md') !== undefined) ||
      (state.articles && state.articles.length > 0),
    conflict: state.conflict,
  }
}

/**
 * @param {import('page').Context} _
 */
export default async ({ querystring }) => {
  await setCurrentRepositoryFromQuerystring(querystring)
  await getCurrentRepoConfig()

  const state = store.state
  const atelierPages = new AtelierPages({
    target: svelteTarget,
    props: mapStateToProps(state),
  })

  replaceComponent(atelierPages, mapStateToProps)
}
