//@ts-check

import { json } from "d3-fetch";

export default class DatabaseAPI {

  constructor(accessToken) {
    this.accessToken = accessToken
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
  getCommits(login, repoName) {
    return json(`https://api.github.com/repos/${login}/${repoName}/commits`, {
      headers: { Authorization: "token " + this.accessToken },
    })
  }

  getPagesList(login, repoName) {
    return this.getCommits(login, repoName).then((commits) => {
      const firstCommit = commits[0];
      const { sha } = firstCommit;

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
}


