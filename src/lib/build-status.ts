import ScribouilliGitRepo from '#lib/atelier/repo.svelte.ts'
import * as store from '#lib/store.svelte.ts'
import type { CommitObject } from 'isomorphic-git'

let timeout: ReturnType<typeof setTimeout> | undefined

export type BuildStatus = 'in_progress' | 'success' | 'error' | 'needs_account_verification'

export const isItStillCompiling = (lastCommit: CommitObject): boolean => {
  // Delay (in seconds) after which a non-updated website is assumed to have failed to build.
  const ERROR_DELAY = 60 * 1000
  const currentTime = new Date().getTime() / 1000
  const deltaTime = currentTime - lastCommit.committer.timestamp
  return deltaTime <= ERROR_DELAY
}

// TODO: Make this return a Promise<BuildStatus> ?
export function scheduleCheck(
  repo: ScribouilliGitRepo,
  delay = 5000,
) {
  if (!timeout) {
    timeout = setTimeout(async () => {
      const status = await getBuildStatus(repo).catch(
        () => 'error' as const,
      )
      store.state.buildStatus = status
      timeout = undefined
    }, delay)
  }
}

export function setBuildingAndCheckStatusLater(
  repo: ScribouilliGitRepo,
  t = 30000,
) {
  store.state.buildStatus = 'in_progress'
  // @ts-ignore
  clearTimeout(timeout)
  timeout = undefined
  scheduleCheck(repo, t)
}

/**
 * mimoza includes the hash of the latest built commit in a comment in the HTML
 * of each page. We use that to know which version is currently online, and
 * whether the last build succeeded or not.
 */
async function getBuildStatus(
  repo: ScribouilliGitRepo,
): Promise<BuildStatus> {
  if (!repo.publishedUrl) {
    return 'in_progress'
  }

  const publishedWebsiteURL = repo.publishedUrl

  const lastCommit = await repo.gitAgent.currentCommit()

  let html

  const response = await fetch(publishedWebsiteURL, {
    cache: 'no-store',
  })

  const url = new URL(response.url)

  console.log(`[getBuildStatus] url : ${url.toString()}`)
  console.log('[getBuildStatus] response :')
  console.log(response)

  if (!response.ok && !isItStillCompiling(lastCommit) && url.hostname.endsWith('gitlab.io')) {
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
          return await repo.deploymentStatus()
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
