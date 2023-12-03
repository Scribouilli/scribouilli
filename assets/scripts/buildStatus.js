//@ts-check

import { getOAuthServiceAPI } from './oauth-services-api/index.js'
import { logMessage } from './utils.js'

/**
 * @typedef {"in_progress" | "success" | "error"} BuildStatus
 */

/**
 *
 * @param {string} owner
 * @param {string} repoName
 * @returns
 */
export default function (owner, repoName) {
  /** @type {BuildStatus} */
  let repoStatus = 'in_progress'
  /** @type {(status: BuildStatus) => any} */
  let reaction
  /** @type {ReturnType<setTimeout> | undefined} */
  let timeout

  function scheduleCheck(delay = 5000) {
    if (!timeout) {
      timeout = setTimeout(() => {
        buildStatusObject.checkStatus()
        timeout = undefined
      }, delay)
    }
  }

  const buildStatusObject = {
    get status() {
      return repoStatus
    },
    /**
     *
     * @param {(status: BuildStatus) => any} callback
     */
    subscribe(callback) {
      console.log('subscribe reaction.. ', callback)
      reaction = callback
    },
    checkStatus() {
      return (
        getOAuthServiceAPI()
          .getPagesWebsiteDeploymentStatus(owner, repoName)
          // @ts-ignore
          .then(status => {
            logMessage(
              `GitHub deployment's status is ${status}`,
              'buildStatus.checkStatus',
            )

            if (['in_progress', 'success', 'error'].includes(status)) {
              repoStatus = status
            } else {
              repoStatus = 'in_progress'
            }

            if (reaction) {
              reaction(repoStatus)
            }

            if (repoStatus === 'in_progress') {
              scheduleCheck()
            }
          })
          .catch(() => {
            repoStatus = 'error'
            if (reaction) {
              reaction(repoStatus)
            }
          })
      )
    },
    setBuildingAndCheckStatusLater(t = 30000) {
      repoStatus = 'in_progress'
      // @ts-ignore
      clearTimeout(timeout)
      timeout = undefined
      scheduleCheck(t)
    },
  }

  buildStatusObject.checkStatus()
  return buildStatusObject
}
