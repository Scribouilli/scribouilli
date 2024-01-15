//@ts-check

/**
 * Ce fichier gère les interactions avec git (contenu, commits, branches, remotes, pull/pull, etc.)
 * et aussi le contenu sous-jacent et le filesystem
 * 
 * Normallement, aucun autre fichier ne devrait communiquer avec le fs directement
 * 
 * Ce fichier aspire à être neutre par rapport à Scribouilli (pour pouvoir être utilisé par Comptanar, par exemple)
 * Faire attention à ce qui y est importé 
 * et aux méthodes ajoutées
 */

import FS from '@isomorphic-git/lightning-fs'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/web/index.js'

import './types.js'


const CORS_PROXY_URL = 'https://cors.isomorphic-git.org'

/** @typedef {import('isomorphic-git')} isomorphicGit */
/** @typedef {import('isomorphic-git').GitAuth} GitAuth */

export class GitAgent {
  constructor() {
    this.fs = new FS('scribouilli')
    /** @type {((resolutionOptions: import('./store.js').ResolutionOption[]) => void) | undefined } */
    this.onMergeConflict = undefined
  }

  /**
   *
   * @param {ScribouilliGitRepo} scribouilliGitRepo
   * @returns {ReturnType<isomorphicGit["clone"]>}
   */
  clone({ repoDirectory, remoteURL }) {
    return git.clone({
      fs: this.fs,
      dir: repoDirectory,
      http,
      url: remoteURL,
      // ref is purposefully omitted to get the default behavior (default repo branch)
      singleBranch: true,
      corsProxy: CORS_PROXY_URL,
      depth: 5,
    })
  }

  /**
   *
   * @param {ScribouilliGitRepo} scribouilliGitRepo
   * @returns {ReturnType<isomorphicGit["currentBranch"]>}
   */
  currentBranch(scribouilliGitRepo) {
    return git.currentBranch({
      fs: this.fs,
      dir: scribouilliGitRepo.repoDirectory,
    })
  }

  /**
   *
   * @param {ScribouilliGitRepo} scribouilliGitRepo
   * @param {string} branch
   * @param {boolean} [force]
   * @param {boolean} [checkout]
   * @returns {ReturnType<isomorphicGit["branch"]>}
   */
  branch({ repoDirectory }, branch, force = false, checkout = true) {
    return git.branch({
      fs: this.fs,
      dir: repoDirectory,
      ref: branch,
      force,
      checkout,
    })
  }

  /**
   * @summary helper to create ref strings for remotes
   *
   * @param {string} remote
   * @param {string} ref
   * @returns {string}
   */
  createRemoteRef(remote, ref) {
    return `remotes/${remote}/${ref}`
  }

  /**
   *
   * @param {ScribouilliGitRepo} scribouilliGitRepo
   * @returns {ReturnType<isomorphicGit["listRemotes"]>}
   */
  listRemotes({ repoDirectory }) {
    return git.listRemotes({
      fs: this.fs,
      dir: repoDirectory,
    })
  }

  /**
   *
   * @param {ScribouilliGitRepo} scribouilliGitRepo
   * @param {string} [remote]
   * @returns {ReturnType<isomorphicGit["listBranches"]>}
   */
  listBranches({ repoDirectory }, remote) {
    return git.listBranches({
      fs: this.fs,
      dir: repoDirectory,
      remote,
    })
  }

  /**
   * @summary This version of git push may fail if the remote repo
   * has unmerged changes
   *
   * @param {ScribouilliGitRepo} scribouilliGitRepo
   * @param { GitAuth } auth 
   * @returns {ReturnType<isomorphicGit["push"]>}
   */
  falliblePush({ repoDirectory }, auth) {
    return git.push({
      fs: this.fs,
      http,
      // ref is purposefully omitted to get the default (checked out branch)
      dir: repoDirectory,
      corsProxy: CORS_PROXY_URL,
      // See https://isomorphic-git.org/docs/en/onAuth#oauth2-tokens
      onAuth: _ => auth
    })
  }

  /**
   * @summary This version of git push tries to push
   * then tries to pull if the push fails
   * and tries again to push if the pull succeeded
   *
   * @param {ScribouilliGitRepo} scribouilliGitRepo
   * @param { GitAuth } auth 
   * @returns {Promise<any>}
   */
  safePush(scribouilliGitRepo, auth) {
    console.log('safePush')
    return this.falliblePush(scribouilliGitRepo, auth)
      .catch(err => {
        console.log(
          'failliblePush error ! Assuming the error is that we are not up to date with the remote',
          err,
        )
        return this.fetchAndTryMerging(scribouilliGitRepo, auth).then(() => {
          console.log('pull/merge succeeded, try to push again')
          return this.falliblePush(scribouilliGitRepo, auth)
        })
      })
      .catch(err => {
        console.log(
          'the merge failed or the second push failed, there is nothing much we can try automatocally',
          err,
        )
        return err
      })
  }

