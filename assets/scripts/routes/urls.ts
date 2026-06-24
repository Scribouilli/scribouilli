import ScribouilliGitRepo from '../scribouilliGitRepo'

export function makeAtelierListPageURL({
  owner,
  repoName,
}: ScribouilliGitRepo): string {
  return `/atelier-list-pages?account=${owner}&repoName=${repoName}`
}
