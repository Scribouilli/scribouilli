//@ts-check


/*

Pas d'étoile 


Tant que le répo ne déploi pas, le status vaut `null`
Quand un build est annulé par un nouveau commit, 

l'API de statut retourne d'abord une erreur et plus tard, `building` puis `built`

Quand on viens de commité et qu'on interroge l'API `/pages` 
elle nous réponds d'abord que c'est built (parce que le nouveau build n'a pas commencé).

https://docs.github.com/en/rest/pages?apiVersion=2022-11-28#get-a-github-pages-site

Peut-être que l'on pourrait changer de stratégie et utiliser
`await octokit.request('GET /repos/{owner}/{repo}/deployments'` avec un 1 per_page

Puis, récupérer

"statuses_url": "https://api.github.com/repos/octocat/example/deployments/1/statuses", 
pour ensuite faire du polling dessus, et récupérer la propriété state 

    "state": {
        "description": "The state of the status.",
        "enum": [
          "error",
          "failure",
          "inactive",
          "pending",
          "success",
          "queued",
          "in_progress"
        ]
    }


Mais les déploiements ne nous informe pas du build, mais uniquement du déploiement.

*/
export default function (databaseAPI, login, repoName) {
    /** @type {"building" | "built" | "errored"} */
    let repoStatus = "building";
    let reaction = undefined;
    let lastSuccessCheck;
    let lastErrorCheck;
    let timeout

    function scheduleCheck(delay = 5000) {
        if (!timeout) {
            timeout = setTimeout(() => {
                buildStatusObject.checkStatus()
                timeout = undefined;
            }, delay)
        }
    }

    const buildStatusObject = {
        get status() {
            return repoStatus;
        },
        subscribe(callback) {
            console.log("subscribe reaction.. ", callback)
            reaction = callback;
        },
        checkStatus() {
            return Promise.resolve(login).then(login => {
                return databaseAPI.getGitHubPagesSite(login, repoName)
                    .then(({ status }) => {
                        console.log('build status', status)

                        if (status === "built") {
                            console.debug("statut built")
                            repoStatus = "built"
                            if (reaction) {
                                reaction(repoStatus);
                            }
                            return
                        } else if (status === "errored") {
                            console.debug("statut erroed")
                            repoStatus = "errored"
                            if (reaction) {
                                reaction(repoStatus);
                            }
                            return
                        } else if (status === "building") {
                            console.debug("statut building")
                            repoStatus = "building"
                            if (reaction) {
                                reaction(repoStatus);
                            }
                            return
                        } else {
                            // null
                            console.debug("statut not built")
                            repoStatus = "building"
                            if (reaction) {
                                reaction(repoStatus);
                            }
                            scheduleCheck()
                        }
                    })
                    .catch(error => {
                        repoStatus = 'errored'
                        if (reaction) {
                            reaction(repoStatus);
                        }
                    })

            })
        },
        checkStatusWithConfirmation() {
            return Promise.resolve(login).then(login => {
                return databaseAPI.getGitHubPagesSite(login, repoName)
                    .then(({ status }) => {
                        console.log('build status', status)

                        if (status === "built") {
                            console.debug("statut built")

                            if (!lastSuccessCheck) {
                                lastSuccessCheck = true
                                if (reaction) {
                                    /*
                                        Parce que parfois on check trop vite après un commit
                                        le nouveau build n'est pas commencé
                                        et l'API répond `built` parce qu'elle n'est pas encore au courant du nouveau build

                                        Donc on reçoit `built` mais on informe de `building` en attendant une confirmation
                                    */
                                    reaction("building");
                                }
                                scheduleCheck(10000)
                            } else {
                                lastSuccessCheck = undefined
                                if (reaction) {
                                    /*
                                        Après deux succès consécutif, on pense que c'est bon, que c'est « bien » built
                                    */
                                    reaction(status);
                                }
                            }
                            return
                        } else if (status === "errored") {
                            console.debug("statut erroed")


                            if (!lastErrorCheck) {
                                lastErrorCheck = true
                                if (reaction) {
                                    /*
                                        Parce que parfois un build est intérrompu par une nouvelle demande de build
                                        l'API répond une erreur.

                                        Donc on ment en disant que c'est en cours,
                                        et on attend un deuxième retour que le build et en erreur
                                    */
                                    reaction("building");
                                }
                                scheduleCheck(10000)
                            } else {
                                lastErrorCheck = undefined
                                if (reaction) {
                                    /*
                                        Après deux erreur consécutives, on pense que c'est bon, que c'est « bien » en erreur
                                    */
                                    reaction(status);
                                }
                            }


                            return
                        } else if (status === "building") {
                            console.debug("statut building")
                            if (reaction) {
                                reaction(status);
                            }
                            return
                        } else {
                            // null
                            console.debug("statut not built")
                            scheduleCheck()
                        }
                    })
                    .catch(error => {
                        repoStatus = 'errored'
                        if (reaction) {
                            reaction(repoStatus);
                        }
                    })
            })
        }
    }

    buildStatusObject.checkStatus();
    return buildStatusObject
}