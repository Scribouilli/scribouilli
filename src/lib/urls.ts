import { resolve } from '$app/paths'
import type ScribouilliGitRepo from './atelier/repo.svelte'

export async function goto(href: string) {
  // NOTE: Ici on retourne une Promise qui se termine pas
  // vu qu’on peut pas attendre la fin du chargement de la page
  // et qu’on veut que goto finisse quand la navigation a terminé.
  // Ça permet de pouvoir `await goto(…)` et que l’état visuel ne
  // change pas pendant le temps du chargement de la page.
  const neverEndingPromise = new Promise(() => {})
  window.location.href = href
  return neverEndingPromise
}

export function makeUrlParam(path: string, owner: string | undefined, repoPath: string): string {
  const url = new URL(path, 'thismessage:/')
  url.searchParams.set('repoPath', repoPath)
  if (owner) {
    url.searchParams.set('account', owner)
  }
  return url.href.substring('thismessage:'.length)
}

export function makeAtelierListPageURL({
  owner,
  repoPath,
}: Pick<ScribouilliGitRepo, 'owner' | 'repoPath'>): string {
  return makeUrlParam(resolve('/atelier/(site)/pages'), owner, repoPath)
}

export function makeAtelierListArticlesURL({
  owner,
  repoPath,
}: Pick<ScribouilliGitRepo, 'owner' | 'repoPath'>): string {
  return makeUrlParam(resolve('/atelier/(site)/articles'), owner, repoPath)
}
