//@ts-check

import { json } from "d3-fetch";

export default class DatabaseAPI {

  constructor(accessToken) {
    this.accessToken = accessToken
    this.commitsEtag = undefined
    this.latestCommit = undefined
  }

  getAuthenticatedUser() {
    return json("https://api.github.com/user", {
      headers: { Authorization: "token " + this.accessToken },
    })
  }

  getRepository(login, repoName) {
    return json(`https://api.github.com/repos/${login}/${repoName}`, {
      headers: { Authorization: `token ${this.accessToken}` },
    })
  }

  deleteRepository(login, repoName) {
    return json(`https://api.github.com/repos/${login}/${repoName}`,
      {
        headers: { Authorization: "token " + this.accessToken },
        method: "DELETE",
      })
  }

  getFile(login, repoName, fileName) {
    return json(
      `https://api.github.com/repos/${login}/${repoName}/contents/${fileName}`,
      {
        headers: { Authorization: "token " + this.accessToken },
      }
    )
  }

  /**
   * @summary Update or Create file from github
   * 
   * If body contains a SHA ;
   * it's an update ;
   * else it's a creation.
   */
  updateOrCreateFile(login, repoName, fileName, body) {
    return json(
      `https://api.github.com/repos/${login}/${repoName}/contents/${fileName}`,
      {
        headers: { Authorization: "token " + this.accessToken },
        method: "PUT",
        body: JSON.stringify(body),
      }
    )
  }

  /**
 * @summary Remove file from github
 */
  deleteFile(login, repoName, fileName, sha) {
    return json(
      `https://api.github.com/repos/${login}/${repoName}/contents/${fileName}`,
      {
        headers: { Authorization: "token " + this.accessToken },
        method: "DELETE",
        body: JSON.stringify({
          sha,
          message: `suppression du fichier ${fileName}`,
        }),
      }
    )
  }

  getLatestCommit(login, repoName) {
    return fetch(`https://api.github.com/repos/${login}/${repoName}/commits`, {
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
    return this.getLatestCommit(login, repoName).then(({ sha }) => {
      return json(
        `https://api.github.com/repos/${login}/${repoName}/git/trees/${sha}`,
        {
          headers: { Authorization: "token " + this.accessToken },
        }
      ).then(
        // @ts-ignore
        ({ tree }) => {
          const pageFiles = tree.filter((f) => {
            return (
              f.type === "blob" &&
              f.path !== "index.md" &&
              (f.path.endsWith(".md") || f.path.endsWith(".html"))
            );
          });
          return pageFiles;
        }
      );
    });
  }

  getGitHubPagesSite(login, repoName) {
    return json(`https://api.github.com/repos/${login}/${repoName}/pages`, {
      headers: {
        Authorization: "token " + this.accessToken,
      }
    }).then(pageSite => {
      console.debug("pageSite dans databaseAPI")
      return pageSite
    })
  }

  getLastDeployment(login, repoName) {
    return json(`https://api.github.com/repos/${login}/${repoName}/deployments?per_page=1`, {
      headers: { Authorization: "token " + this.accessToken }
      // @ts-ignore
    }).then((deployments) => deployments[0])
  }

  getDeploymentStatus(deployment) {
    return json(deployment.statuses_url, {
      headers: { Authorization: "token " + this.accessToken }
    })
  }

}


