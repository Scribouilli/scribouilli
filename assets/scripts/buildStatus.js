export default function (accessToken, login, origin) {
    let buildStatus;
    const reactions = new Set();

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
            return d3.json(`https://api.github.com/repos/${login}/${origin}/pages`, {
                headers: {Authorization: "token " + accessToken}
            })
                .then(({status}) => {
                    console.log('build status', status)
                    buildStatus = status;

                    for (const reaction of reactions) {
                        reaction(status);
                    }

                    if (status === 'built') {
                        return;
                    }
                    if (status === 'errored') {
                        return;
                    }

                    setTimeout(buildStatusObject.checkStatus, 1000)
                })
        }
    }
    return buildStatusObject
}