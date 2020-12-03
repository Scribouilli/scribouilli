/*import { makeCreateProjectButtonListener } from "./prepareCreateProjectScreen.js";
import prepareAtelierPageScreen from "./prepareAtelierPagesScreen.js";
import prepareCreatePageScreen from "./prepareCreatePageScreen.js";
import makeBuildStatus from "./buildStatus.js";
import prepareAtelierPagesScreen from "./prepareAtelierPagesScreen.js";*/

Vue.use(VueRouter);
window.Buffer = buffer.Buffer;
const client_id = "2b4ed9ba835b05f83e2d";
const destination = "https://daktary-team.github.io/scribouilli";
const redirect_url = "https://file-moi-les-clefs.herokuapp.com/gh-callback";

const githubLoginHref =
    `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=public_repo,delete_repo&redirect_uri=${redirect_url}?destination=${destination}`;

// const accessToken = new URL(location).searchParams.get("access_token");

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

const routes = [
    {path: '/', component: Welcome},
    {path: '/account', component: Account},
    {path: '/login', component: Login}
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


if (accessToken) {
    console.log("connecté t'as vu");

    d3.json("https://api.github.com/user", {headers: {Authorization: "token " + accessToken}})
        .then(result => {
            console.log(result);
            const login = result.login;
            const origin = `${login}.github.io`

            // TOUTDOUX : affiche une erreur, spas cool !
            const buildStatus = makeBuildStatus(accessToken, login, origin);

            window.addEventListener("hashchange", () => {
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
                    /* TOUTDOUX : à tester */
                    console.log("Atelier-page hash")
                    prepareAtelierPagesScreen(accessToken, login, origin, buildStatus)
                }
            })

            const deleteButton = document.querySelector("#atelier-parametres .delete-repo");
            deleteButton.addEventListener("click", () => {
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
            })

            return d3.json(`https://api.github.com/repos/${login}/${origin}`, {headers: {Authorization: "token " + accessToken}})
                .then(() => {
                    location.href = "#atelier-pages";
                    prepareAtelierPageScreen(accessToken, login, origin, buildStatus);
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
} else {
    console.log("bonjoir");
    location.href = "#welcome";

}

