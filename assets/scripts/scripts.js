import prepareCreateProjectScreen from "./prepareCreateProjectScreen.js";
import prepareAtelierPageScreen from "./prepareAtelierPagesScreen.js";
import prepareCreatePageScreen from "./prepareCreatePageScreen.js";
import makeBuildStatus from "./buildStatus.jsprepareAtelierPageScreen";

window.Buffer = buffer.Buffer;
const client_id = "2b4ed9ba835b05f83e2d";
const destination = "https://daktary-team.github.io/scribouilli";
const redirect_url = "https://file-moi-les-clefs.herokuapp.com/gh-callback";

const githubLogin = document.querySelector("#github-login");
githubLogin.href = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=public_repo,delete_repo&redirect_uri=${redirect_url}?destination=${destination}`;

const accessToken = new URL(location).searchParams.get("access_token");

if (accessToken) {
    console.log("connecté t'as vu");

    d3.json("https://api.github.com/user", {headers: {Authorization: "token " + accessToken}})
        .then(result => {
            console.log(result);
            const login = result.login;
            const origin = `${login}.github.io`

            const buildStatus = makeBuildStatus(accessToken, login, origin);

            window.addEventListener("hashchange", () => {
                if (location.hash === '#create-project') {
                    console.log("You're visiting a cool feature!");
                    prepareCreateProjectScreen(accessToken, login, origin, buildStatus)
                }
                if (location.hash === '#atelier-create-page') {
                    prepareCreatePageScreen(accessToken, login, origin)
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
                    prepareCreateProjectScreen(accessToken, login, origin, buildStatus);
                })
        });
} else {
    console.log("bonjoir");
    location.href = "#welcome";
}
