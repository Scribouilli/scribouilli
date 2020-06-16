function makeCreateProjectButtonListener(accessToken, login, origin) {
    const repoName = origin; // per Github pages convention
    const publishedWebsiteURL = `https://${repoName}/`;

    return () => {
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
                return d3.json("https://api.github.com/repos/daktary-team/coup-de-pinceau/contents/index.md", {
                    headers: {Authorization: "token " + accessToken}
                })
                    .then(({content}) => {
                        return d3.json(`https://api.github.com/repos/${login}/${origin}/contents/index.md`, {
                            headers: {Authorization: "token " + accessToken},
                            method: "PUT",
                            body: JSON.stringify(
                                {
                                    message: "crée le index.md",
                                    content
                                }
                            )
                        })
                    })
            })

            .then(() => {
                return d3.json(`https://api.github.com/repos/${login}/${origin}/contents/_config.yml`, {
                    headers: {Authorization: "token " + accessToken},
                    method: "PUT",
                    body: JSON.stringify(
                        {
                            message: "crée le _config.yml",
                            content: btoa(`theme: jekyll-theme-cayman`)
                        }
                    )
                })
            })

            .then(() => {
                return d3.json(`https://api.github.com/repos/${login}/${origin}/contents/example.md`, {
                    headers: {Authorization: "token " + accessToken},
                    method: "PUT",
                    body: JSON.stringify(
                        {
                            message: "création de la page d'exemple",
                            content: btoa(
                                '---\n---\n\n# Exemple de titre\n\n' +
                                'Hey ! Voici un contenu en [markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#table-of-contents)'
                            )
                        }
                    )
                })
            })

            .then(() => {
                return new Promise((resolve, reject) => {

                    (function checkIfBuilt() {
                        return d3.json(`https://api.github.com/repos/${login}/${origin}/pages`, {
                            headers: {Authorization: "token " + accessToken}
                        })
                            .then(({status}) => {
                                console.log('build status', status)
                                if (status === 'built') {
                                    resolve()
                                    return;
                                }
                                if (status === 'errored') {
                                    reject(new Error('Github pages build error'))
                                    return;
                                }

                                setTimeout(checkIfBuilt, 500)
                            })
                            .catch(reject)
                    })()
                })
            })

            .then(() => {
                location.href = "#youpi";
                const LinkWebsite = document.querySelector("#youpi .show-site");
                LinkWebsite.href = publishedWebsiteURL;
            })
    }
}

let currentlyAttachedListener = undefined;

export default function (accessToken, login, origin) {
    const originElement = document.querySelector("#create-project .origin");
    originElement.textContent = origin;
    const button = document.querySelector("#create-project .submit");

    if (currentlyAttachedListener) {
        button.removeEventListener("click", currentlyAttachedListener);
    }

    const buttonListener = makeCreateProjectButtonListener(accessToken, login, origin);

    button.addEventListener("click", buttonListener);
    currentlyAttachedListener = buttonListener;
}