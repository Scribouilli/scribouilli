//@ts-check

import parseMarkdown from "@github-docs/frontmatter";
import DatabaseAPI from "./DatabaseAPI.js";

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
    setBuildStatus(state, buildStatus) {
      state.buildStatus = buildStatus
    },
    setSiteRepoConfig(state, repo) {
      state.siteRepoConfig = repo;
    },
    removeSite(state) {
      state.pages = undefined
      state.siteRepoConfig = undefined
    },
    invalidateToken(state) {
      state.accessToken = undefined
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
    }

  },
});

const handleErrors = (error) => {
  console.debug("catching error", error)
  if (error === "INVALIDATE_TOKEN") {
    console.debug("catching INVALIDATE_TOKEN error")
    store.mutations.invalidateToken()
    page("/account")
  }
}

// Store access_token in browser
const url = new URL(location.href)
if (url.searchParams.has("access_token")) {
  url.searchParams.delete("access_token")
  history.replaceState(undefined, '', url)

  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, store.state.accessToken)
}

let databaseAPI

// Retrieve logged in user from access_token
if (store.state.accessToken) {
  databaseAPI = new DatabaseAPI(store.state.accessToken)

  const loginP = databaseAPI.getAuthenticatedUser()
    // @ts-ignore
    .then(({ login }) => {
      store.mutations.setLogin(login);
      return login;
    }).catch(msg => handleErrors(msg));

  store.mutations.setLogin(loginP);
  store.mutations.setBuildStatus(makeBuildStatus(databaseAPI, loginP, store.state.repoName))
  /*
   Appel sans vérification, 
   On suppose qu'au chargement initial,
   on peut faire confiance à ce que revoit l'API
  */
  store.state.buildStatus.checkStatus()

  const siteRepoConfigP = loginP.then((login) => {
    return databaseAPI.getRepository(login, store.state.repoName).catch(msg => handleErrors(msg));
  })

  store.mutations.setSiteRepoConfig(siteRepoConfigP)
  siteRepoConfigP.catch((error) => {
    if (error == "NOT_FOUND") {
      page("/create-project")
    }
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

const svelteTarget = document.querySelector("body");

let currentComponent;
let currentMapStateToProps = (_) => { };

function replaceComponent(newComponent, newMapStateToProps) {
  if (!newMapStateToProps) {
    throw new Error("Missing _mapStateToProps in replaceComponent");
  }

  if (currentComponent) currentComponent.$destroy();

  currentComponent = newComponent;
  currentMapStateToProps = newMapStateToProps;
}

function render(state) {

  const props = currentMapStateToProps(state);
  // @ts-ignore
  if (props) {
    currentComponent.$set(props);
  }
}

store.subscribe(render);


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
 * Par ici, y'a des routes
 */
page("/", () => {

  if (store.state.login) {
    const repoName = store.state.repoName;

    Promise.resolve(store.state.login).then(async (login) => {
      const origin = await makeOrigin(store.state);

      return databaseAPI.getRepository(login, repoName).then(() => {
        page("/atelier-list-pages");
      }).catch(msg => handleErrors(msg)).catch((err) => {
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
  const client_id = "64ecce0b01397c2499a6";
  const redirect_url = "https://toctoctoc.dreads-unlock.fr/github-callback";
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

  // @ts-ignore
  const atelierPages = new AtelierPages({
    target: svelteTarget,
    props: mapStateToProps(state),
  });
  replaceComponent(atelierPages, mapStateToProps);

  Promise.resolve(state.login).then((login) => {
    databaseAPI.getPagesList(login, state.repoName).then((pages) => {
      store.mutations.setPages(pages)
    }).catch(msg => handleErrors(msg))
  })

});

page("/atelier-page", ({ querystring }) => {
  const state = store.state;
  const fileName = new URLSearchParams(querystring).get("page");

  function mapStateToProps(state) {

    return {
      fileName: fileName,
      title: "",
      content: "",
      imageDirUrl: "",
      previousTitle: undefined,
      previousContent: undefined,
      makeFileNameFromTitle: makeFileNameFromTitle,
      // TOUTDOUX Il se passe un truc bizarre ici quand on recharge la page
      pagesP: Promise.resolve(state.login).then((login) => databaseAPI.getPagesList(login, state.repoName).catch(msg => handleErrors(msg))),
      sha: "",
      publishedWebsiteURL: makePublishedWebsiteURL(state),
      buildStatus: state.buildStatus
    };
  }

  //@ts-ignore
  const pageContenu = new PageContenu({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  });

  replaceComponent(pageContenu, mapStateToProps);

  Promise.resolve(state.login).then((login) => {
    // @ts-ignore
    pageContenu.$set({ imageDirUrl: `https://github.com/${login}/${state.repoName}/tree/main/images` })
  })
  // @ts-ignore
  pageContenu.$on("delete", ({ detail: { sha } }) => {
    Promise.resolve(state.login).then((login) => {
      store.mutations.setPages(state.pages.filter((page) => {
        return page.path !== fileName
      }))
      databaseAPI.deleteFile(login, state.repoName, fileName, sha).then(() => {
        state.buildStatus.setBuildingAndCheckStatusLater()
        page("/atelier-list-pages")
      }).catch(msg => handleErrors(msg))
    });
  });

  // @ts-ignore
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

    // If title changed
    if (fileName && (fileName !== newFileName)) {
      Promise.resolve(state.login).then((login) => {
        databaseAPI.updateFile(login, state.repoName, fileName, newFileName, body, sha).then(() => {
            if (body.sha) {
              console.log("page mise à jour");
            } else {
              console.log("nouvelle page créée");
            }
            state.buildStatus.setBuildingAndCheckStatusLater()
            page("/atelier-list-pages");
        }).catch(msg => handleErrors(msg))
      });
    } else {
      Promise.resolve(state.login).then((login) => {
        body.sha = sha
        databaseAPI.createFile(login, state.repoName, newFileName, body).then(() => {
          if (body.sha) {
            console.log("page mise à jour");
          } else {
            console.log("nouvelle page créée");
          }
          state.buildStatus.setBuildingAndCheckStatusLater()
          page("/atelier-list-pages");
        }).catch(msg => handleErrors(msg))
      });
    }
  });

  // Display existing file
  if (fileName) {
    Promise.resolve(store.state.login).then((login) => {
      databaseAPI.getFile(login, store.state.repoName, fileName)
        //@ts-ignore
        .then(({ content, sha }) => {
          //@ts-ignore
          const contenu = Buffer.from(content, "base64").toString();
          const {
            data,
            content: markdownContent,
            errors,
          } = parseMarkdown(contenu);

          //@ts-ignore
          pageContenu.$set({
            fileName: fileName,
            content: markdownContent,
            previousContent: markdownContent,
            // @ts-ignore
            title: data.title,
            // @ts-ignore
            previousTitle: data.title,
            sha: sha,
          });
        }).catch(msg => handleErrors(msg))
    });
  }

});

page("/settings", () => {

  function mapStateToProps(state) {
    return {
      publishedWebsiteURL: makePublishedWebsiteURL(state),
      buildStatus: state.buildStatus,
      themeColor: undefined,
      sha: undefined
    };
  }

  // @ts-ignore
  const settings = new Settings({
    target: svelteTarget,
    props: mapStateToProps(store.state)

  });

  //@ts-ignore
  settings.$on("delete-site", () => {
    Promise.resolve(store.state.login).then((login) => {

      databaseAPI.deleteRepository(login, store.state.repoName).then(() => {
        store.mutations.removeSite(store.state)
        page("/create-project")
      }).catch(msg => handleErrors(msg))
    });
  });

  settings.$on("update-theme-color", ({detail: { color, sha }}) => {
    const customCSS = `
    :root {
        --couleur-primaire : ${color};
    }
    `

    Promise.resolve(store.state.login).then((login) => {
      databaseAPI.updateCustomCSS(login, store.state.repoName, customCSS, sha)
      .then(() => {
        store.state.buildStatus.setBuildingAndCheckStatusLater()
        page("/settings")
      }).catch(msg => handleErrors(msg))
    })
  })

  replaceComponent(settings, mapStateToProps);

  Promise.resolve(store.state.login).then((login) => {
    databaseAPI.getFile(login, store.state.repoName, databaseAPI.customCSSPath)
      .then(({content, sha}) => {
        settings.$set({
          sha,
          themeColor: Buffer.from(content, "base64").toString().replace(/(.*)--couleur-primaire(.*)#(?<color>[a-fA-F0-9]{6});(.*)/gs, "#$<color>")
        })
      }).catch(msg => handleErrors(msg))
  })
});

page.base(store.state.basePath)

page.start();

