import GitAgent from './GitAgent.ts'
import { getOAuthServiceAPI } from './oauth-services-api/index.ts'
import ScribouilliGitRepo from './scribouilliGitRepo.ts'
import store from './store.ts'
import type { BuildStatus } from './types/git.ts'
import { isItStillCompiling } from './utils.ts'

let timeout: ReturnType<typeof setTimeout> | undefined

export function scheduleCheck(
  scribouilliGitRepo: ScribouilliGitRepo,
  gitAgent: GitAgent,
  delay = 5000,
) {
  if (!timeout) {
    timeout = setTimeout(async () => {
      const status = await getBuildStatus(scribouilliGitRepo, gitAgent).catch(
        () => 'error' as const,
      )
      store.mutations.setBuildStatus(status)
      timeout = undefined
    }, delay)
  }
}

export function setBuildingAndCheckStatusLater(
  scribouilliGitRepo: ScribouilliGitRepo,
  gitAgent: GitAgent,
  t = 30000,
) {
  store.mutations.setBuildStatus('in_progress')
  // @ts-ignore
  clearTimeout(timeout)
  timeout = undefined
  scheduleCheck(scribouilliGitRepo, gitAgent, t)
}

/**
 * mimoza includes the hash of the latest built commit in a comment in the HTML
 * of each page. We use that to know which version is currently online, and
 * whether the last build succeeded or not.
 */
async function getBuildStatus(
  currentRepository: ScribouilliGitRepo,
  gitAgent: GitAgent,
): Promise<BuildStatus> {
  const publishedWebsiteURL = await currentRepository.publishedWebsiteURL
  const lastCommit = await gitAgent.currentCommit()

  let html

  const response = await fetch(publishedWebsiteURL, {
    cache: 'no-store',
  })

  const url = new URL(response.url)

  console.log(`[getBuildStatus] url : ${url.toString()}`)
  console.log('[getBuildStatus] response :')
  console.log(response)

  if (
    !response.ok &&
    !isItStillCompiling(lastCommit) &&
    url.hostname.endsWith('gitlab.io')
  ) {
    console.log('[getBuildStatus] GitLab pages in 404')
    // We handle the case where GitLab redirects to the login page
    // because the account is not verified.
    return 'needs_account_verification'
  }

  if (!response.ok && !isItStillCompiling(lastCommit)) {
    console.log('[getBuildStatus] error')
    return 'error'
  }

  if (!response.ok && isItStillCompiling(lastCommit)) {
    console.log('[getBuildStatus] in_progress')
    return 'in_progress'
  }

  html = await response.text()

  const dom = new DOMParser().parseFromString(html, 'text/html')

  for (const node of dom.documentElement.childNodes) {
    if (node.nodeType === dom.COMMENT_NODE) {
      const comment = (node.textContent ?? '').trim()
      if (comment.startsWith('scribouilli-git-hash')) {
        const hash = comment.split(': ').at(1) ?? 'unknown'

        if (hash === 'unknown') {
          // For some reason, the jekyll-git-hash plugin didn't work or was not
          // correctly installed (this can happen with old Scribouilli websites
          // that didn't use a Gemfile).
          //
          // In that case, fallback to the GitHub/GitLab API.
          return await getViaApi(currentRepository)
        }

        if (hash === lastCommit.oid.slice(0, 7)) {
          console.log('[getBuildStatus] success')
          return 'success'
        } else {
          if (isItStillCompiling(lastCommit)) {
            console.log('[getBuildStatus] in_progress 2')
            return 'in_progress'
          } else {
            console.log('[getBuildStatus] error 2')
            return 'error'
          }
        }
      }
    }
  }

  // If there is no comment at all, we know that the website was built using an
  // old Scribouilli version: no changes were made since then, so we can assume
  // that the last build was successfull.

  console.log('[getBuildStatus] success 2')
  return 'success'
}

function getViaApi(scribouilliGitRepo: ScribouilliGitRepo) {
  return getOAuthServiceAPI().getPagesWebsiteDeploymentStatus(
    scribouilliGitRepo,
  )
}
