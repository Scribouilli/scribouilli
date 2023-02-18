//@ts-check

/*

Pas d'étoile inutile

Tant que le répo ne déploi pas, le status vaut `null`

Quand un build est annulé par un nouveau commit, 
l'API de statut retourne d'abord une erreur et plus tard, `building` puis `built`



Peut-être que l'on pourrait changer de stratégie et utiliser

`await octokit.request('GET /repos/{owner}/{repo}/deployments'` avec un 1 per_page

Puis, récupérer     "statuses_url": "https://api.github.com/repos/octocat/example/deployments/1/statuses", 

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


*/
export default function (databaseAPI, login, repoName) {
    /** @type {"building" | "built" | "errored"} */
    let buildStatus;
    const reactions = new Set();

    let timeout

    function scheduleCheck() {
        if (!timeout) {
            timeout = setTimeout(() => {
                buildStatusObject.checkStatus()
                timeout = undefined;
            }, 5000)
        }
    }

    const buildStatusObject = {
        get status() {
            return buildStatus;
        },
        subscribe(reaction) {
            reactions.add(reaction);

            return function unsubscribe() {
                reactions.delete(reaction);
            }
        },
        checkStatus() {
            return Promise.resolve(login).then(login => {
               
                databaseAPI.getGitHubPagesSite(login, repoName)
                    // @ts-ignore
                    .then(({status}) => {
                        console.log('build status', status)
                        buildStatus = status;

                        for (const reaction of reactions) {
                            reaction(status);
                        }

                        if (status === 'built' || status === 'errored') {
                            return;
                        }

                        scheduleCheck()
                    })
                    .catch(error => {
                        buildStatus = 'errored'
                        for (const reaction of reactions) {
                            reaction(buildStatus);
                        }
                    })
                })
        }
    }

    buildStatusObject.checkStatus();
    return buildStatusObject
}