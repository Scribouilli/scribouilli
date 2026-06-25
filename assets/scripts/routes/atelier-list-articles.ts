import AtelierArticles from '../components/screens/AtelierArticles.svelte'
import { replaceComponent } from '../routeComponentLifeCycle.svelte'
import {
  getCurrentRepoArticles,
  setCurrentRepositoryFromQuerystring,
} from '../actions/current-repository.ts'
import { showArticles } from '../actions/article'
import type { ScribouilliState } from '../store.ts'
import ScribouilliGitRepo from '../scribouilliGitRepo.ts'
import { Context } from 'page'

function mapStateToProps(state: ScribouilliState) {
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

export default async ({ querystring }: Context) => {
  await setCurrentRepositoryFromQuerystring(querystring)

  getCurrentRepoArticles()

  replaceComponent(AtelierArticles, mapStateToProps)
}

export function makeAtelierListArticlesURL({
  owner,
  repoName,
}: ScribouilliGitRepo): string {
  return `/atelier-list-articles?account=${owner}&repoName=${repoName}`
}
