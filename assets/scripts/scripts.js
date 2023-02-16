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

// @ts-ignore
window.Buffer = buffer.Buffer;
const client_id = "a6302f0a0c8199ef730b";
const destination = "http://localhost:3000/";
const redirect_url = "http://toctoctoc.dreads-unlock.fr/github-callback";

const githubLoginHref = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=public_repo,delete_repo&redirect_uri=${redirect_url}?destination=${destination}`;

// @ts-ignore
const store = new Store({
  state: {
    // @ts-ignore
    accessToken: new URL(location).searchParams.get("access_token"),
    login: undefined, // Promise<string> | string
    origin: undefined, // Promise<string> | string
    repoName: "test-website-repo-3796",
    pages: undefined,
    buildStatus: undefined,
  },
  mutations: {
    setLogin(state, login) {
      state.login = login;
      // TODO déplacer la création de buildStatus qui dépend de mais n'a rien à faire avec le login
      state.buildStatus = makeBuildStatus(
        state.accessToken,
        login,
        state.repoName
      );
    },
    setPages(state, pages) {
      state.pages = pages;
    },
  },
});

async function makeOrigin(state) {
  const login = await Promise.resolve(state.login);
  return `${login.toLowerCase()}.github.io`;
}

async function makePublishedWebsiteURL(state) {
  const origin = await makeOrigin(state);
  return `https://${origin}/${state.repoName}`;
}

if (store.state.accessToken) {
  console.log("connecté t'as vu");

  const loginP = json("https://api.github.com/user", {
    headers: { Authorization: `token ${store.state.accessToken}` },
  })
    // @ts-ignore
    .then(({ login }) => {
      store.mutations.setLogin(login);
      return login;
    });

  store.mutations.setLogin(loginP);
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
        console.log(tree);
        const pageFiles = tree.filter((f) => {
          return (
            f.type === "blob" &&
            (f.path.endsWith(".md") || f.path.endsWith(".html"))
          );
        });
        return pageFiles;
      }
    );
  });
}

const svelteTarget = document.querySelector("main");

let currentComponent;
let mapStateToProps = (_) => {};

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
  currentComponent.$set(props);
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

      // TOUTDOUX : affiche une erreur, spas cool !
      //const buildStatus = makeBuildStatus(accessToken, login, repoName);

      /*window.addEventListener("hashchange", () => {
                if (location.hash === '#create-project') {
                    console.log("You're visiting a cool feature!");
                    new Vue({
                        el: document.querySelector('#create-project'),
                        data: {
                            origin
                        },
                        methods: {
                            createProject: makeCreateProjectButtonListener(accessToken, login, origin, buildStatus)
                        }
                    })
                }
                if (location.hash === '#atelier-page') {
                    prepareCreatePageScreen(accessToken, login, origin, buildStatus)
                }
                if (location.hash === 'atelier-list-pages') {
                    /!* TOUTDOUX : à tester *!/
                    console.log("Atelier-page hash")
                    prepareAtelierPagesScreen(accessToken, login, origin, buildStatus)
                }
            })*/

      // const deleteButton = document.querySelector("#atelier-parametres .delete-repo");
      /*deleteButton.addEventListener("click", () => {
                d3.text(`https://api.github.com/repos/${login}/${repoName}`, {
                headers: {Authorization: "token " + accessToken},
                method: "DELETE"
            })
            .then(() => {
                location.href = "#after-delete";
            })
            .catch((error) => {
                console.error("after delete failure", error);
                location.href = "#after-delete-failure"
                const refreshButton = document.querySelector("#after-delete-failure .refresh");
                const githubDangerZone = document.querySelector("#after-delete-failure" +
                " .github-danger-zone");
                
                refreshButton.addEventListener("click", () => {
                    location.href = "#";
                    location.reload();
                });
                
                githubDangerZone.href = `https://github.com/${login}/${repoName}/settings/#danger-zone`;
            })
        })*/

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

  replaceComponent(welcome, () => {});
});

page("/account", () => {
  // @ts-ignore
  const account = new Account({
    target: svelteTarget,
    props: {},
  });

  replaceComponent(account, () => {});
});

