import { goto } from '$app/navigation'
import { resolve } from '$app/paths'
import { logMessage } from '#lib/logger.ts'
import * as store from '#lib/store.svelte.ts'
import { error } from '@sveltejs/kit'

/**
 * @summary Handle errors catched by Promises
 */
export const handleErrors = (errorMessage: string) => {
  switch (errorMessage) {
    case 'INVALIDATE_TOKEN': {
      store.logout()
      console.info('[invalid token] redirecting to /')
      goto(resolve('/'))

      break
    }
    case 'REPOSITORY_NOT_FOUND': {
      console.info('[REPOSITORY_NOT_FOUND] redirecting to /selectionner-un-site')
      goto(resolve('/selectionner-un-site'))

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
