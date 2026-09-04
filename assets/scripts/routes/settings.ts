import { CUSTOM_CSS_PATH } from '../config'
import { replaceComponent } from '../routeComponentLifeCycle.svelte'
import store, { type ScribouilliState } from '../store'
import {
  getCurrentRepoPages,
  setCurrentRepositoryFromQuerystring,
  saveCustomCSS,
} from '../actions/current-repository.ts'
import { getOAuthServiceAPI } from '../oauth-services-api/index.ts'
import { handleErrors } from '../utils'
import Settings from '../components/screens/Settings.svelte'
import { showArticles } from '../actions/article'
import page, { Context } from 'page'

function mapStateToProps(state: ScribouilliState) {
  // TODO: this should probably be `state` not `store.state`
  const { currentRepository } = store.state

  if (!currentRepository) {
    throw new TypeError('currentRepository is undefined')
  }

  const onDeleteRepository = () => {
    getOAuthServiceAPI().deleteRepository(currentRepository)
      .then(() => {
        page('/selectionner-un-site')
      })
      .catch(msg => handleErrors(msg))
  }

  return {
    buildStatus: state.buildStatus,
    theme: state.theme,
    deleteRepositoryUrl: `${currentRepository.publicRepositoryURL}/settings#danger-zone`,
    onDeleteRepository,
    showArticles: showArticles(state),
    currentRepository: state.currentRepository,
    onUpdateTheme: (theme: { css: string }): void => {
      saveCustomCSS(theme.css).catch(handleErrors)
    },
  }
}

export default async ({ querystring }: Context) => {
  await setCurrentRepositoryFromQuerystring(querystring)

  const { gitAgent } = store.state
  if (!gitAgent) {
    throw new TypeError('gitAgent is undefined')
  }

  // TODO: should that really be here?
  if (!store.state.theme.css) {
    gitAgent
      .getFile(CUSTOM_CSS_PATH)
      .then(content => {
        store.mutations.setTheme(content)
      })
      .catch(msg => handleErrors(msg))
  }

  getCurrentRepoPages()

  replaceComponent(Settings, mapStateToProps)
}
