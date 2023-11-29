//@ts-check

import lireFrontMatter from 'front-matter'
import FS from '@isomorphic-git/lightning-fs'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/web/index.js'
import { getOAuthServiceAPI } from './oauth-services-api/index.js'

import './types.js'

const CORS_PROXY_URL = 'https://cors.isomorphic-git.org'

class GitAgent {
  constructor() {
    /** @type {string | undefined} */
    this.commitsEtag = undefined
    this.latestCommit = undefined
    this.getFilesCache = new Map()
    this.fileCached = undefined
    this.customCSSPath = 'assets/css/custom.css'
    this.defaultRepoOwner = 'Scribouilli'
    this.defaultThemeRepoName = 'site-template'
    this.fs = new FS('scribouilli')
  }

  /**
   *
   * @param {string} login
   * @param {string} repoName
   * @returns {string}
   */
  repoDir(login, repoName) {
    if (typeof login !== 'string') {
      throw new Error(
        `login is not a string (${typeof login} - ${
          Object(login) === login ? login[Symbol.toStringTag] : ''
        })`,
      )
    }

    return `/github.com/${login}/${repoName}`
  }

  /**
   *
   * @param {string} login
   * @param {string} repoName
   * @param {string} fileName
   * @returns {string}
   */
  path(login, repoName, fileName) {
    return `/github.com/${login}/${repoName}/${fileName}`
  }

  /**
   *
   * @param {string} gitURL
   * @param {string} repoDir
   * @returns {Promise<void>}
   */
  clone(gitURL, repoDir) {
    return git.clone({
      fs: this.fs,
      dir: repoDir,
      http,
      url: gitURL,
      // ref is purposefully omitted to get the default behavior (default repo branch)
      singleBranch: true,
      corsProxy: CORS_PROXY_URL,
      depth: 5,
    })
  }

  /**
   *
   * @param {string} login
   * @param {string} repoName
   * @return {Promise<any>}
   */
  push(login, repoName) {
    return git.push({
      fs: this.fs,
      http,
      // ref is purposefully omitted to get the default (checked out branch)
      dir: this.repoDir(login, repoName),
      corsProxy: CORS_PROXY_URL,
      onAuth: _ => {
        // See https://isomorphic-git.org/docs/en/onAuth#oauth2-tokens
        return {
          username: getOAuthServiceAPI().getAccessToken(),
          password: 'x-oauth-basic',
        }
      },
    })
  }

  /**
   *
   * @param {string} repoDir
   * @return {Promise<any>}
   */
  pull(repoDir) {
    return git.pull({
      fs: this.fs,
      http,
      // ref is purposefully omitted to get the default (checked out branch)
      dir: repoDir,
      corsProxy: CORS_PROXY_URL,
    })
  }

  /**
   * @summary Create a commit with the given message.
   *
   * @param {string} login
   * @param {string} repoName
   * @param {string} message
   *
   * @returns {Promise<string>} sha of the commit
   */
  commit(login, repoName, message) {
    return git.commit({
      fs: this.fs,
      dir: this.repoDir(login, repoName),
      message,
    })
  }

  /**
   * @summary Remove file from git tree and from the file system
   *
   * @param {string} login
   * @param {string} repoName
   * @param {string} fileName
   * @returns {Promise<void>}
   */
  async removeFile(login, repoName, fileName) {
    await this.pullOrCloneRepo(login, repoName)

    const path = this.path(login, repoName, fileName)
    await this.fs.promises.unlink(path)
    await git.remove({
      fs: this.fs,
      dir: this.repoDir(login, repoName),
      filepath: fileName,
    })
  }

  /**
   *
   * @param {string} login
   * @param {string} repoName
   *
   * @returns {Promise<void>}
   */
  deleteRepository(login, repoName) {
    return this.fs.promises.unlink(this.repoDir(login, repoName))
  }

  /**
   *
   * @param {string} login
   * @param {string} repoName
   * @return {Promise<any>}
   */
  async pullOrCloneRepo(login, repoName) {
    const repoDir = this.repoDir(login, repoName)
    const gitURL = `https://github.com/${login}/${repoName}.git`

    let dirExists = true
    try {
      const stat = await this.fs.promises.stat(repoDir)
      dirExists = stat.isDirectory()
    } catch {
      dirExists = false
    }

    if (dirExists) {
      return this.pull(repoDir)
    } else {
      return this.clone(gitURL, repoDir)
    }
  }

