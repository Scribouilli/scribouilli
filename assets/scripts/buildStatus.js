//@ts-check
export default function (databaseAPI, login, repoName) {
    /** @type {"building" | "built" | "errored"} */
    let repoStatus;
    let reaction = undefined;

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
                            if (reaction) {
                                reaction(status);
                            }
                            return
                        } else if (status === "errored") {
                            console.debug("statut erroed")
                            if (reaction) {
                                reaction(status);
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