  /**
   * @summary like git push --force
   *
   * @param {ScribouilliGitRepo} scribouilliGitRepo
   * @param { GitAuth } auth 
   * @returns {ReturnType<isomorphicGit["push"]>}
   */
  forcePush({ repoDirectory }, auth) {
    return git.push({
      fs: this.fs,
      http,
      // ref is purposefully omitted to get the default (checked out branch)
      dir: repoDirectory,
      force: true,
      corsProxy: CORS_PROXY_URL,
      // See https://isomorphic-git.org/docs/en/onAuth#oauth2-tokens
      onAuth: _ => auth
    })
  }

  /**
   *
   * @param {ScribouilliGitRepo} scribouilliGitRepo
   * @returns {ReturnType<isomorphicGit["fetch"]>}
   */
  async fetch({ repoDirectory }) {
    return git.fetch({
      fs: this.fs,
      http,
      // ref is purposefully omitted to get the default (checked out branch)
      singleBranch: false, // we want all the branches
      dir: repoDirectory,
      corsProxy: CORS_PROXY_URL,
    })
  }

  /**
   *
   * @param {ScribouilliGitRepo} scribouilliGitRepo
   * @param {string} [ref]
   * @returns {Promise<import('isomorphic-git').CommitObject>}
   */
  currentCommit({ repoDirectory }, ref = undefined) {
    return git
      .log({
        fs: this.fs,
        dir: repoDirectory,
        ref,
        depth: 1,
      })
      .then(commits => commits[0].commit)
  }

  /**
   *
   * @param {ScribouilliGitRepo} scribouilliGitRepo
   * @param {string} [ref]
   * @returns {ReturnType<isomorphicGit["checkout"]>}
   */
  checkout({ repoDirectory }, ref = undefined) {
    return git.checkout({
      fs: this.fs,
      dir: repoDirectory,
      ref,
    })
  }

  /**
   *
   * @summary This function tries to merge
   * If it fails, it forwards the conflict to this.onMergeConflict with resolution propositions
   *
   * @param {ScribouilliGitRepo} scribouilliGitRepo
   * @param { GitAuth } auth 
   * @returns {Promise<any>}
   */
  async tryMerging(scribouilliGitRepo, auth) {
    console.log('merge')
    const [currentBranch, remotes] = await Promise.all([
      this.currentBranch(scribouilliGitRepo),
      this.listRemotes(scribouilliGitRepo),
    ])

    if (!currentBranch) {
      throw new TypeError('currentBranch is undefined')
    }

    const localBranch = currentBranch
    const remoteBranch = this.createRemoteRef(remotes[0].remote, localBranch)

    return git
      .merge({
        fs: this.fs,
        dir: scribouilliGitRepo.repoDirectory,
        // ours is purposefully omitted to get the default behavior (current branch)
        // assuming their is only one remote
        // assuming the remote and local branch have the same name
        theirs: remoteBranch,
        fastForward: true,
        abortOnConflict: true,
      })
      .then(() => {
        // this checkout is necessary to update FS files
        return this.checkout(scribouilliGitRepo)
      })
      .catch(err => {
        console.log('merge error', err)

        this.onMergeConflict &&
          this.onMergeConflict([
            {
              message: `Garder la version actuelle du site web en ligne (et perdre les changements récents dans l'atelier)`,
              resolution: async () => {
                const currentBranch = await this.currentBranch(
                  scribouilliGitRepo,
                )
                if (!currentBranch) {
                  throw new TypeError('Missing currentBranch')
                }

                const remotes = await this.listRemotes(scribouilliGitRepo)
                const firstRemote = remotes[0].remote
                const remoteBranches = await this.listBranches(
                  scribouilliGitRepo,
                  firstRemote,
                )
                const targetedRemoteBranch = this.createRemoteRef(
                  firstRemote,
                  remoteBranches[0],
                )

                await this.checkout(scribouilliGitRepo, targetedRemoteBranch)

                await this.branch(scribouilliGitRepo, currentBranch, true, true)
              },
            },
            {
              message: `Garder la version actuelle de l'atelier (et perdre la version en actuellement ligne)`,
              resolution: () => {
                return this.forcePush(scribouilliGitRepo, auth)
              },
            },
          ])
      })
  }