  /**
   * Assigne l'auteur et l'email pour les commits git
   *
   * On voudrait le faire en global, mais ça n'est pas possible actuellement avec isomorphic-git (1.24.2)
   * > Currently only the local $GIT_DIR/config file can be read or written. However support for the global ~/.gitconfig and system $(prefix)/etc/gitconfig will be added in the future.
   * Voir https://github.com/isomorphic-git/isomorphic-git/pull/1779
   *
   *
   * https://isomorphic-git.org/docs/en/setConfig
   *
   * Alors, on doit passer le repoName
   *
   * @param {string} login
   * @param {string} owner
   * @param {string} repoName
   * @param {string} email
   * @returns {Promise<void>}
   */
  async setAuthor(login, owner, repoName, email) {
    if (!login || !owner || !repoName || !email) {
      return
    }

    const repoDir = this.repoDir(owner, repoName)

    await git.setConfig({
      fs: this.fs,
      dir: repoDir,
      path: 'user.name',
      value: login,
    })
    await git.setConfig({
      fs: this.fs,
      dir: repoDir,
      path: 'user.email',
      value: email,
    })
  }

  /**
   * @summary Get file informations
   * @param {string} login
   * @param {string} repoName
   * @param {string} fileName
   * @returns {Promise<string>}
   */
  async getFile(login, repoName, fileName) {
    await this.pullOrCloneRepo(login, repoName)
    const content = await this.fs.promises.readFile(
      this.path(login, repoName, fileName),
      { encoding: 'utf8' },
    )
    if (content instanceof Uint8Array) {
      return content.toString()
    }
    return content
  }

  /**
   * @summary Create or update a file and add it to the git staging area
   *
   * @param {string} login
   * @param {string} repoName
   * @param {string | Uint8Array} content
   * @param {string} fileName
   *
   * @returns {Promise<void>}
   */
  async writeFile(login, repoName, fileName, content) {
    await this.pullOrCloneRepo(login, repoName)

    // This condition is here just in case, but it should not happen in practice
    // Having an empty file name will not lead immediately to a crash but will result in
    // some bugs later, see https://github.com/Scribouilli/scribouilli/issues/49#issuecomment-1648226372
    if (fileName === '') {
      throw new TypeError('Empty file name')
    }

    await this.fs.promises.writeFile(
      this.path(login, repoName, fileName),
      content,
    )
    await git.add({
      fs: this.fs,
      filepath: fileName,
      dir: this.repoDir(login, repoName),
    })
  }

  /**
   *
   * @param {string} login
   * @param {string} repoName
   * @param {string} content
   * @returns
   */
  async writeCustomCSS(login, repoName, content) {
    await this.writeFile(login, repoName, this.customCSSPath, content)

    return await this.commit(
      login,
      repoName,
      'mise à jour du ficher de styles custom',
    )
  }

  /**
   *
   * @param {string} login
   * @param {string} repoName
   * @param {string} dir
   * @returns
   */
  async getPagesList(login, repoName, dir = '') {
    await this.pullOrCloneRepo(login, repoName)

    const allFiles = await this.fs.promises.readdir(
      this.path(login, repoName, dir),
    )
    return Promise.all(
      allFiles
        .filter(f => f.endsWith('.md') || f.endsWith('.html'))
        .map(async f => {
          const path = dir == '' ? f : `${dir}/${f}`
          const content = await this.fs.promises.readFile(
            this.path(login, repoName, path),
          )
          const { attributes: data, body: markdownContent } = lireFrontMatter(
            content.toString(),
          )
          return {
            title: data?.title,
            index: data?.order,
            // no `in_menu` proprerty is interpreted as the page should be in the menu
            inMenu: data?.in_menu === true || data?.in_menu === undefined,
            path,
            content: markdownContent,
          }
        }),
    )
  }

  /**
   *
   * @param {string} login
   * @param {string} repoName
   * @returns
   */
  async getArticlesList(login, repoName) {
    try {
      return await this.getPagesList(login, repoName, '_posts')
    } catch {
      return await Promise.resolve(undefined)
    }
  }

  /**
   * Non-utilisée et sûrement fausse pour le moment
   *
   * @param {string} login
   * @param {string} repoName
   * @returns
   */
  /*getLastDeployment(login, repoName) {
    return this.callGithubAPI(
      `https://api.github.com/repos/${login}/${repoName}/deployments?per_page=1`,
    )
    .then(deployments => deployments[0])
  }*/

  /**
   *
   * @param {string} login
   * @param {string} repoName
   * @param {string} path
   * @returns
   */
  async checkFileExistence(login, repoName, path) {
    await this.pullOrCloneRepo(login, repoName)
    const stat = await this.fs.promises.stat(this.path(login, repoName, path))
    return stat.isFile()
  }
}

/** @type {GitAgent} */
const gitAgent = new GitAgent()

export default gitAgent
