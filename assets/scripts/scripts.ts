import remember from 'remember'

import { OAUTH_PROVIDER_STORAGE_KEY } from './config.ts'
import './routes/main.ts'

import store from './store.ts'

// @ts-ignore
window.Buffer = buffer.Buffer

remember(OAUTH_PROVIDER_STORAGE_KEY)
  // @ts-ignore
  .then(oAuthProvider => store.mutations.setOAuthProvider(oAuthProvider))
