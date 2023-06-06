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
import CreateGithubAccount from "./components/CreateGithubAccount.svelte";
import Login from "./components/Login.svelte";
import CreateProject from "./components/CreateProject.svelte";
import AtelierPages from "./components/AtelierPages.svelte";
import AtelierArticles from "./components/AtelierArticles.svelte";
import PageContenu from "./components/PageContenu.svelte";
import ArticleContenu from "./components/ArticleContenu.svelte";
import Settings from "./components/Settings.svelte";

// @ts-ignore
window.Buffer = buffer.Buffer;
const ACCESS_TOKEN_STORAGE_KEY = "scribouilli_access_token"
const TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER = "access_token"

// @ts-ignore
const store = new Store({
  state: {
    // @ts-ignore
    accessToken: new URL(location).searchParams.get(TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER) || localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY),
    login: undefined, // Promise<string> | string
    origin: undefined, // Promise<string> | string
    repoName: "test-website-repo-3796",
    pages: undefined,
    articles: undefined,
    buildStatus: undefined,
    basePath: location.hostname.endsWith(".github.io") ? "/scribouilli" : "",
    siteRepoConfig: undefined,
    theme: {
      css: undefined,
      sha: undefined
    }
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
    setArticles(state, articles) {
      state.articles = articles.sort((pageA, pageB) => {
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
    setTheme(state, css, sha) {
      state.theme.css = css
      state.theme.sha = sha
    },
    removeSite(state) {
      state.pages = undefined
      state.articles = undefined
      state.siteRepoConfig = undefined
    },
    invalidateToken(state) {
      state.accessToken = undefined
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
      console.log("Token has been invalidated")
    }
  },
});

/**
 * @summary Handle errors catched by Promises
 * @param {string} errorMessage
 */
const handleErrors = (errorMessage) => {
  switch (errorMessage) {
    case "INVALIDATE_TOKEN": {
      store.mutations.invalidateToken()
      page("/account")

      break
    }
    case "REPOSITORY_NOT_FOUND": {
      page("/create-project")

      break
    }

    default:

      console.log(`Error catched: ${errorMessage}`)

  }
}

/**
 * @summary Check the availability of a repository and redirect to project creation
 *          if it does not exist.
 * @param {string} login
 * @param {string} repoName
 * @param {*} thenCallback The callback you'll want to execute if the repository is available
 * @returns
 */
function checkRepositoryAvailabilityThen(login, repoName, thenCallback) {
  return databaseAPI.getRepository(login, repoName).then(thenCallback).catch(msg => handleErrors(msg))
}

// Store access_token in browser
const url = new URL(location.href)
if (url.searchParams.has(TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER)) {
  url.searchParams.delete(TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER)
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
  siteRepoConfigP.catch((error) => handleErrors(error))
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

async function makeRepositoryURL(state) {
  const login = await Promise.resolve(state.login);
  return `https://github.com/${login}/${state.repoName}`;
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
    .split('.').join("") // Remove dot to avoid issues
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
      return checkRepositoryAvailabilityThen(login, repoName, () => {
        page("/atelier-list-pages");
      })
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
  const githubLoginHref = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=public_repo&redirect_uri=${redirect_url}?destination=${destination}`;

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

page("/atelier-list-articles", () => {
  Promise.resolve(store.state.login).then(async (login) => {
    return checkRepositoryAvailabilityThen(login, store.state.repoName, () => { })
  });

  function mapStateToProps(state) {
    return {
      publishedWebsiteURL: makePublishedWebsiteURL(state),
      articles: state.articles,
      buildStatus: state.buildStatus,
    };
  }

  const state = store.state;

  // @ts-ignore
  const atelierArticles = new AtelierArticles({
    target: svelteTarget,
    props: mapStateToProps(state),
  });
  replaceComponent(atelierArticles, mapStateToProps);

  Promise.resolve(state.login).then((login) => {

    databaseAPI.getArticlesList(login, state.repoName).then((articles) => {
      store.mutations.setArticles(articles)
    }).catch(msg => handleErrors(msg))
  })

});


page("/atelier-list-pages", () => {
  Promise.resolve(store.state.login).then(async (login) => {
    return checkRepositoryAvailabilityThen(login, store.state.repoName, () => { })
  });


  function mapStateToProps(state) {
    return {
      publishedWebsiteURL: makePublishedWebsiteURL(state),
      pages: state.pages,
      buildStatus: state.buildStatus,
      repositoryURL: makeRepositoryURL(state),
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
  Promise.resolve(store.state.login).then(async (login) => {
    return checkRepositoryAvailabilityThen(login, store.state.repoName, () => { })
  });

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
      buildStatus: state.buildStatus,
      repositoryURL: makeRepositoryURL(state),
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
    newPages.push({ title: title, path: newFileName })

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

page("/atelier-article", ({ querystring }) => {
  Promise.resolve(store.state.login).then(async (login) => {
    return checkRepositoryAvailabilityThen(login, store.state.repoName, () => { })
  });

  const state = store.state;
  const fileName = new URLSearchParams(querystring).get("article");

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
      articlesP: Promise.resolve(state.login).then((login) => databaseAPI.getArticlesList(login, state.repoName).catch(msg => handleErrors(msg))),
      sha: "",
      publishedWebsiteURL: makePublishedWebsiteURL(state),
      buildStatus: state.buildStatus
    };
  }

  //@ts-ignore
  const articleContenu = new ArticleContenu({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  });

  replaceComponent(articleContenu, mapStateToProps);

  Promise.resolve(state.login).then((login) => {
    // @ts-ignore
    articleContenu.$set({ imageDirUrl: `https://github.com/${login}/${state.repoName}/tree/main/images` })
  })
  // @ts-ignore
  articleContenu.$on("delete", ({ detail: { sha } }) => {
    Promise.resolve(state.login).then((login) => {
      store.mutations.setArticless(state.articles.filter((article) => {
        return article.path !== fileName
      }))
      databaseAPI.deleteFile(login, state.repoName, fileName, sha).then(() => {
        state.buildStatus.setBuildingAndCheckStatusLater()
        page("/atelier-list-articles")
      }).catch(msg => handleErrors(msg))
    });
  });

  // @ts-ignore
  articleContenu.$on("save", ({ detail: { fileName, content, previousContent, title, previousTitle, sha } }) => {
    const hasContentChanged = content !== previousContent
    const hasTitleChanged = title !== previousTitle

    // If no content changed, just redirect
    if (!hasTitleChanged && !hasContentChanged) {
      page("/atelier-list-articles")
      return
    }

    let newFileName = fileName
    if (fileName !== "index.md") {
      newFileName = makeFileNameFromTitle(title);
    }

    const body = {
      message: `création de l'article ${title || "index.md"}`,
      content: Buffer.from(
        `${title ? makeFrontMatterYAMLJsaisPasQuoiLa(title) + "\n" : ""}${content}`
      ).toString("base64"),
    };

    let newArticles = state.articles?.filter((article) => {
      return article.path !== "_posts/" + fileName
    }) || []
    newArticles.push({ title: title, path: "_posts/" + newFileName })

    store.mutations.setArticles(newArticles)

    // If title changed
    if (fileName && (fileName !== newFileName)) {
      Promise.resolve(state.login).then((login) => {
        databaseAPI.updateFile(login, state.repoName, fileName, newFileName, body, sha).then(() => {
          if (body.sha) {
            console.log("article mise à jour");
          } else {
            console.log("nouvel article créé");
          }
          state.buildStatus.setBuildingAndCheckStatusLater()
          page("/atelier-list-articles");
        }).catch(msg => handleErrors(msg))
      });
    } else {
      Promise.resolve(state.login).then((login) => {
        body.sha = sha
        databaseAPI.createFile(login, state.repoName, newFileName, body).then(() => {
          if (body.sha) {
            console.log("article mise à jour");
          } else {
            console.log("nouvel article créé");
          }
          state.buildStatus.setBuildingAndCheckStatusLater()
          page("/atelier-list-articles");
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
          articleContenu.$set({
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

page("/create-github-account",()=> {
  // @ts-ignore
  const createGithubAccount = new CreateGithubAccount({
    target: svelteTarget,
    props: {},
  });

  replaceComponent(createGithubAccount, () => { });
})

page("/settings", () => {
  Promise.resolve(store.state.login).then(async (login) => {
    return checkRepositoryAvailabilityThen(login, store.state.repoName, () => { })
  });

  function mapStateToProps(state) {
    return {
      publishedWebsiteURL: makePublishedWebsiteURL(state),
      buildStatus: state.buildStatus,
      theme: state.theme,
      deleteRepositoryUrl: `https://github.com/${state.login}/${state.repoName}/settings#danger-zone`,
      repositoryURL: makeRepositoryURL(state),
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

  // @ts-ignore
  settings.$on("update-theme", ({ detail: { theme } }) => {
    Promise.resolve(store.state.login).then((login) => {
      databaseAPI.updateCustomCSS(login, store.state.repoName, theme.css, theme.sha)
        .then((response) => {
          store.mutations.setTheme(store.state.theme.css, response.content.sha)
          store.state.buildStatus.setBuildingAndCheckStatusLater(10000)
        }).catch(msg => handleErrors(msg))
    })
  })

  if (!store.state.theme.sha) {
    Promise.resolve(store.state.login).then((login) => {
      databaseAPI.getFile(login, store.state.repoName, databaseAPI.customCSSPath)
        .then(({ content, sha }) => {
          store.mutations.setTheme(Buffer.from(content, "base64").toString().trim(), sha)
        }).catch(msg => handleErrors(msg))
    })
  }

  replaceComponent(settings, mapStateToProps);
});

page.base(store.state.basePath)

page.start();