page("/login", () => {
  // @ts-ignore
  const login = new Login({
    target: svelteTarget,
    props: {
      href: githubLoginHref,
    },
  });

  replaceComponent(login, () => {});
});

page("/create-project", () => {
  function mapStateToProps(state) {
    return {
      publishedWebsiteURL: makePublishedWebsiteURL(state),
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

  // @ts-ignore
  const atelierPages = new AtelierPages({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  });

  const state = store.state;

  if (state.accessToken) {
    json("https://api.github.com/user", {
      headers: { Authorization: "token " + state.accessToken },
    }).then((result) => {
      console.log("User:", result);
      store.mutations.setLogin(result.login);

      getPagesList(state.login, state.repoName, state.accessToken).then(
        store.mutations.setPages
      );
    });
  } else {
    page("/");
  }

  replaceComponent(atelierPages, mapStateToProps);
});

function makeFileNameFromTitle(title) {
  const fileName =
    title
      .replace(/\/|#|\?/g, "-") // replace url confusing characters
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") + // remove accent because GH pages triggers file download
    ".md";

  return fileName;
}

function makeFrontMatterYAMLJsaisPasQuoiLa(title) {
  return ["---", "title: " + title, "---"].join("\n");
}

page("/atelier-page", ({ querystring }) => {
  const state = store.state;
  const fileName = new URLSearchParams(querystring).get("page");

  //@ts-ignore
  const pageContenu = new PageContenu({
    target: svelteTarget,
    props: {
      title: "",
      content: "",
      sha: "",
    },
  });

  pageContenu.$on("save", ({ detail: { content, title, sha } }) => {
    const newFileName = makeFileNameFromTitle(title);
    const body = {
      message: `création de la page ${title}`,
      content: Buffer.from(
        `${makeFrontMatterYAMLJsaisPasQuoiLa(title)}\n${content}`
      ).toString("base64"),
      sha: sha,
    };

    let readyToUpdate = Promise.resolve();
    if (fileName !== newFileName) {
      // On supprime la référence correspondante à l'ancien nom
      // Nous ne pouvons pas renommer le fichier via l'API
      // https://stackoverflow.com/questions/31563444/rename-a-file-with-github-api
      readyToUpdate = Promise.resolve(state.login).then((login) => {
        json(
          `https://api.github.com/repos/${login}/${state.repoName}/contents/${fileName}`,
          {
            headers: { Authorization: "token " + state.accessToken },
            method: "DELETE",
            body: JSON.stringify({
              sha,
              message: "changement de nom de fichier",
            }),
          }
        );
      });
    }

    readyToUpdate.then(() => {
      return Promise.resolve(state.login).then((login) => {
        json(
          `https://api.github.com/repos/${login}/${state.repoName}/contents/${newFileName}`,
          {
            headers: { Authorization: "token " + state.accessToken },
            method: "PUT",
            body: JSON.stringify(body),
          }
        )
          .then(() => {
            console.log("nouvelle page créée");
            // prepareAtelierPageScreen(accessToken, login, origin, buildStatus)
            page("/atelier-list-pages");
          })
          .catch((error) => {
            console.error(error);
          });
      });
    });
  });

  if (fileName) {
    Promise.resolve(store.state.login).then((login) => {
      json(
        `https://api.github.com/repos/${login}/${store.state.repoName}/contents/${fileName}`,
        {
          headers: { Authorization: "token " + store.state.accessToken },
        }
      )
        .then(({ content, sha }) => {
          //@ts-ignore
          const contenu = Buffer.from(content, "base64").toString();
          const {
            data,
            content: markdownContent,
            errors,
          } = parseMarkdown(contenu);
          pageContenu.$set({
            content: markdownContent,
            title: data.title,
            sha: sha,
          });
          replaceComponent(pageContenu, mapStateToProps);
        })
        .catch((error) => {
          console.error(error);
        });
    });
  } else {
    replaceComponent(pageContenu, mapStateToProps);
  }
});

page.start({ hashbang: true });
