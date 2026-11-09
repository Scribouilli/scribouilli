import { resolve } from '$app/paths'
import type ScribouilliGitRepo from './git/repo'

export function makeUrlParam(path: string, owner: string | undefined, repoPath: string): string {
  const url = new URL(path, 'thismessage:/')
  url.searchParams.set('repoPath', repoPath)
  if (owner) {
    url.searchParams.set('account', owner)
  }
  return url.href.substring('thismessage:'.length)
}

export function makeAtelierListPageURL({ owner, repoPath }: ScribouilliGitRepo): string {
  return makeUrlParam(resolve('/atelier/pages'), owner, repoPath)
}

export function makeAtelierListArticlesURL({ owner, repoPath }: ScribouilliGitRepo): string {
  return makeUrlParam(resolve('/atelier/articles'), owner, repoPath)
}
