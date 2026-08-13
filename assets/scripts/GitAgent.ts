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
import http from 'isomorphic-git/http/web'

const DEFAULT_CORS_PROXY_URL = 'https://cors.isomorphic-git.org'

import type { CommitObject, GitAuth } from 'isomorphic-git'
import type { ResolutionOption } from './store.ts'

export default class GitAgent {
  #fs
  #remoteURL
  #repoId
  #corsProxyURL
  #onAuth
  #onMergeConflict

  // computed
  #origin
  #hostname
  #repoDirectory

  constructor({
    repoId,
    remoteURL,
    corsProxyURL = DEFAULT_CORS_PROXY_URL,
    auth,
    onMergeConflict,
  }: {
    repoId: string
    remoteURL: string
    corsProxyURL?: string
    auth: GitAuth
    onMergeConflict?:
      | ((resolutionOptions: ResolutionOption[]) => void)
      | undefined
  }) {
    this.#fs = new FS('scribouilli')

    this.#repoId = repoId
    this.#remoteURL = remoteURL
    this.#onAuth = () => auth
    this.#onMergeConflict = onMergeConflict
    this.#corsProxyURL = corsProxyURL

    // computed
    this.#origin = new URL(this.#remoteURL).origin
    this.#hostname = new URL(this.#origin).hostname
    // filesystem directory
    this.#repoDirectory = `/${this.#hostname}/${this.#repoId}`
  }

