import {json} from 'd3-fetch'


export default function makeCreateProjectButtonListener(accessToken, login, origin, repoName, buildStatus) {
    const publishedWebsiteURL = `https://${origin}/${repoName}`;

    return () => Promise.resolve(login)
        .then(login  => 
            json("https://api.github.com/user/repos", {
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
                return json("https://api.github.com/repos/daktary-team/coup-de-pinceau/contents/index.md", {
                    headers: {Authorization: "token " + accessToken}
                })
                    .then(({content}) => {
                        return json(`https://api.github.com/repos/${login}/${repoName}/contents/index.md`, {
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
                return json(`https://api.github.com/repos/${login}/${repoName}/contents/_config.yml`, {
                    headers: {Authorization: "token " + accessToken},
                    method: "PUT",
                    body: JSON.stringify(
                        {
                            message: "crée le _config.yml",
                            content: Buffer.from(`theme: jekyll-theme-cayman`).toString('base64')
                        }
                    )
                })
            })

            .then(() => {
                return json(`https://api.github.com/repos/${login}/${repoName}/contents/example.md`, {
                    headers: {Authorization: "token " + accessToken},
                    method: "PUT",
                    body: JSON.stringify(
                        {
                            message: "création de la page d'exemple",
                            content: Buffer.from(
                                '---\n---\n\n# Exemple de titre\n\n' +
                                'Hey ! Voici un contenu en [markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#table-of-contents)'
                            ).toString('base64')
                        }
                    )
                })
            })

            .then(() => {
                return json(`https://api.github.com/repos/${login}/${repoName}/pages`, {
                    headers: {Authorization: "token " + accessToken},
                    method: "POST",
                    body: JSON.stringify( { source: {branch: 'main' } } )
                })
            })

            .then(() => {

                return new Promise((resolve, reject) => {
                    const unsubscribe = buildStatus.subscribe(newStatus => {
                        if (newStatus === 'built') {
                            resolve();
                            unsubscribe();
                            return;
                        }
                        if (newStatus === 'errored') {
                            reject();
                            unsubscribe();
                            return;
                        }
                    });

                    buildStatus.checkStatus();
                })
            })

            .then(() => {
                return publishedWebsiteURL;
            })
    
        )
}
