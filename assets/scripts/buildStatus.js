export default function (accessToken, login, repoName) {
    let buildStatus;
    const reactions = new Set();

    let timeout

    function scheduleCheck(){
        if(!timeout){
            timeout = setTimeout(() => {
                buildStatusObject.checkStatus()
                timeout = undefined;
            }, 1000)
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
            return Promise.resolve(login).then(login => 
                d3.json(`https://api.github.com/repos/${login}/${repoName}/pages`, {
                    headers: {Authorization: "token " + accessToken}
                }))
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
                    /*if(error.message === "404 Not Found"){
                        scheduleCheck()
                        return;
                    }*/
                    buildStatus = 'errored'
                    for (const reaction of reactions) {
                        reaction(buildStatus);
                    }
                })
        }
    }
    buildStatusObject.checkStatus();
    return buildStatusObject
}