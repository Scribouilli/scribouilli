//@ts-check

import page from 'page'

import store from '../store.js'
import { waitOauthProvider } from '../actions/setup.js'

import welcome from './welcome.js'
import chooseAccount from './choose-account.js'
import account from './account.js'
import login from './login.js'
import afterOauthLogin from './after-oauth-login.js'
import atelierListArticles from './atelier-list-articles.js'
import atelierListPages from './atelier-list-pages.js'
import atelierPages from './atelier-pages.js'
import atelierArticles from './atelier-articles.js'
import createAccount from './create-account.js'
import selectOrCreateSite from './select-or-create-site.js'
import createNewSite from './create-new-site.js'
import startFromExistingSite from './start-from-existing-site.js'
import settings from './settings.js'
import resolutionDesynchronisation from './resolution-desynchronisation.js'

/**
 *
 * @param {any} context
 * @param {any} next
 */
function waitOauthProviderMiddleware(context, next) {
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
