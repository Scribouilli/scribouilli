import { goto } from '$app/navigation'
import { resolve } from '$app/paths'
import { logMessage } from '#lib/logger.ts'
import { error } from '@sveltejs/kit'
import { logout } from './user'

/**
 * @summary Handle errors catched by Promises
 */
export const handleErrors = (errorMessage: string) => {
  switch (errorMessage) {
    case 'INVALIDATE_TOKEN': {
      console.info('[invalid token] loging out')
      logout()

      break
    }
    case 'REPOSITORY_NOT_FOUND': {
      console.info('[REPOSITORY_NOT_FOUND] redirecting to /aterlier')
      goto(resolve('/atelier'))

      break
    }
    case 'NOT_FOUND':
      const message = `gitAgent call failed: ${errorMessage}`
      logMessage(message, 'handleErrors')

      break

    default:
      logMessage(errorMessage, 'handleErrors')
      error(500, errorMessage)
  }
}