  #path(filename: string): string {
    return `${this.#repoDirectory}/${filename}`
  }

  /**
   * @summary helper to create ref strings for remotes
   */
  #createRemoteRef(remote: string, ref: string): string {
    return `remotes/${remote}/${ref}`
  }

  clone(): ReturnType<typeof git.clone> {
    console.info('clone', this.#remoteURL)
    return git.clone({
      fs: this.#fs,
      dir: this.#repoDirectory,
      http,
      url: this.#remoteURL,
      // ref is purposefully omitted to get the default behavior (default repo branch)
      singleBranch: true,
      corsProxy: this.#corsProxyURL,
      depth: 5,
    })
  }

  currentBranch(): ReturnType<typeof git.currentBranch> {
    return git.currentBranch({
      fs: this.#fs,
      dir: this.#repoDirectory,
    })
  }

  branch(
    branch: string,
    force: boolean = false,
    checkout: boolean = true,
  ): ReturnType<typeof git.branch> {
    return git.branch({
      fs: this.#fs,
      dir: this.#repoDirectory,
      ref: branch,
      force,
      checkout,
    })
  }

  listRemotes(): ReturnType<typeof git.listRemotes> {
    return git.listRemotes({
      fs: this.#fs,
      dir: this.#repoDirectory,
    })
  }

  listBranches(remote: string): ReturnType<typeof git.listBranches> {
    return git.listBranches({
      fs: this.#fs,
      dir: this.#repoDirectory,
      remote,
    })
  }

  /**
   * @summary This version of git push may fail if the remote repo
   * has unmerged changes
   */
  falliblePush(): ReturnType<typeof git.push> {
    console.info('falliblePush')
    return git.push({
      fs: this.#fs,
      http,
      // ref is purposefully omitted to get the default (checked out branch)
      dir: this.#repoDirectory,
      corsProxy: this.#corsProxyURL,
      // See https://isomorphic-git.org/docs/en/onAuth#oauth2-tokens
      onAuth: this.#onAuth,
    })
  }

  /**
   * @summary This version of git push tries to push
   * then tries to pull if the push fails
   * and tries again to push if the pull succeeded
   */
  safePush(): Promise<any> {
    console.info('safePush')
    return this.falliblePush()
      .catch(err => {
        console.log(
          'failliblePush error ! Assuming the error is that we are not up to date with the remote',
          err,
        )
        return this.fetchAndTryMerging().then(() => {
          console.log('pull/merge succeeded, try to push again')
          return this.falliblePush()
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
   */
  forcePush(): ReturnType<typeof git.push> {
    console.info('forcePush')
    return git.push({
      fs: this.#fs,
      http,
      // ref is purposefully omitted to get the default (checked out branch)
      dir: this.#repoDirectory,
      force: true,
      corsProxy: this.#corsProxyURL,
      // See https://isomorphic-git.org/docs/en/onAuth#oauth2-tokens
      onAuth: this.#onAuth,
    })
  }

  async fetch(): ReturnType<typeof git.fetch> {
    return git.fetch({
      fs: this.#fs,
      http,
      // ref is purposefully omitted to get the default (checked out branch)
      singleBranch: false, // we want all the branches
      dir: this.#repoDirectory,
      corsProxy: this.#corsProxyURL,
    })
  }

  currentCommit(
    ref: string | undefined = undefined,
  ): Promise<CommitObject & { oid: string }> {
    return git
      .log({
        fs: this.#fs,
        dir: this.#repoDirectory,
        ref,
        depth: 1,
      })
      .then(commits => ({ oid: commits[0].oid, ...commits[0].commit }))
  }

  checkout(
    ref: string | undefined = undefined,
  ): ReturnType<typeof git.checkout> {
    return git.checkout({
      fs: this.#fs,
      dir: this.#repoDirectory,
      ref,
    })
  }

  /**
   * @summary This function tries to merge
   * If it fails, it forwards the conflict to this.onMergeConflict with resolution propositions
   */
  async tryMerging(): Promise<any> {
    console.info('tryMerging')
    const [currentBranch, remotes] = await Promise.all([
      this.currentBranch(),
      this.listRemotes(),
    ])

    if (!currentBranch) {
      throw new TypeError('currentBranch is undefined')
    }

    const localBranch = currentBranch
    const remoteBranch = this.#createRemoteRef(remotes[0].remote, localBranch)

    return git
      .merge({
        fs: this.#fs,
        dir: this.#repoDirectory,
        // ours is purposefully omitted to get the default behavior (current branch)
        // assuming their is only one remote
        // assuming the remote and local branch have the same name
        theirs: remoteBranch,
        fastForward: true,
        abortOnConflict: true,
      })
      .then(() => {
        // this checkout is necessary to update FS files
        return this.checkout()
      })
      .catch(err => {
        console.log('merge error', err)

        this.#onMergeConflict &&
          this.#onMergeConflict([
            {
              message: `Garder le contenu de l'atelier`,
              resolution: () => {
                return this.forcePush()
              },
            },
            {
              message: `Garder le contenu du site web`,
              resolution: async () => {
                const currentBranch = await this.currentBranch()
                if (!currentBranch) {
                  throw new TypeError('Missing currentBranch')
                }

                const remotes = await this.listRemotes()
                const firstRemote = remotes[0].remote
                const remoteBranches = await this.listBranches(firstRemote)
                const targetedRemoteBranch = this.#createRemoteRef(
                  firstRemote,
                  remoteBranches[0],
                )

                await this.checkout(targetedRemoteBranch)

                await this.branch(currentBranch, true, true)
              },
            },
          ])
      })
  }

  /**
   * @summary Create a commit with the given message.
   */
  commit(message: string): ReturnType<typeof git.commit> {
    return git.commit({
      fs: this.#fs,
      dir: this.#repoDirectory,
      message,
    })
  }

  /**
   * @summary Remove file from git tree and from the file system
   */
  async removeFile(fileName: string): ReturnType<typeof git.remove> {
    const path = this.#path(fileName)
    await this.#fs.promises.unlink(path)
    return await git.remove({
      fs: this.#fs,
      dir: this.#repoDirectory,
      filepath: fileName,
    })
  }

  /**
   * @summary like a git pull but the merge is better customized
   */
  async fetchAndTryMerging(): Promise<any> {
    await this.fetch()
    await this.tryMerging()
  }

  async pullOrCloneRepo(): Promise<any> {
    let dirExists = true
    try {
      const stat = await this.#fs.promises.stat(this.#repoDirectory)
      dirExists = stat.isDirectory()
    } catch {
      dirExists = false
    }

    if (dirExists) {
      return this.fetchAndTryMerging()
    } else {
      return this.clone()
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
   */
  async setAuthor(
    login: string,
    email: string,
  ): Promise<ReturnType<typeof git.setConfig>> {
    if (!login || !email) {
      return
    }

    await git.setConfig({
      fs: this.#fs,
      dir: this.#repoDirectory,
      path: 'user.name',
      value: login,
    })
    return await git.setConfig({
      fs: this.#fs,
      dir: this.#repoDirectory,
      path: 'user.email',
      value: email,
    })
  }

  /**
   * @summary Get file informations
   */
  async getFile(fileName: string): Promise<string> {
    const content = await this.#fs.promises.readFile(this.#path(fileName), {
      encoding: 'utf8',
    })
    if (content instanceof Uint8Array) {
      return content.toString()
    }
    return content
  }

  /**
   * @summary Create or update a file and add it to the git staging area
   */
  async writeFile(
    fileName: string,
    content: string | Uint8Array,
  ): Promise<void> {
    // This condition is here just in case, but it should not happen in practice
    // Having an empty file name will not lead immediately to a crash but will result in
    // some bugs later, see https://github.com/Scribouilli/scribouilli/issues/49#issuecomment-1648226372
    if (fileName === '') {
      throw new TypeError('Empty file name')
    }

    await this.#fs.promises.writeFile(this.#path(fileName), content)
    await git.add({
      fs: this.#fs,
      filepath: fileName,
      dir: this.#repoDirectory,
    })
  }

  listFiles(dir: string) {
    return this.#fs.promises.readdir(this.#path(dir))
  }

  async checkFileExistence(filename: string) {
    const stat = await this.#fs.promises.stat(this.#path(filename))
    return stat.isFile()
  }
}
