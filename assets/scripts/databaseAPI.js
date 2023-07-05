//@ts-check

import lireFrontMatter from 'front-matter'
import FS from '@isomorphic-git/lightning-fs'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/web'

import store from "./store.js";

const CORS_PROXY_URL = 'https://cors.isomorphic-git.org'

class DatabaseAPI {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.commitsEtag = undefined;
    this.latestCommit = undefined;
    this.getFilesCache = new Map();
    this.fileCached = undefined;
    this.customCSSPath = "assets/css/custom.css";
    this.defaultRepoOwner = "Scribouilli"
    this.defaultThemeRepoName = "site-template"
    this.fs = new FS('scribouilli')
  }

  getAuthenticatedUser() {
    return this.callGithubAPI("https://api.github.com/user").then(
      (response) => {
        return response.json();
      }
    );
  }

  getUserEmails() {
    return this.callGithubAPI('https://api.github.com/user/emails').then(r => r.json())
  }

  getRepository(login, repoName) {
    return this.callGithubAPI(
      `https://api.github.com/repos/${login}/${repoName}`
    )
      .then((response) => {
        return response.json();
      })
      .catch((msg) => {
        if (msg === "NOT_FOUND") {
          throw "REPOSITORY_NOT_FOUND";
        }

        throw msg;
      });
  }

  getCurrentUserRepositories() {
    return this.callGithubAPI(
      `https://api.github.com/user/repos?sort=updated&affiliation=owner&visibility=public`
    ).then((response) => {
      return response.json();
    });
  }

  createDefaultRepository(login, newRepoName) {
    return this.callGithubAPI(
      `https://api.github.com/repos/${this.defaultRepoOwner}/${this.defaultThemeRepoName}/generate`,
      {
        headers: {
          Authorization: "token " + this.accessToken,
          Accept: "application/vnd.github+json",
        },
        method: "POST",
        body: JSON.stringify({
          owner: login,
          name: newRepoName,
          description: "Mon site Scribouilli",
        }),
      }
    )
  }

  createRepoGithubPages(account, repoName) {
    return this.callGithubAPI(
      `https://api.github.com/repos/${account}/${repoName}/pages`,
      {
        headers: {
          Authorization: "token " + this.accessToken,
          Accept: "applicatikn/vnd.github+json",
        },
        method: "POST",
        body: JSON.stringify({ source: { branch: 'main' } })
      }
    )
  }

  repoDir(login, repoName) {
    return `/github.com/${login}/${repoName}`
  }

  path(login, repoName, fileName) {
    return `/github.com/${login}/${repoName}/${fileName}`
  }

  async cloneIfNeeded(login, repoName) {
    const repoDir = this.repoDir(login, repoName)
    let dirExists = true
    try {
      const stat = await this.fs.promises.stat(repoDir)
      dirExists = stat.isDirectory()
    } catch {
      dirExists = false
    }

    if (!dirExists) {
      await git.clone({
        fs: this.fs,
        http,
        dir: repoDir,
        url: `https://github.com/${login}/${repoName}.git`,
        corsProxy: CORS_PROXY_URL,
        ref: 'main',
        singleBranch: true,
        depth: 5
      })
    }
  }

  async setAuthor(login, repoName, email) {
    if (!login || !repoName || !email) {
      return
    }

    const repoDir = this.repoDir(login, repoName)

    await this.cloneIfNeeded(login, repoName)

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
   * @returns
   */
  async getFile(login, repoName, fileName) {
    await this.cloneIfNeeded(login, repoName)
    const content = await this.fs.promises.readFile(this.path(login, repoName, fileName), { encoding: 'utf8' })
    if (content instanceof Uint8Array) {
      return content.toString()
    }
    return content
  }

  getGitHubPagesSite(login, repoName) {
    return this.callGithubAPI(
      `https://api.github.com/repos/${login}/${repoName}/pages`
    ).then((response) => {
      return response.json();
    });
  }

  getDeploymentStatus(deployment) {
    return this.callGithubAPI(deployment.statuses_url).then((response) => {
      return response.json();
    });
  }

  async push(login, repoName) {
    await git.push({
      fs: this.fs,
      http,
      dir: this.repoDir(login, repoName),
      corsProxy: CORS_PROXY_URL,
      onAuth: _ => {
        // See https://isomorphic-git.org/docs/en/onAuth#oauth2-tokens
        return {
          username: this.accessToken,
          password: 'x-oauth-basic',
        }
      }
    })
  }

  /**
   * @summary Remove file from github
   */
  async deleteFile(login, repoName, fileName) {
    await this.cloneIfNeeded(login, repoName)

    const path = this.path(login, repoName, fileName)
    await this.fs.promises.unlink(path)
    await git.remove({
      fs: this.fs,
      dir: this.repoDir(login, repoName),
      filepath: fileName,
    })
    await git.commit({
      fs: this.fs,
      dir: this.repoDir(login, repoName),
      message: `suppression du fichier ${fileName}`
    })
    this.push(login, repoName)
  }

  async deleteRepository(login, repoName) {
    await this.fs.promises.unlink(this.repoDir(login, repoName))
    return await this.callGithubAPI(
      `https://api.github.com/repos/${login}/${repoName}`,
      {
        headers: { Authorization: "token " + this.accessToken },
        method: "DELETE",
      }
    );
  }

  /**
   * @summary Create a file
   *
   * @param {string} content
   * @param {string} message
   * @param {string | { old: string, new: string }} fileName
   */
  async writeFile(login, repoName, fileName, content, message) {
    await this.cloneIfNeeded(login, repoName)

    if (typeof fileName !== 'string') {
      await this.deleteFile(login, repoName, fileName.old)
      fileName = fileName.new
    }

    await this.fs.promises.writeFile(this.path(login, repoName, fileName), content)
    await git.add({ fs: this.fs, filepath: fileName, dir: this.repoDir(login, repoName) })
    await git.commit({ fs: this.fs, dir: this.repoDir(login, repoName), message })
    this.push(login, repoName)
  }

  async writeCustomCSS(login, repoName, content) {
    return this.writeFile(login, repoName, this.customCSSPath, content, "mise à jour du ficher de styles custom");
  }

  async getPagesList(login, repoName, dir = '') {
    await this.cloneIfNeeded(login, repoName)

    const allFiles = await this.fs.promises.readdir(this.path(login, repoName, dir))
    return Promise.all(allFiles
      .filter(f => f.endsWith(".md") || f.endsWith(".html"))
      .map(async f => {
        const path = dir == '' ? f : `${dir}/${f}`
        const content = await this.fs.promises.readFile(this.path(login, repoName, path))
        const { attributes: data, body: markdownContent } = lireFrontMatter(content.toString());
        return {
          title: data?.title,
          path,
          content: markdownContent,
        };
      }))
  }

  async getArticlesList(login, repoName) {
    try {
      return await this.getPagesList(login, repoName, '_posts')
    } catch {
      return await Promise.resolve(undefined)
    }
  }

  getLastDeployment(login, repoName) {
    return this.callGithubAPI(
      `https://api.github.com/repos/${login}/${repoName}/deployments?per_page=1`
    ).then((deployments) => deployments[0]);
  }

  async checkFileExistence(login, repoName, path) {
    await this.cloneIfNeeded(login, repoName)
    const stat = await this.fs.promises.stat(this.path(login, repoName, path))
    return stat.isFile()
  }

  /**
   * @summary This method must be called for each API call.
   *
   * It handles access_token errors
   *
   */
  callGithubAPI(
    url,
    requestParams = { headers: { Authorization: "token " + this.accessToken } }
  ) {
    return fetch(url, requestParams).then((httpResp) => {
      if (httpResp.status === 404) {
        throw "NOT_FOUND";
      }

      if (httpResp.status === 401) {
        this.accessToken = undefined;
        console.debug("this accessToken : ", this);
        throw "INVALIDATE_TOKEN";
      }
      return httpResp;
    });
  }
}

/** @type {DatabaseAPI} */
let databaseAPI = new DatabaseAPI('');

// Create the databaseAPI singleton with the logged-in user access token.
if (store.state.accessToken) {
  databaseAPI = new DatabaseAPI(store.state.accessToken);
} else {
  history.replaceState(undefined, "", store.state.basePath + "/");
}

export default databaseAPI;
