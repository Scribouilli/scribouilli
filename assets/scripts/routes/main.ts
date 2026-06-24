import page from 'page'

import store from '../store.ts'
import { waitOauthProvider } from '../actions/setup.ts'

import welcome from './welcome.ts'
import chooseAccount from './choose-account.ts'
import account from './account.ts'
import login from './login.ts'
import afterOauthLogin from './after-oauth-login.ts'
import atelierListArticles from './atelier-list-articles.ts'
import atelierListPages from './atelier-list-pages.ts'
import atelierPages from './atelier-pages.ts'
import atelierArticles from './atelier-articles.ts'
import createAccount from './create-account.ts'
import selectOrCreateSite from './select-or-create-site.ts'
import createNewSite from './create-new-site.ts'
import startFromExistingSite from './start-from-existing-site.ts'
import settings from './settings.ts'
import resolutionDesynchronisation from './resolution-desynchronisation.ts'

function waitOauthProviderMiddleware(_: any, next: any) {
  waitOauthProvider().then(next)
}

page('/', welcome)
page('/choose-account', chooseAccount)
page('/account', account)
page('/create-account', createAccount)
page('/login', login)

page(
  '/after-github-login',
  (_, next) => {
    console.warn(
      `Utilisation de la route dépréciée '/after-github-login'. Utiliser plutôt '/after-oauth-login'`,
    )
    next()
  },
  afterOauthLogin,
)
page('/after-oauth-login', afterOauthLogin)

page('/atelier-list-articles', waitOauthProviderMiddleware, atelierListArticles)
page('/atelier-list-pages', waitOauthProviderMiddleware, atelierListPages)
page('/atelier-page', waitOauthProviderMiddleware, atelierPages)
page('/atelier-article', waitOauthProviderMiddleware, atelierArticles)
page('/selectionner-un-site', waitOauthProviderMiddleware, selectOrCreateSite)
page('/creer-un-nouveau-site', waitOauthProviderMiddleware, createNewSite)
page(
  '/partir-dun-site-existant',
  waitOauthProviderMiddleware,
  startFromExistingSite,
)
page('/settings', waitOauthProviderMiddleware, settings)
page(
  '/resolution-desynchronisation',
  waitOauthProviderMiddleware,
  resolutionDesynchronisation,
)

page.base(store.state.basePath)

page.start()
