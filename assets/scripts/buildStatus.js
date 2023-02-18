//@ts-check
export default function (databaseAPI, login, repoName) {
    /** @type {"building" | "built" | "errored"} */
    let repoStatus;
    const reactions = new Set();

    let timeout

    function scheduleCheck() {
        if (!timeout) {
            timeout = setTimeout(() => {
                buildStatusObject.checkStatus()
                timeout = undefined;
            }, 10000)
        }
    }

    const buildStatusObject = {
        get status() {
            return repoStatus;
        },
        subscribe(reaction) {
            reactions.add(reaction);

            return function unsubscribe() {
                reactions.delete(reaction);
            }
        },
        checkStatus() {
            return Promise.resolve(login).then(login => {
                return databaseAPI.getGitHubPagesSite(login, repoName).then(({ status }) => {
                    console.log('build status', status)

                    if (status === "built") {
                        databaseAPI.getLastDeployment(login, repoName).then(deployment => {
                            databaseAPI.getDeploymentStatus(deployment).then(deploymentStatus => {
                                console.debug(deploymentStatus)

                                if (!["pending", "queued", "in_progress"].includes(deploymentStatus[0].state)) {

                                    console.log("deployment done", deploymentStatus[0].state)
                                    repoStatus = "built"
                                    return
                                }
                            })
                        })
                    }
                    scheduleCheck()
                })
                    .catch(error => {
                        repoStatus = 'errored'
                        for (const reaction of reactions) {
                            reaction(repoStatus);
                        }
                    })
            })
        }
    }

    buildStatusObject.checkStatus();
    return buildStatusObject
}