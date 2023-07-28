//@ts-check

import databaseAPI from './databaseAPI.js'
import { logMessage } from './utils.js'

/*

Pas d'étoile


Tant que le répo ne déploi pas, le status vaut `null`
Quand un build est annulé par un nouveau commit,

l'API de statut retourne d'abord une erreur et plus tard, `building` puis `built`

Quand on viens de commité et qu'on interroge l'API `/pages`
elle nous réponds d'abord que c'est built (parce que le nouveau build n'a pas commencé).

https://docs.github.com/en/rest/pages?apiVersion=2022-11-28#get-a-github-pages-site

Peut-être que l'on pourrait changer de stratégie et utiliser
`await octokit.request('GET /repos/{owner}/{repo}/deployments'` avec un 1 per_page

Puis, récupérer

"statuses_url": "https://api.github.com/repos/octocat/example/deployments/1/statuses",
pour ensuite faire du polling dessus, et récupérer la propriété state

    "state": {
        "description": "The state of the status.",
        "enum": [
          "error",
          "failure",
          "inactive",
          "pending",
          "success",
          "queued",
          "in_progress"
        ]
    }



NOTE

Nous pensons que GitHub laisse mourrir l'API GitHub Pages

Un refactoring à faire plus tard serait d'utilise les API de déploiement qui sont plus riche en information.

Nous pourirons essayer de suivre un commit pour s'assurer que nous allons à la fin du déploiement.

Voir `databaseAPI.getLastDeployment(login, repoName)` et `databaseAPI.getDeploymentStatus(deployment)`


*/

/**
 *
 * @param {string} owner
 * @param {string} repoName
 * @returns
 */
export default function (owner, repoName) {
  /** @type {"building" | "built" | "errored"} */
  let repoStatus = 'building'
  let reaction = undefined
  let lastSuccessCheck
  let lastErrorCheck
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
    subscribe(callback) {
      console.log('subscribe reaction.. ', callback)
      reaction = callback
    },
    checkStatus() {
      return databaseAPI
        .getGitHubPagesSite(owner, repoName)
        .then(({ status }) => {
          logMessage(
            `GitHub Pages status is ${status}`,
            'buildStatus.checkStatus',
          )

          if (['built', 'errored', 'building'].includes(status)) {
            repoStatus = status
          } else {
            // status === null
            repoStatus = 'building'
          }

          if (reaction) {
            reaction(repoStatus)
          }

          if (repoStatus === 'building') {
            scheduleCheck()
          }
        })
        .catch(error => {
          // If GitHub Pages has not been enabled when the repository was created,
          // we create it now.
          if (error === 'NOT_FOUND') {
            const errorMessage = `GitHub Pages site not found for ${owner}/${repoName}. Creating it now.`

            logMessage(errorMessage, 'buildStatus.checkStatus')

            databaseAPI.createRepoGithubPages(owner, repoName)
          }

          repoStatus = 'errored'
          if (reaction) {
            reaction(repoStatus)
          }
        })
    },
    setBuildingAndCheckStatusLater(t = 30000) {
      repoStatus = 'building'
      clearTimeout(timeout)
      timeout = undefined
      scheduleCheck(t)
    },
  }

  buildStatusObject.checkStatus()
  return buildStatusObject
}
