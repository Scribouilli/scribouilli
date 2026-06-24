import { replaceComponent } from '../routeComponentLifeCycle.svelte'
import { setCurrentRepositoryFromQuerystring } from '../actions/current-repository.js'
import AtelierPages from '../components/screens/AtelierPages.svelte'
import { showArticles } from '../actions/article'
import { Context } from 'page'
import type { ScribouilliState } from '../store.js'

const mapStateToProps = (state: ScribouilliState) => {
  if (!state.currentRepository) {
    throw new TypeError('currentRepository is undefined')
  }

  return {
    pages: state.pages,
    buildStatus: state.buildStatus,
    currentRepository: state.currentRepository,
    showArticles: showArticles(state),
    conflict: state.conflict,
  }
}

export default async ({ querystring }: Context) => {
  await setCurrentRepositoryFromQuerystring(querystring)

  replaceComponent(AtelierPages, mapStateToProps)
}
