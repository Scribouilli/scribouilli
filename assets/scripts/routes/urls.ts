import ScribouilliGitRepo from '../scribouilliGitRepo'

export function makeAtelierListPageURL({
  owner,
  repoPath,
}: ScribouilliGitRepo): string {
  return `/atelier-list-pages?account=${owner}&repoPath=${repoPath}`
}
