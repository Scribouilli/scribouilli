//@ts-check

import page from 'page'

import store from '../store.js'

import welcome from './welcome.js'
import chooseAccount from './choose-account.js'
import account from './account.js'
import login from './login.js'
import afterOauthLogin from './after-oauth-login.js'
import atelierListArticles from './atelier-list-articles.js'
import atelierListPages from './atelier-list-pages.js'
import atelierPages from './atelier-pages.js'
import atelierArticles from './atelier-articles.js'
import createGithubAccount from './create-github-account.js'
import selectOrCreateSite from './select-or-create-site.js'
import createNewSite from './create-new-site.js'
import startFromExistingSite from './start-from-existing-site.js'
import settings from './settings.js'
import resolutionDesynchronisation from './resolution-desynchronisation.js'

page('/', welcome)
page('/choose-account', chooseAccount)
page('/account', account)
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

page('/atelier-list-articles', atelierListArticles)
page('/atelier-list-pages', atelierListPages)
page('/atelier-page', atelierPages)
page('/atelier-article', atelierArticles)
page('/create-github-account', createGithubAccount)
page('/selectionner-un-site', selectOrCreateSite)
page('/creer-un-nouveau-site', createNewSite)
page('/partir-dun-site-existant', startFromExistingSite)
page('/settings', settings)
page('/resolution-desynchronisation', resolutionDesynchronisation)

page.base(store.state.basePath)

page.start()
