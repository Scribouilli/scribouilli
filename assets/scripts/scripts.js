//@ts-check

import remember from 'remember'

import { OAUTH_PROVIDER_STORAGE_KEY } from './config.js'
import './routes/main.js'

import store from './store.js'

// @ts-ignore
window.Buffer = buffer.Buffer

remember(OAUTH_PROVIDER_STORAGE_KEY)
  // @ts-ignore
  .then(oAuthProvider => store.mutations.setOAuthProvider(oAuthProvider))
