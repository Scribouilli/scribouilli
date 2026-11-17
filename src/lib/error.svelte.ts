import { goto } from '$app/navigation'
import { resolve } from '$app/paths'
import { logMessage } from '#lib/logger.ts'
import { logout } from './user'
import { clearCache } from './storage'

export const error: ScribouilliError = $state({
  error: null
})

export interface ScribouilliError {
  error: Error | null
}


/**
 * @summary Handle errors catched by Promises
 */
export const handleErrors = (errorMessage: any) => {
  clearCache()
  switch (errorMessage) {
    case 'PROVIDER_NOT_LOADED':
    case 'INVALIDATE_TOKEN': {
      console.info('[invalid token] loging out')
      logout()
      break
    }
    case 'NOT_FOUND': {
      console.info('[NOT_FOUND] redirecting to /aterlier')
      // TODO: maybe a good idea to clear the cache (session storage) here
      goto(resolve('/atelier'))
      break
    }

    default:
      logMessage(errorMessage, 'handleErrors')
      error.error = new Error(errorMessage)
  }
}
