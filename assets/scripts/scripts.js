//@ts-check

import { json, text } from "d3-fetch";
import parseMarkdown from "@github-docs/frontmatter";

import makeCreateProjectButtonListener from "./makeCreateProjectButtonListener.js";
// import prepareCreatePageScreen from "./prepareCreatePageScreen.js";
import makeBuildStatus from "./buildStatus.js";

import Store from "baredux";

import page from "page";

import Welcome from "./components/Welcome.svelte";
import Account from "./components/Account.svelte";
import Login from "./components/Login.svelte";
import CreateProject from "./components/CreateProject.svelte";
import AtelierPages from "./components/AtelierPages.svelte";
import PageContenu from "./components/PageContenu.svelte";
import Settings from "./components/Settings.svelte";

// @ts-ignore
window.Buffer = buffer.Buffer;
const ACCESS_TOKEN_STORAGE_KEY = "access_token"

// @ts-ignore
const store = new Store({
  state: {
    // @ts-ignore
    accessToken: new URL(location).searchParams.get("access_token") || localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY),
    login: undefined, // Promise<string> | string
    origin: undefined, // Promise<string> | string
    repoName: "test-website-repo-3796",
    pages: undefined,
    buildStatus: undefined,
    basePath: location.hostname.endsWith(".github.io") ? "/scribouilli" : "",
    siteRepoConfig: undefined
  },
  mutations: {
    setLogin(state, login) {
      state.login = login;
      // TOUTDOUX déplacer la création de buildStatus qui dépend de mais n'a rien à faire avec le login
      state.buildStatus = makeBuildStatus(
        state.accessToken,
        login,
        state.repoName
      );
    },
    setPages(state, pages) {
      state.pages = pages.sort((pageA, pageB) => {
        if (pageA.path < pageB.path) {
          return -1
        }
        if (pageA.path > pageB.path) {
          return 1
        }
        if (pageA.path === pageB.path) {
          return 0
        }
      });
    },
    setSiteRepoConfig(state, repo) {
      state.siteRepoConfig = repo;
    },
    removeSite(state) {
      state.pages = undefined
      state.siteRepoConfig = undefined
    },

  },
});

// Store access_token in browser
const url = new URL(location.href)
if (url.searchParams.has("access_token")) {
  url.searchParams.delete("access_token")
  history.replaceState(undefined, '', url)

  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, store.state.accessToken)
}

// Retrieve logged in user from access_token
if (store.state.accessToken) {
  const loginP = json("https://api.github.com/user", {
    headers: { Authorization: `token ${store.state.accessToken}` },
  })
    // @ts-ignore
    .then(({ login }) => {
      store.mutations.setLogin(login);
      return login;
    });

  store.mutations.setLogin(loginP);

  const siteRepoConfigP = loginP.then((login) => {
    return json(`https://api.github.com/repos/${login}/${store.state.repoName}`, {
      headers: { Authorization: "token " + store.state.accessToken }
    })
  })

  store.mutations.setSiteRepoConfig(siteRepoConfigP)
  siteRepoConfigP.catch(() => {
    page("/create-project")
  })
} else {
  history.replaceState(undefined, '', store.state.basePath + "/")
}

async function makeOrigin(state) {
  const login = await Promise.resolve(state.login);
  return `${login.toLowerCase()}.github.io`;
}

async function makePublishedWebsiteURL(state) {
  const origin = await makeOrigin(state);
  return `https://${origin}/${state.repoName}`;
}

