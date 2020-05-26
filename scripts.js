/*import { Octokit } from './node_modules/@octokit/rest/dist-web/index.js';

console.log(Octokit);*/

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

            const deleteButton = document.querySelector("#atelier-parametres .delete-repo");
            deleteButton.addEventListener("click", () => {
                d3.text(`https://api.github.com/repos/${login}/${origin}`, {
                    headers: {Authorization: "token " + accessToken},
                    method: "DELETE"
                })
                    .then(() => {
                        // TOUTDOUX : ça n'y va pas ! Hypothèse, le delete retourne http204 sans contenu donc le
                        // JSON.parse échoue
                        console.log("on passe par là ?")
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

                    const projectNameElements = document.querySelectorAll("#atelier-pages .project-name, #atelier-articles .project-name, #atelier-parametres .project-name");
                    const repoName = origin;
                    const publishedWebsiteURL = `https://${repoName}/`;
                    for (const projectNameElement of projectNameElements) {
                        projectNameElement.textContent = publishedWebsiteURL;
                        projectNameElement.href = publishedWebsiteURL;
                    }

                })
                .catch(() => {
                    // ToutDoux : gérer les erreurs autres que le repo n'existe po
                    location.href = "#create-project";

                    const originElement = document.querySelector("#create-project .origin");
                    originElement.textContent = origin;

                    const repoName = origin; // per Github pages convention
                    const publishedWebsiteURL = `https://${repoName}/`;
                    const button = document.querySelector("#create-project .submit");
                    button.addEventListener("click", () => {
                        d3.json("https://api.github.com/user/repos", {
                            headers: {Authorization: "token " + accessToken},
                            method: "POST",
                            body: JSON.stringify(
                                {
                                    name: repoName,
                                    homepage: publishedWebsiteURL,
                                    has_issues: false,
                                    has_projects: false,
                                    has_wiki: false,
                                    auto_init: false
                                }
                            )
                        })
                            .then(() => {
                                location.href = "#youpi";
                                const LinkWebsite = document.querySelector("#youpi .show-site");
                                LinkWebsite.href = publishedWebsiteURL;
                            })
                    })
                })
        });
} else {
    console.log("bonjoir");
    location.href = "#welcome";
}
