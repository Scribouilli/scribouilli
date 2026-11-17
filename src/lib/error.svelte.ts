import { goto } from './urls'
import { resolve } from '$app/paths'
import { logMessage } from '#lib/logger.ts'
import { logout } from './user'
import { cache } from './storage'

export const error: ScribouilliError = $state({
  error: null,
})

export interface ScribouilliError {
  error: Error | null
}

/**
 * @summary Handle errors catched by Promises
 */
export const handleErrors = (errorMessage: any) => {
  cache.clear()
  switch (errorMessage) {
    case 'PROVIDER_NOT_LOADED':
    case 'INVALIDATE_TOKEN': {
      console.info('[invalid token] loging out')
      logout()
      break
    }
    case 'NOT_FOUND': {
      console.info('[NOT_FOUND] redirecting to /aterlier')
      goto(resolve('/atelier'))
      break
    }

    default:
      logMessage(errorMessage, 'handleErrors')
      error.error = new Error(errorMessage)
  }
}
