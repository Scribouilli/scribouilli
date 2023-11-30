//@ts-check

import lireFrontMatter from 'front-matter'
import FS from '@isomorphic-git/lightning-fs'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/web/index.js'
import { getOAuthServiceAPI } from './oauth-services-api/index.js'

import './types.js'

const CORS_PROXY_URL = 'https://cors.isomorphic-git.org'

/** @typedef {import('isomorphic-git')} isomorphicGit */

/** @typedef { {message: string, resolution: (...args: any[]) => Promise<void>} } ResolutionOption */

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
    /** @type {((resolutionOptions: ResolutionOption[]) => void) | undefined } */
    this.onMergeConflict = undefined
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
   * @param {string} repoDir
   * @returns {ReturnType<isomorphicGit["currentBranch"]>}
   */
  currentBranch(repoDir) {
    return git.currentBranch({
      fs: this.fs,
      dir: repoDir,
    })
  }

  /**
   *
   * @param {string} repoDir
   *
   * @returns {Promise<{remote: string, url: string}[]>}
   */
  listRemotes(repoDir) {
    return git.listRemotes({
      fs: this.fs,
      dir: repoDir,
    })
  }

  /**
   *
   * @param {string} repoDir
   * @param {string} [remote]
   *
   * @returns {Promise<string[]>}
   */
  listBranches(repoDir, remote) {
    return git.listBranches({
      fs: this.fs,
      dir: repoDir,
      remote,
    })
  }

  /**
   * @summary This version of git push may fail if the remote repo
   * has unmerged changes
   *
   * @param {string} repoDir
   * @returns {ReturnType<isomorphicGit["push"]>}
   */
  falliblePush(repoDir) {
    return git.push({
      fs: this.fs,
      http,
      // ref is purposefully omitted to get the default (checked out branch)
      dir: repoDir,
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
   * @summary This version of git push tries to push
   * then tries to pull if the push fails
   * and tries again to push if the pull succeeded
   *
   * @param {string} repoDir
   * @returns {Promise<any>}
   */
  safePush(repoDir) {
    console.log('safePush')
    return this.falliblePush(repoDir)
      .catch(err => {
        console.log(
          'failliblePush error ! Assuming the error is that we are not up to date with the remote',
        )
        return this.fetchAndTryMerging(repoDir).then(() => {
          console.log('pull/merge succeeded, try to push again')
          return this.falliblePush(repoDir)
        })
      })
      .catch(err => {
        console.log(
          'the merge failed or the second push failed, there is nothing much we can try automatocally',
        )
        return err
      })
  }

  /**
   *
   * @param {string} repoDir
   * @returns {ReturnType<isomorphicGit["fetch"]>}
   */
  async fetch(repoDir) {
    console.log('fetch')
    const remotes = await this.listRemotes(repoDir)
    console.log('remotes', remotes)
    const branches = await Promise.all(
      [undefined, ...remotes].map(r =>
        this.listBranches(repoDir, r && r.remote),
      ),
    )
    console.log('branches', branches)

    return git.fetch({
      fs: this.fs,
      http,
      // ref is purposefully omitted to get the default (checked out branch)
      singleBranch: false, // we want all the branches
      dir: repoDir,
      corsProxy: CORS_PROXY_URL,
    })
  }

  /**
   *
   * @summary This function tries to merge
   * If it fails, it forwards the conflict to this.onMergeConflict with resolution propositions
   *
   * @param {string} repoDir
   * @returns {Promise<any>}
   */
  async tryMerging(repoDir) {
    console.log('merge')
    const [currentBranch, remotes] = await Promise.all([
      this.currentBranch(repoDir),
      this.listRemotes(repoDir),
    ])

    const localBranch = currentBranch
    const remoteBranch = `remotes/${remotes[0].remote}/${localBranch}`

    return git
      .merge({
        fs: this.fs,
        dir: repoDir,
        // ours is purposefully omitted to get the default behavior (current branch)
        // assuming their is only one remote
        // assuming the remote and local branch have the same name
        theirs: remoteBranch,
        fastForward: true,
        abortOnConflict: true,
      })
      .then(() => {
        return git.checkout({
          fs: this.fs,
          dir: repoDir,
        })
      })
      .catch(err => {
        console.log('merge error', err)

        this.onMergeConflict &&
          this.onMergeConflict([
            {
              message: `Garder la version actuelle du site web en ligne (et perdre les changements récents dans l'atelier)`,
              resolution: () => {
                // PPP git branch -f
                return Promise.reject('PPP git branch -f')
              },
            },
            {
              message: `Garder la version actuelle de l'atelier (et perdre la version en actuellement ligne)`,
              resolution: () => {
                // PPP git push -f
                return Promise.reject('PPP git push -f')
              },
            },
          ])
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
   * @summary like a git pull but the merge is better customized
   *
   * @param {string} repoDir
   * @returns {Promise<any>}
   */
  async fetchAndTryMerging(repoDir) {
    console.log('fetchAndTryMerging')
    await this.fetch(repoDir)
    await this.tryMerging(repoDir)
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
      return this.fetchAndTryMerging(repoDir)
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
   * PPP move to actions
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
    const stat = await this.fs.promises.stat(this.path(login, repoName, path))
    return stat.isFile()
  }
}

/** @type {GitAgent} */
const gitAgent = new GitAgent()

export default gitAgent
