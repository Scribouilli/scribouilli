/*import { Octokit } from './node_modules/@octokit/rest/dist-web/index.js';

console.log(Octokit);*/

const client_id = "2b4ed9ba835b05f83e2d";
const destination = "https://daktary-team.github.io/scribouilli";
const redirect_url = "https://file-moi-les-clefs.herokuapp.com/gh-callback";

const githubLogin = document.querySelector("#github-login");
githubLogin.href = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=public_repo&redirect_uri=${redirect_url}?destination=${destination}`;

const accessToken = new URL(location).searchParams.get("access_token");

if (accessToken) {
    console.log("connecté t'as vu");
    location.href = "#create-project";


    fetch("https://api.github.com/user", {headers: {Authorization: "token " + accessToken}})
        .then(r => r.json())
        .then(result => {
            console.log(result);
            const login = result.login;
            const loginElement = document.querySelector("#create-project .login");
            loginElement.textContent = login;
        })
        .then(()=> {
            const button = document.querySelector("#create-project .submit");
            button.addEventListener("click", ()=>{
                // Là on va créer et faire des trucs magiques avec Github
            })
        })
        } else {
    console.log("bonjoir");
    location.href = "#welcome";
}