  /**
   * @summary Create a commit with the given message.
   *
   * @param {ScribouilliGitRepo} scribouilliGitRepo
   * @param {string} message
   *
   * @returns {ReturnType<isomorphicGit["commit"]>} sha of the commit
   */
  commit({ repoDirectory }, message) {
    return git.commit({
      fs: this.fs,
      dir: repoDirectory,
      message,
    })
  }

  /**
   * @summary Remove file from git tree and from the file system
   *
   * @param {ScribouilliGitRepo} scribouilliGitRepo
   * @param {string} fileName
   * @returns {ReturnType<isomorphicGit["remove"]>}
   */
  async removeFile(scribouilliGitRepo, fileName) {
    const path = scribouilliGitRepo.path(fileName)
    await this.fs.promises.unlink(path)
    return await git.remove({
      fs: this.fs,
      dir: scribouilliGitRepo.repoDirectory,
      filepath: fileName,
    })
  }

  /**
   * @summary like a git pull but the merge is better customized
   *
   * @param {ScribouilliGitRepo} scribouilliGitRepo
   * @param { GitAuth } auth 
   * @returns {Promise<any>}
   */
  async fetchAndTryMerging(scribouilliGitRepo, auth) {
    console.log('fetchAndTryMerging')
    await this.fetch(scribouilliGitRepo)
    await this.tryMerging(scribouilliGitRepo, auth)
  }

  /**
   *
   * @param {ScribouilliGitRepo} scribouilliGitRepo
   * @param { GitAuth } auth 
   * @return {Promise<any>}
   */
  async pullOrCloneRepo(scribouilliGitRepo, auth) {
    const { repoDirectory } = scribouilliGitRepo

    let dirExists = true
    try {
      const stat = await this.fs.promises.stat(repoDirectory)
      dirExists = stat.isDirectory()
    } catch {
      dirExists = false
    }

    if (dirExists) {
      return this.fetchAndTryMerging(scribouilliGitRepo, auth)
    } else {
      return this.clone(scribouilliGitRepo)
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
   * @param {ScribouilliGitRepo} scribouilliGitRepo
   * @param {string} login
   * @param {string} email
   * @returns {Promise<ReturnType<isomorphicGit["setConfig"]>>}
   */
  async setAuthor(scribouilliGitRepo, login, email) {
    if (!login || !email) {
      return
    }

    const { repoDirectory } = scribouilliGitRepo

    await git.setConfig({
      fs: this.fs,
      dir: repoDirectory,
      path: 'user.name',
      value: login,
    })
    return await git.setConfig({
      fs: this.fs,
      dir: repoDirectory,
      path: 'user.email',
      value: email,
    })
  }

  /**
   * @summary Get file informations
   *
   * @param {ScribouilliGitRepo} scribouilliGitRepo
   * @param {string} fileName
   * @returns {Promise<string>}
   */
  async getFile(scribouilliGitRepo, fileName) {
    const content = await this.fs.promises.readFile(
      scribouilliGitRepo.path(fileName),
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
   * @param {ScribouilliGitRepo} scribouilliGitRepo
   * @param {string | Uint8Array} content
   * @param {string} fileName
   *
   * @returns {Promise<void>}
   */
  async writeFile(scribouilliGitRepo, fileName, content) {
    // This condition is here just in case, but it should not happen in practice
    // Having an empty file name will not lead immediately to a crash but will result in
    // some bugs later, see https://github.com/Scribouilli/scribouilli/issues/49#issuecomment-1648226372
    if (fileName === '') {
      throw new TypeError('Empty file name')
    }

    await this.fs.promises.writeFile(scribouilliGitRepo.path(fileName), content)
    await git.add({
      fs: this.fs,
      filepath: fileName,
      dir: scribouilliGitRepo.repoDirectory,
    })
  }

  /**
   *
   * @param {ScribouilliGitRepo} scribouilliGitRepo
   * @param {string} dir
   * @returns
   */
  listFiles(scribouilliGitRepo, dir) {
    return this.fs.promises.readdir(scribouilliGitRepo.path(dir))
  }

  /**
   *
   * @param {ScribouilliGitRepo} scribouilliGitRepo
   * @param {string} filename
   * @returns
   */
  async checkFileExistence(scribouilliGitRepo, filename) {
    const stat = await this.fs.promises.stat(scribouilliGitRepo.path(filename))
    return stat.isFile()
  }
}

/** @type {GitAgent} */
const gitAgent = new GitAgent()

export default gitAgent
