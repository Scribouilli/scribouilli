//@ts-check

import page from 'page'
import { format } from 'date-fns'

import databaseAPI from './databaseAPI.js'
import store from './store.js'

/**
 * @summary Check the availability of a repository and redirect to project creation
 *          if it does not exist.
 * @param {string} owner
 * @param {string} repoName
 * @param {*} thenCallback The callback you'll want to execute if the repository is available
 * @returns
 */
export function checkRepositoryAvailabilityThen(owner, repoName, thenCallback) {
  return databaseAPI
    .getRepository(owner, repoName)
    .then(thenCallback)
    .catch(msg => handleErrors(msg))
}

/**
 * @summary Handle errors catched by Promises
 * @param {string} errorMessage
 */
export const handleErrors = errorMessage => {
  switch (errorMessage) {
    case 'INVALIDATE_TOKEN': {
      store.mutations.invalidateToken()
      console.info('[invalid token] redirecting to /account')
      page('/account')

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
      const message = `databaseAPI call failed: ${errorMessage}`
      logMessage(message, 'handleErrors')

      break

    default:
      logMessage(errorMessage, 'handleErrors')
      throw errorMessage
  }
}

/**
 *
 * @param {string} string
 * @returns {string}
 */
function makeFilenameCompatibleString(string) {
  return string
    .replace(/\/|#|\?|:/g, '-') // replace url confusing characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent because GH pages triggers file download
    .split('.')
    .join('') // Remove dot to avoid issues
    .toLowerCase()
}

/**
 *
 * @param {string} title
 * @returns {string}
 */
export function makeFileNameFromTitle(title) {
  return makeFilenameCompatibleString(title) + '.md'
}

/**
 *
 * @param {string} title
 * @param {Date} date
 * @returns {string}
 */
export function makeArticleFileName(title, date) {
  return `_posts/${format(date, 'yyyy-MM-dd')}-${makeFilenameCompatibleString(
    title,
  )}.md`
}

/**
 * 
 * @param {string} title 
 * @param {number?} index 
 * @param {boolean} hideMenu 
 * @returns {string}
 */
export function makePageFrontMatter(
  title,
  index = 1,
  hideMenu = false,
) {
    return [
      '---',
      'title: ' + '"' + title.replace(/"/g, '\\"') + '"',
      'order: ' + index,
      'hide_menu: ' + hideMenu,
      '---',
    ].join('\n')
}

/**
 * 
 * @param {string} title 
 * @returns {string}
 */
export function makeArticleFrontMatter(title){
  return [
    '---',
    'title: ' + '"' + title.replace(/"/g, '\\"') + '"',
    '---',
  ].join('\n')
}

export const logMessage = (errorMessage, caller = 'unknown', level = 'log') => {
  console[level](`[${level}] [caller: ${caller}] ${errorMessage}`)
}

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
