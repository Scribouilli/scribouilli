export default function prepareAtelierPageScreen(accessToken, login, origin) {
    const projectNameElements = document.querySelectorAll("#atelier-pages .project-name, #atelier-articles .project-name, #atelier-parametres .project-name");
    const repoName = origin;
    const publishedWebsiteURL = `https://${repoName}/`;

    for (const projectNameElement of projectNameElements) {
        projectNameElement.textContent = publishedWebsiteURL;
        projectNameElement.href = publishedWebsiteURL;
    }

    d3.json(`https://api.github.com/repos/${login}/${origin}/commits`, {
        headers: {Authorization: "token " + accessToken}
    })
        .then(
            commits => {
                const firstCommit = commits[0];
                const {sha} = firstCommit;

                d3.json(`https://api.github.com/repos/${login}/${origin}/git/trees/${sha}`, {
                    headers: {Authorization: "token " + accessToken}
                })
                    .then(
                        ({tree}) => {
                            console.log(tree);
                            const pageFiles = tree.filter(f => {
                                return f.type === "blob" && (f.path.endsWith(".md") || f.path.endsWith(".html"))
                            })
                            console.log(pageFiles);

                            const pagesList = document.querySelector("#atelier-pages .pages-list");
                            for (const pageFile of pageFiles) {
                                const li = document.createElement("li");
                                li.textContent = pageFile.path;
                                pagesList.append(li);
                            }
                        }
                    )
            }
        )
}