import ResolutionDesynchronisation from '../components/screens/ResolutionDesynchronisation.svelte'
import { replaceComponent } from '../routeComponentLifeCycle.svelte.js'
import { setCurrentRepositoryFromQuerystring } from '../actions/current-repository.js'
import { showArticles } from '../actions/article.js'
import type { ScribouilliState } from '../store.js'
import { Context } from 'page'

const mapStateToProps = (state: ScribouilliState) => {
  const { conflict, currentRepository, buildStatus } = state

  return {
    conflict,
    currentRepository,
    showArticles: showArticles(state),
    buildStatus,
  }
}

export default async ({ querystring }: Context) => {
  await setCurrentRepositoryFromQuerystring(querystring)

  replaceComponent(ResolutionDesynchronisation, mapStateToProps)
}
