import makeCreateProjectButtonListener from "./makeCreateProjectButtonListener.js";
// import prepareAtelierPageScreen from "./prepareAtelierPagesScreen.js";
// import prepareCreatePageScreen from "./prepareCreatePageScreen.js";
import makeBuildStatus from "./buildStatus.js";
// import prepareAtelierPageScreen from "./prepareAtelierPagesScreen";
// import prepareAtelierPagesScreen from "./prepareAtelierPagesScreen.js";
import Store from 'baredux'

import page from 'page'

import Welcome from './components/Welcome.svelte'
import Account from './components/Account.svelte'
import Login from './components/Login.svelte'
import CreateProject from './components/CreateProject.svelte'


window.Buffer = buffer.Buffer;
const client_id = "2b4ed9ba835b05f83e2d";
const destination = "https://daktary-team.github.io/scribouilli";
const redirect_url = "https://file-moi-les-clefs.herokuapp.com/gh-callback";

const githubLoginHref =
    `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=public_repo,delete_repo&redirect_uri=${redirect_url}?destination=${destination}`;


const store = new Store({
    state: {
        accessToken: new URL(location).searchParams.get("access_token"),
        login: undefined, // Promise<string> | string
        origin: undefined, // Promise<string> | string
        repoName: 'test-website-repo-3796',
        pages: undefined,
        buildStatus: undefined
    },
    mutations: {
        setLogin(state, login){
            state.login = login;
            state.buildStatus = makeBuildStatus(state.accessToken, login, state.repoName)
        }
    }
})

async function makeOrigin(state){
    const login = await Promise.resolve(state.login);
    return `${login.toLowerCase()}.github.io`;
}

async function makePublishedWebsiteURL(state){
    const origin = await makeOrigin(state);
    return `https://${origin}/${state.repoName}`;
}

if (store.state.accessToken) {
    console.log("connecté t'as vu");

    const loginP = d3.json("https://api.github.com/user", {headers: {Authorization: `token ${store.state.accessToken}`}})
        .then(({login}) => {
            store.mutations.setLogin(login)
            return login
        });

    store.mutations.setLogin(loginP)
}


function getPagesList(login, repoName, accessToken) {
    return d3.json(`https://api.github.com/repos/${login}/${repoName}/commits`, {
        headers: {Authorization: "token " + accessToken}
    })
        .then(
            commits => {
                const firstCommit = commits[0];
                const {sha} = firstCommit;

                return d3.json(`https://api.github.com/repos/${login}/${repoName}/git/trees/${sha}`, {
                    headers: {Authorization: "token " + accessToken}
                })
                    .then(
                        ({tree}) => {
                            console.log(tree);
                            const pageFiles = tree.filter(f => {
                                return f.type === "blob" && (f.path.endsWith(".md") || f.path.endsWith(".html"))
                            })
                            return pageFiles;
                        }
                    )
            })
}

