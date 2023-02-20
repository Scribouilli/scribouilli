//@ts-check

import parseMarkdown from "@github-docs/frontmatter";

export default class DatabaseAPI {

  constructor(accessToken) {
    this.accessToken = accessToken
    this.commitsEtag = undefined
    this.latestCommit = undefined
  }

  getAuthenticatedUser() {
    return this.callGithubAPI("https://api.github.com/user").then((response) => {
      return response.json()
    })
  }

  getRepository(login, repoName) {
    return this.callGithubAPI(`https://api.github.com/repos/${login}/${repoName}`).then((response) => {
      return response.json()
    })
  }

  getFile(login, repoName, fileName) {
    return this.callGithubAPI(`https://api.github.com/repos/${login}/${repoName}/contents/${fileName}`).then((response) => {
      return response.json()
    })
  }

  getGitHubPagesSite(login, repoName) {
    return this.callGithubAPI(`https://api.github.com/repos/${login}/${repoName}/pages`).then((response) => {
      return response.json()
    })
  }

  getDeploymentStatus(deployment) {
    return this.callGithubAPI(deployment.statuses_url).then((response) => {
      return response.json()
    })
  }

  /**
  * @summary Remove file from github
  */
  deleteFile(login, repoName, fileName, sha) {
    return this.callGithubAPI(
      `https://api.github.com/repos/${login}/${repoName}/contents/${fileName}`,
      {
        headers: { Authorization: "token " + this.accessToken },
        method: "DELETE",
        body: JSON.stringify({
          sha,
          message: `suppression du fichier ${fileName}`,
        }),
      }
    ).then((response) => {
      return response.json()
    })
  }

  deleteRepository(login, repoName) {
    return this.callGithubAPI(
      `https://api.github.com/repos/${login}/${repoName}`,
      {
        headers: { Authorization: "token " + this.accessToken },
        method: "DELETE",
      })
  }

  /**
   * @summary Update or Create file from github
   * 
   * If body contains a SHA ;
   * it's an update ;
   * else it's a creation.
   */
  updateOrCreateFile(login, repoName, fileName, body) {
    return this.callGithubAPI(
      `https://api.github.com/repos/${login}/${repoName}/contents/${fileName}`,
      {
        headers: { Authorization: "token " + this.accessToken },
        method: "PUT",
        body: JSON.stringify(body),
      }
    )
  }

  getLatestCommit(login, repoName) {
    return this.callGithubAPI(`https://api.github.com/repos/${login}/${repoName}/commits`, {
      headers: {
        Authorization: "token " + this.accessToken,
        "If-None-Match": this.commitsEtag
      }
    }).then((httpResp) => {
      if (httpResp.status === 304) {
        return [this.latestCommit]
      } else {
        this.commitsEtag = httpResp.headers.get("etag")
        return httpResp.json()
      }
    }).then(commits => {
      this.latestCommit = commits[0]
      return this.latestCommit
    })
  }

  getPagesList(login, repoName) {
    return this.getLatestCommit(login, repoName).then(({sha}) => {
      return this.callGithubAPI(`https://api.github.com/repos/${login}/${repoName}/git/trees/${sha}`)
      .then(response => response.json())
      .then(({ tree }) => {
          const pageFiles = tree.filter((f) => {
            return (
              f.type === "blob" &&
              (f.path.endsWith(".md") || f.path.endsWith(".html"))
            );
          });
          return pageFiles;
        }
      ).then((files) => {
        const pagePs = files.map((file) => {
          return this.getFile(login, repoName, file.path)
            .then((page) => {
              const contenu = Buffer.from(page.content, "base64").toString();
              const title = parseMarkdown(contenu).data?.title;
              return {title: title, path: file.path, content: "kezlkfjez"}
            }).catch(() => {
              return {title: file.path, path: file.path, content: ""}
            })
        })
        return Promise.all(pagePs)
      });
    });
  }

  getLastDeployment(login, repoName) {
    return this.callGithubAPI(`https://api.github.com/repos/${login}/${repoName}/deployments?per_page=1`).then((deployments) => deployments[0])
  }

  updateCustomCSS(login, repoName, content) {
    return this.callGithubAPI(`https://api.github.com/repos/${login}/${repoName}/contents/assets/css/custom.css`, {
          headers: { Authorization: "token " + this.accessToken },
          method: "PUT",
          body: JSON.stringify(
              {
                  message: "création du ficher de styles custom",
                  content: Buffer.from(content).toString('base64')
              }
          )
      })
  }

  callGithubAPI(url, requestParams = { headers: { Authorization: "token " + this.accessToken } }) {
    return fetch(url, requestParams).then((httpResp) => {
      if (httpResp.status === 404) {
        throw "NOT_FOUND"
      }

      if (httpResp.status === 401) {
        this.accessToken = undefined
        console.debug("this accessToken : ", this)
        throw "INVALIDATE_TOKEN"
      }
      return httpResp
    })
  }

}


