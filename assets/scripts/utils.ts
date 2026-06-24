import page from 'page'
import { format } from 'date-fns'

import store from './store.js'
import { CommitObject } from 'isomorphic-git'

/**
 * @summary Handle errors catched by Promises
 */
export const handleErrors = (errorMessage: string) => {
  switch (errorMessage) {
    case 'INVALIDATE_TOKEN': {
      store.mutations.logout()
      console.info('[invalid token] redirecting to /')
      page('/')

      break
    }
    case 'REPOSITORY_NOT_FOUND': {
      console.info(
        '[REPOSITORY_NOT_FOUND] redirecting to /selectionner-un-site',
      )
      page('/selectionner-un-site')

      break
    }
    case 'NOT_FOUND':
      const message = `gitAgent call failed: ${errorMessage}`
      logMessage(message, 'handleErrors')

      break

    default:
      logMessage(errorMessage, 'handleErrors')
      throw errorMessage
  }
}

function makeFilenameCompatibleString(string: string): string {
  return string
    .replace(/\/|#|\?|:|&|\(|\)|\+/g, '-') // replace url confusing characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent because GH pages triggers file download
    .split('.')
    .join('') // Remove dot to avoid issues
    .toLowerCase()
}

export function makeFileNameFromTitle(title: string): string {
  return makeFilenameCompatibleString(title) + '.md'
}

export function makeArticleFileName(title: string, date: Date): string {
  return `_posts/${format(date, 'yyyy-MM-dd')}-${makeFilenameCompatibleString(
    title,
  )}.md`
}

export function makePageFrontMatter(
  title: string,
  index: number | null = 1,
  inMenu: boolean = true,
  blogIndex?: boolean,
): string {
  return [
    '---',
    'title: ' + '"' + title.replace(/"/g, '\\"') + '"',
    'order: ' + index,
    'in_menu: ' + inMenu,
  ]
    .concat(blogIndex ? ['blog_index: true'] : [])
    .concat(['---'])
    .join('\n')
}

export function makeArticleFrontMatter(title: string): string {
  return [
    '---',
    'title: ' + '"' + title.replace(/"/g, '\\"') + '"',
    '---',
  ].join('\n')
}

export const logMessage = (
  errorMessage: string,
  caller: string = 'unknown',
  level: 'log' | 'warn' | 'error' = 'log',
) => {
  console[level](`[${level}] [caller: ${caller}] ${errorMessage}`)
}

export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms))

export const isItStillCompiling = (lastCommit: CommitObject): boolean => {
  // Delay (in seconds) after which a non-updated website is assumed to have failed to build.
  const ERROR_DELAY = 60 * 1000
  const currentTime = new Date().getTime() / 1000
  const deltaTime = currentTime - lastCommit.committer.timestamp
  return deltaTime <= ERROR_DELAY
}
