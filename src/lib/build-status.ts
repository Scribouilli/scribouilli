import ScribouilliGitRepo from '#lib/atelier/repo.svelte.ts'
import type { CommitObject } from 'isomorphic-git'

export type BuildStatus = 'in_progress' | 'success' | 'error' | 'needs_account_verification'

export const isItStillCompiling = (lastCommit: CommitObject): boolean => {
  // NOTE: delay is 2 minutes
  const ERROR_DELAY = 2 * 60
  const currentTime = new Date().getTime() / 1000
  const deltaTime = currentTime - lastCommit.committer.timestamp
  return deltaTime <= ERROR_DELAY
}

/**
 * mimoza includes the hash of the latest built commit in a comment in the HTML
 * of each page. We use that to know which version is currently online, and
 * whether the last build succeeded or not.
 */
export async function getBuildStatus(
  repo: ScribouilliGitRepo,
): Promise<BuildStatus> {
  if (!repo.publishedUrl) {
    console.log('[getBuildStatus]: no published url')
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
    console.log('[getBuildStatus] error: fetch HTML failed')
    return 'error'
  }

  if (!response.ok && isItStillCompiling(lastCommit)) {
    console.log('[getBuildStatus] in_progress: fetch HTML failed, grace period')
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
            console.log('[getBuildStatus] in_progress: fetch successfull, website still updating')
            return 'in_progress'
          } else {
            console.log('[getBuildStatus] error: fetch successfull, website not updated')
            return 'error'
          }
        }
      }
    }
  }

  // If there is no comment at all, we know that the website was built using an
  // old Scribouilli version: no changes were made since then, so we can assume
  // that the last build was successfull.

  console.log('[getBuildStatus] success: fetch successfull, no last commit comment found')
  return 'success'
}
