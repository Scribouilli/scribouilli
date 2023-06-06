import { json } from 'd3-fetch'
import DatabaseAPI from './DatabaseAPI'



const index_page_content = `---
title: Accueil
---
# L'Échappée Belle

L'Échappée Belle est **une association** qui a pour objet de soutenir et promouvoir des activités et des personnes qui travaillent autour de **valeurs de consentement, de bien commun et de prendre soin des personnes et de l’environnement**.
`


const activites_page_content = `---
title: Activités
---
L’association cherche à œuvrer en collaboration avec des organismes publics, des organisations privées et des individus.

## Nos activités

A titre indicatif, les activités commerciales possibles sont (liste non-exhaustive) :

- Accompagnement à la **création de structures** juridiques
- Conception, développement et accompagnement de **produits innovants**
- **Formation** d’enfants et d’adultes, par exemple dans les domaines de la communication non-violente, méthodologie lean et approche agile, les relations aux animaux, l’alimentation, la gestion de budget familial ou d’entreprise…
- Projets à **impact environnemental positif**
- Projets à **impact social positif**
- Vente d’objets ou de denrées alimentaires, avec **impact humain ou environnemental positif**

`

const contact_page_content = `---
title: Contact
---
L'Échappée Belle est actuellement composée de 5 membres.

Pour nous contacter : [coucou@lechappeebelle.team](mailto:coucou@lechappeebelle.team)
`

const images_readme_content = `
Dans ce dossier, vous pouvez **glisser vos images** ou les ajouter via le bouton "Add file" -> "Upload file" en haut à droite.\\
Ensuite, vous pouvez faire un clic droit **sur l'image** pour récupérer son lien et ensuite l'afficher en Markdown.
`

const custom_styles_content = `
:root {
    --couleur-primaire : #2a6442;
}
`

export default function makeCreateProjectButtonListener(accessToken, login, origin, repoName, buildStatus) {
    const publishedWebsiteURL = `https://${origin}/${repoName}`;

    const databaseAPI = new DatabaseAPI(accessToken)

    return () => Promise.resolve(login)
        .then(login =>
            json("https://api.github.com/user/repos", {
                headers: { Authorization: "token " + accessToken },
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
                    return json(`https://api.github.com/repos/${login}/${repoName}/contents/_config.yml`, {
                        headers: { Authorization: "token " + accessToken },
                        method: "PUT",
                        body: JSON.stringify(
                            {
                                message: "crée le _config.yml",
                                content: Buffer.from(`remote_theme: scribouilli/mimoza`).toString('base64')
                            }
                        )
                    })
                })
                .then(() => {
                    return json(`https://api.github.com/repos/${login}/${repoName}/contents/index.md`, {
                        headers: { Authorization: "token " + accessToken },
                        method: "PUT",
                        body: JSON.stringify(
                            {
                                message: "création de la page index",
                                content: Buffer.from(index_page_content).toString('base64')
                            }
                        )
                    })
                })
                .then(() => {
                    return json(`https://api.github.com/repos/${login}/${repoName}/contents/activites.md`, {
                        headers: { Authorization: "token " + accessToken },
                        method: "PUT",
                        body: JSON.stringify(
                            {
                                message: "création de la page activites",
                                content: Buffer.from(activites_page_content).toString('base64')
                            }
                        )
                    })
                })
                .then(() => {
                    return json(`https://api.github.com/repos/${login}/${repoName}/contents/contact.md`, {
                        headers: { Authorization: "token " + accessToken },
                        method: "PUT",
                        body: JSON.stringify(
                            {
                                message: "création de la page contact",
                                content: Buffer.from(contact_page_content).toString('base64')
                            }
                        )
                    })
                })
                .then(() => {
                    return json(`https://api.github.com/repos/${login}/${repoName}/contents/images/readme.md`, {
                        headers: { Authorization: "token " + accessToken },
                        method: "PUT",
                        body: JSON.stringify(
                            {
                                message: "création du dossier images",
                                content: Buffer.from(images_readme_content).toString('base64')
                            }
                        )
                    })
                })
                 .then(() => {
                    return json(`https://api.github.com/repos/${login}/${repoName}/contents/_posts/.gitkeep`, {
                        headers: { Authorization: "token " + accessToken },
                        method: "PUT",
                        body: JSON.stringify(
                            {
                                message: "création du dossier _posts pour le blog",
                                content: Buffer.from(images_readme_content).toString('base64')
                            }
                        )
                    })
                })
                .then(() => {
                    return databaseAPI.createCustomCSS(login, repoName, custom_styles_content)
                })

                .then(() => {
                    return json(`https://api.github.com/repos/${login}/${repoName}/pages`, {
                        headers: { Authorization: "token " + accessToken },
                        method: "POST",
                        body: JSON.stringify({ source: { branch: 'main' } })
                    })
                })

                .then(() => {

                    return new Promise((resolve, reject) => {
                        buildStatus.subscribe((newStatus) => {
                                console.debug("newStatus", newStatus)
                                if (newStatus === 'built') {
                                    resolve();
                                    return;
                                }
                                if (newStatus === 'errored') {
                                    reject();
                                    return;
                                }
                            }
                        );
                        buildStatus.checkStatus();
                    })
                })

                .then(() => {
                    return publishedWebsiteURL;
                })

        )
}
