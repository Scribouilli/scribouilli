export default function (accessToken, login, origin) {
    const form = document.querySelector("#atelier-create-page form");
    form.addEventListener("submit", ()=> {
        const title = form.querySelector("#title").value;
        const content = form.querySelector("#content").value;

        d3.json(`https://api.github.com/repos/${login}/${origin}/contents/${title}.md`, {
            headers: {Authorization: "token " + accessToken},
            method: "PUT",
            body: JSON.stringify(
                {
                    message: `création de la page ${title},
                    content: btoa(
                        `${content}`
                    )
                }
            )
        }
    });
}


