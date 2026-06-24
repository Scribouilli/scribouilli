import ResolutionDesynchronisation from '../components/screens/ResolutionDesynchronisation.svelte'
import { replaceComponent } from '../routeComponentLifeCycle.svelte.ts'
import { setCurrentRepositoryFromQuerystring } from '../actions/current-repository.ts'
import { showArticles } from '../actions/article.ts'
import type { ScribouilliState } from '../store.ts'
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