function makeFileNameFromTitle(title) {
    const fileName = title.replace(/\/|#|\?/g, "-") // replace url confusing characters
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accent because GH pages triggers file download
        + ".md";

    return fileName;
}

function makeFrontMatterYAMLJsaisPasQuoiLa(title) {
    return [
        "---",
        "title: " + title,
        "---"
    ].join("\n")
}



const svelteTarget = document.querySelector("main");

let currentComponent;
let mapStateToProps = () => {};

function replaceComponent(newComponent, _mapStateToProps){
    if(!_mapStateToProps){
        throw new Error('Missing _mapStateToProps in replaceComponent')
    }

    if(currentComponent)
        currentComponent.$destroy()
    
    currentComponent = newComponent
    mapStateToProps = _mapStateToProps
}

function render(state){
    const props = mapStateToProps(state);
    currentComponent.$set(props)
}

store.subscribe(render)

/*
const AtelierPages = {
    template: `<section class="screen" id="atelier-pages">
        <h2><a v-bind:href="publishedWebsiteURL" class="project-name">{{ publishedWebsiteURL }}</a></h2>
    
        <nav>
            <a href="#atelier-pages">Pages</a>
            <a href="#atelier-articles">Articles</a>
            <a href="#atelier-parametres">Paramètres</a>
        </nav>
    
        <div id="pages">
            <h3>Pages</h3>
            
            <router-link to="/atelier-create-page">Nouvelle page</router-link>
            
            <ul class="pages-list">
                <li v-for="page in pages" :key="page.path">{{ page.path }}</li>
            </ul>
        </div>
    </section>`,
    props: ["publishedWebsiteURL", "pages"]
}

const AtelierCreatePage = {
    template: `
    <section class="screen" id="atelier-create-page">
        <h3>Création d'une page</h3>
    
        <form v-on:submit="onSubmit">
            <div>
                <label for="title">Titre</label>
                <input v-model="title" type="text" id="title">
            </div>
            <p>Attention, si le titre contient <code>/</code>, <code>#</code> ou <code>?</code>, ça peut ne pas marcher
            </p>
    
            <div>
                <label for="content">Contenu</label>
                <textarea v-model="content" id="content" cols="30" rows="10"></textarea>
            </div>
            <button type="submit">Publier la page</button>
        </form>
    </section>
    `,
    data() {
        return {
            title: "",
            content: ""
        }
    },
    methods: {
        onSubmit: function (event) {
            const {title, content} = this;
            const fileName = makeFileNameFromTitle(title);

            d3.json(`https://api.github.com/repos/${login}/${origin}/contents/${fileName}`, {
                    headers: {Authorization: "token " + accessToken},
                    method: "PUT",
                    body: JSON.stringify(
                        {
                            message: `création de la page ${title}`,
                            content: Buffer.from(`${makeFrontMatterYAMLJsaisPasQuoiLa(title)}\n\n${content}`).toString('base64')
                        }
                    )
                }
            )
                .then(() => {
                        // prepareAtelierPageScreen(accessToken, login, origin, buildStatus)
                        //location.href = "#atelier-pages"
                    }
                )
                .catch((error) => {
                    console.error(error)
                })
        }
    }
}
*/



page('/', () => {

    if(store.state.login){
        const repoName = store.state.repoName

        Promise.resolve(store.state.login).then(async login => {
            const origin = await makeOrigin(store.state)


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
                if (location.hash === '#atelier-create-page') {
                    prepareCreatePageScreen(accessToken, login, origin, buildStatus)
                }
                if (location.hash === 'atelier-pages') {
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

            return d3.json(`https://api.github.com/repos/${login}/${repoName}`, {headers: {Authorization: `token ${store.state.accessToken}`}})
                .then(() => {
                    page('/atelier-pages');
                    // prepareAtelierPageScreen(accessToken, login, repoName, buildStatus);
                })

                .catch(() => {
                    // ToutDoux : gérer les erreurs autres que le repo n'existe po
                    page('/create-project');
                })
        });
    }

    const welcome = new Welcome({
        target: svelteTarget,
        props: {}
    });

    replaceComponent(welcome, () => {})

})

page('/account', () => {
    const account = new Account({
        target: svelteTarget,
        props: {}
    });

    replaceComponent(account, () => {})
})

page('/login', () => {
    const login = new Login({
        target: svelteTarget,
        props: {
            href: githubLoginHref
        }
    });

    replaceComponent(login, () => {})
})

page('/create-project', () => {

    function mapStateToProps(state){
        return {
            publishedWebsiteURL: makePublishedWebsiteURL(state),
            createProject: Promise.all([
                Promise.resolve(state.login),
                makeOrigin(state)
            ]).then(
                ([login, origin]) => makeCreateProjectButtonListener(state.accessToken, login, origin, state.repoName, state.buildStatus)
            )
        }
    }

    const createProject = new CreateProject({
        target: svelteTarget,
        props: mapStateToProps(store.state)
    });

    replaceComponent(createProject, mapStateToProps)
})


page('/atelier-pages', () => {
    const atelierPages = new AtelierPages({
        target: svelteTarget,
        props: {
            publishedWebsiteURL, pages
        }
    });

    const state = store.state

    if (state.accessToken) {
        d3.json("https://api.github.com/user", {headers: {Authorization: "token " + accessToken}})
            .then(result => {
                    console.log("User:", result);
                    store.setLogin(result.login);

                    getPagesList(state.login, state.repoName, accessToken)
                        .then(
                            pages => {
                                atelierPages.$set({pages})
                            }
                        )
                }
            )
    } else {
        page("/");
    }

    replaceComponent(atelierPages, () => {})
})

/*
const routes = [
    {
        path: '/atelier-pages',
        props(route) {
            const {publishedWebsiteURL, pages} = store.state;
            return {publishedWebsiteURL, pages}
        },
        beforeEnter(to, from, next) {
            // TOUTDOUX réécrire avec baredux
            if (accessToken) {
                if (!state.publishedWebsiteURL) {
                    d3.json("https://api.github.com/user", {headers: {Authorization: "token " + accessToken}})
                        .then(result => {
                                console.log("User:", result);
                                state.login = result.login;
                                state.origin = `${state.login}.github.io`;
                                state.publishedWebsiteURL = state.origin;

                                getPagesList(state.login, state.repoName, accessToken)

                                    .then(
                                        pages => {
                                            state.pages = pages;
                                            router.replace("/atelier-pages");
                                        }
                                    )
                            }
                        )
                } else {
                    next();
                }
            } else {
                router.push("/");
            }

        },
        component: AtelierPages
    },
    {
        path: '/atelier-create-page',
        component: AtelierCreatePage
    }
]
*/

page.start({hashbang: true})