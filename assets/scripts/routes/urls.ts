import ScribouilliGitRepo from '../scribouilliGitRepo'

export function makeUrlParam(
  path: string,
  owner: string | undefined,
  repoName: string
): string {
  const url = new URL(path, 'thismessage:/')
  url.searchParams.set('repoName', repoName)
  if (owner) {
    url.searchParams.set('account', owner)
  }
  return url.href.substring('thismessage:'.length)
}

export function makeAtelierListPageURL({
  owner,
  repoName,
}: ScribouilliGitRepo): string {
  return makeUrlParam('/atelier-list-pages', owner, repoName)
}