function getPagesList(login, repoName, accessToken) {
  return json(`https://api.github.com/repos/${login}/${repoName}/commits`, {
    headers: { Authorization: "token " + accessToken },
  }).then((commits) => {
    const firstCommit = commits[0];
    const { sha } = firstCommit;

    return json(
      `https://api.github.com/repos/${login}/${repoName}/git/trees/${sha}`,
      {
        headers: { Authorization: "token " + accessToken },
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

const svelteTarget = document.querySelector("body");

let currentComponent;
let mapStateToProps = (_) => { };

function replaceComponent(newComponent, _mapStateToProps) {
  if (!_mapStateToProps) {
    throw new Error("Missing _mapStateToProps in replaceComponent");
  }

  if (currentComponent) currentComponent.$destroy();

  currentComponent = newComponent;
  mapStateToProps = _mapStateToProps;
}

function render(state) {

  const props = mapStateToProps(state);
  if (props) {
    currentComponent.$set(props);
  }
}

store.subscribe(render);

/**
 *  Par ici, y'a des routes
 */

page("/", () => {

  if (store.state.login) {
    const repoName = store.state.repoName;

    Promise.resolve(store.state.login).then(async (login) => {
      const origin = await makeOrigin(store.state);

      return json(`https://api.github.com/repos/${login}/${repoName}`, {
        headers: { Authorization: `token ${store.state.accessToken}` },
      })
        .then(() => {
          page("/atelier-list-pages");
          // prepareAtelierPageScreen(accessToken, login, repoName, buildStatus);
        })

        .catch((err) => {
          // ToutDoux : gérer les erreurs autres que le repo n'existe po
          page("/create-project");
        });
    });
  }

  // @ts-ignore
  const welcome = new Welcome({
    target: svelteTarget,
    props: {},
  });

  replaceComponent(welcome, () => { });
});

page("/account", () => {
  // @ts-ignore
  const account = new Account({
    target: svelteTarget,
    props: {},
  });

  replaceComponent(account, () => { });
});

page("/login", () => {
  const destination = location.origin + store.state.basePath + "/create-project";
  const client_id = "a6302f0a0c8199ef730b";
  const redirect_url = "http://toctoctoc.dreads-unlock.fr/github-callback";
  const githubLoginHref = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=public_repo,delete_repo&redirect_uri=${redirect_url}?destination=${destination}`;

  // @ts-ignore
  const login = new Login({
    target: svelteTarget,
    props: {
      href: githubLoginHref,
    },
  });

  replaceComponent(login, () => { });
});

page("/create-project", () => {
  Promise.resolve(store.state.siteRepoConfig).then((repo) => {
    if (repo) {
      page.redirect("/atelier-list-pages")
    }
  })

  function mapStateToProps(state) {
    return {
      publishedWebsiteURL: makePublishedWebsiteURL(state),
      siteRepoConfig: state.siteRepoConfig,
      createProject: Promise.all([
        Promise.resolve(state.login),
        makeOrigin(state),
      ]).then(([login, origin]) =>
        makeCreateProjectButtonListener(
          state.accessToken,
          login,
          origin,
          state.repoName,
          state.buildStatus
        )
      ),
    };
  }

  // @ts-ignore
  const createProject = new CreateProject({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  });

  replaceComponent(createProject, mapStateToProps);
});

page("/atelier-list-pages", () => {
  function mapStateToProps(state) {
    return {
      publishedWebsiteURL: makePublishedWebsiteURL(state),
      pages: state.pages,
      buildStatus: state.buildStatus,
    };
  }

  const state = store.state;

  if (state.accessToken) {
    // @ts-ignore
    const atelierPages = new AtelierPages({
      target: svelteTarget,
      props: mapStateToProps(state),
    });
    replaceComponent(atelierPages, mapStateToProps);

    json("https://api.github.com/user", {
      headers: { Authorization: "token " + state.accessToken },
    }).then((result) => {
      // Pour s'assurer qu'il y a un login au moment de faire l'appel pour la liste des pages
      store.mutations.setLogin(result.login)
      getPagesList(state.login, state.repoName, state.accessToken).then(
        store.mutations.setPages
      );
    });
  } else {
    page("/");
  }

});

function makeFileNameFromTitle(title) {
  const fileName =
    title
      .replace(/\/|#|\?/g, "-") // replace url confusing characters
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accent because GH pages triggers file download
      .toLowerCase() +
    ".md"

  return fileName;
}

function makeFrontMatterYAMLJsaisPasQuoiLa(title) {
  return ["---", "title: " + title, "---"].join("\n");
}

/**
 * @summary Remove file from github
 */
function deleteFile(login, state, fileName, sha) {
  return json(
    `https://api.github.com/repos/${login}/${state.repoName}/contents/${fileName}`,
    {
      headers: { Authorization: "token " + state.accessToken },
      method: "DELETE",
      body: JSON.stringify({
        sha,
        message: `suppression du fichier ${fileName}`,
      }),
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
function updateOrCreateFile(login, state, fileName, body) {
  return json(
    `https://api.github.com/repos/${login}/${state.repoName}/contents/${fileName}`,
    {
      headers: { Authorization: "token " + state.accessToken },
      method: "PUT",
      body: JSON.stringify(body),
    }
  ).then(() => {
    if (body.sha) {
      console.log("page mise à jour");
    } else {
      console.log("nouvelle page créée");
    }
    // prepareAtelierPageScreen(accessToken, login, origin, buildStatus)
    page("/atelier-list-pages");
  })
    .catch((error) => {
      console.error(error);
    });
}

page("/atelier-page", ({ querystring }) => {
  const state = store.state;
  const fileName = new URLSearchParams(querystring).get("page");

  //@ts-ignore
  const pageContenu = new PageContenu({
    target: svelteTarget,
    props: {
      fileName: undefined,
      title: "",
      content: "",
      previousTitle: undefined,
      previousContent: undefined,
      makeFileNameFromTitle: makeFileNameFromTitle,
      // TOUTDOUX Il se passe un truc bizarre ici quand on recharge la page
      pagesP: Promise.resolve(state.login).then((login) => getPagesList(login, state.repoName, state.accessToken)),
      sha: "",
      publishedWebsiteURL: makePublishedWebsiteURL(state)
    },
  });

  replaceComponent(pageContenu, mapStateToProps);

  pageContenu.$on("delete", ({ detail: { sha } }) => {

    Promise.resolve(state.login).then((login) => {
      store.mutations.setPages(state.pages.filter((page) => {
        return page.path !== fileName
      }))
      deleteFile(login, state, fileName, sha).then(() => {
        page("/atelier-list-pages")
      });
    });
  });

  pageContenu.$on("save", ({ detail: { fileName, content, previousContent, title, previousTitle, sha } }) => {
    const hasContentChanged = content !== previousContent
    const hasTitleChanged = title !== previousTitle

    // If no content changed, just redirect
    if (!hasTitleChanged && !hasContentChanged) {
      page("/atelier-list-pages")
      return
    }

    let newFileName = fileName
    if (fileName !== "index.md") {
      newFileName = makeFileNameFromTitle(title);
    }

    const body = {
      message: `création de la page ${title || "index.md"}`,
      content: Buffer.from(
        `${title ? makeFrontMatterYAMLJsaisPasQuoiLa(title) + "\n" : ""}${content}`
      ).toString("base64"),
    };

    let newPages = state.pages?.filter((page) => {
      return page.path !== fileName
    }) || []
    newPages.push({ path: newFileName })

    store.mutations.setPages(newPages)

    if (fileName && (fileName !== newFileName)) {
      // On supprime la référence correspondante à l'ancien nom
      // Nous ne pouvons pas renommer le fichier via l'API
      // https://stackoverflow.com/questions/31563444/rename-a-file-with-github-api
      Promise.resolve(state.login).then((login) => {
        deleteFile(login, state, fileName, sha).then(() => {
          updateOrCreateFile(login, state, newFileName, body)
        });
      });
    } else {
      Promise.resolve(state.login).then((login) => {
        body.sha = sha
        updateOrCreateFile(login, state, newFileName, body)
      });
    }
  });

  // Display existing file
  if (fileName) {
    Promise.resolve(store.state.login).then((login) => {
      json(
        `https://api.github.com/repos/${login}/${store.state.repoName}/contents/${fileName}`,
        {
          headers: { Authorization: "token " + store.state.accessToken },
        }
      )
        //@ts-ignore
        .then(({ content, sha }) => {
          //@ts-ignore
          const contenu = Buffer.from(content, "base64").toString();
          const {
            data,
            content: markdownContent,
            errors,
          } = parseMarkdown(contenu);
          pageContenu.$set({
            fileName: fileName,
            content: markdownContent,
            previousContent: markdownContent,
            title: data.title,
            previousTitle: data.title,
            sha: sha,
          });
        })
        .catch((error) => {
          console.error(error);
        });
    });
  }

});

page("/settings", () => {

  function mapStateToProps(state) {
    return {
      publishedWebsiteURL: makePublishedWebsiteURL(state),
    };
  }

  // @ts-ignore
  const settings = new Settings({
    target: svelteTarget,
    props: { publishedWebsiteURL: makePublishedWebsiteURL(store.state) }

  });

  settings.$on("delete-site", () => {
    Promise.resolve(store.state.login).then((login) => {

      json(`https://api.github.com/repos/${login}/${store.state.repoName}`,
        {
          headers: { Authorization: "token " + store.state.accessToken },
          method: "DELETE",
        }).then(() => {
          store.mutations.removeSite(store.state)
          page("/create-project")
        });
    });
  });

  replaceComponent(settings, () => { });
});

page.base(store.state.basePath)

page.start();

