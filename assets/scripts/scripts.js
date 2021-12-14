// import { makeCreateProjectButtonListener } from "./prepareCreateProjectScreen.js";
// import prepareAtelierPageScreen from "./prepareAtelierPagesScreen.js";
// import prepareCreatePageScreen from "./prepareCreatePageScreen.js";
import makeBuildStatus from "./buildStatus.js";
// import prepareAtelierPageScreen from "./prepareAtelierPagesScreen";
// import prepareAtelierPagesScreen from "./prepareAtelierPagesScreen.js";
import Store from 'https://cdn.jsdelivr.net/gh/DavidBruant/baredux@master/main.js'

Vue.use(VueRouter);
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
        publishedWebsiteURL: undefined,
        pages: undefined
    },
    mutations: {
        setLogin(state, login){
            state.login = login;
        },
        setOrigin(state, origin){
            state.origin = origin;
        }
    }
})

if (store.state.accessToken) {
    console.log("connecté t'as vu");

    const loginP = d3.json("https://api.github.com/user", {headers: {Authorization: "token " + store.state.accessToken}})
        .then(({login}) => {
            store.mutations.setLogin(login)
            return login
        });

    store.mutations.setLogin(loginP)

    const originP = loginP.then(login => {
        const origin = `${login}.github.io`
        store.mutations.setOrigin(origin)
        return origin;
    })

    store.mutations.setOrigin(originP)
}


function getPagesList(login, origin, accessToken) {
    return d3.json(`https://api.github.com/repos/${login}/${origin}/commits`, {
        headers: {Authorization: "token " + accessToken}
    })
        .then(
            commits => {
                const firstCommit = commits[0];
                const {sha} = firstCommit;

                return d3.json(`https://api.github.com/repos/${login}/${origin}/git/trees/${sha}`, {
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

const Welcome = {
    template: `<section class="screen" id="welcome">
    <h2>Un espace collaboratif <br> de publication de contenu.</h2>

    <router-link to="/account" class="btn">Créer un espace</router-link>
    <!-- <a href="#account">Rejoindre un espace</a> -->
</section>`
}

const Account = {
    template: `<section class="screen" id="account">
    <h2>Pour pouvoir publier votre contenu, il faut que Scribouilli se connecte à un compte Github.</h2>

    <router-link to="/login" class="btn">J'ai déjà un compte</router-link>
    <!-- <a href="#create-account">Pas de compte</a> -->
</section>`
}

const Login = {
    template: `<section class="screen" id="login">
    <h2>Super, nous allons demander les clés sur la page suivante.</h2>

    <a id="github-login" v-bind:href="href" class="btn">Connexion Github</a>
</section>`,
    data() {
        return {
            href: githubLoginHref
        }
    }
}

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


const routes = [
    {
        path: '/',
        component: Welcome,
        beforeEnter(to, from, next) {

            Promise.resolve(store.state.login).then(login => {
                const origin = `${login}.github.io`

                // TOUTDOUX : affiche une erreur, spas cool !
                //const buildStatus = makeBuildStatus(accessToken, login, origin);

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
                    d3.text(`https://api.github.com/repos/${login}/${origin}`, {
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

                            githubDangerZone.href = `https://github.com/${login}/${origin}/settings/#danger-zone`;
                        })
                })*/

                return d3.json(`https://api.github.com/repos/${login}/${origin}`, {headers: {Authorization: "token " + accessToken}})
                    .then(() => {
                        router.push("/atelier-pages");
                        // prepareAtelierPageScreen(accessToken, login, origin, buildStatus);
                    })

                    .catch(() => {
                        // ToutDoux : gérer les erreurs autres que le repo n'existe po
                        location.href = "#create-project";
                        // prepareCreateProjectScreen(accessToken, login, origin, buildStatus);

                        new Vue({
                            el: document.querySelector('#create-project'),
                            data: {
                                origin
                            },
                            methods: {
                                createProject: makeCreateProjectButtonListener(accessToken, login, origin, buildStatus)
                            }
                        })
                    })
            });

        }
    },
    {path: '/account', component: Account},
    {path: '/login', component: Login},
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

                                getPagesList(state.login, state.origin, accessToken)

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

const router = new VueRouter({
    routes // short for `routes: routes`
})

router.beforeEach((to, from, next) => {
    console.log("router.beforeEach", to, from)
    next()
})

const main = document.querySelector("main");
console.log(main)

const app = new Vue({
    router
}).$mount(main)
