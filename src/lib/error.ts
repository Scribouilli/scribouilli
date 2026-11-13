import { goto } from '$app/navigation'
import { resolve } from '$app/paths'
import { logMessage } from '#lib/logger.ts'
import { error } from '@sveltejs/kit'
import { logout } from './user'

/**
 * @summary Handle errors catched by Promises
 */
export const handleErrors = (errorMessage: any) => {
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
      error(500, String(errorMessage))
  }
}
