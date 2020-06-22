function makeFileNameFromTitle(title) {
    const fileName = title.replace(/\/|#|\?/g, "-") // replace url confusing characters
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accent because GH pages triggers file download
        + ".md";

    return fileName;
}

function makeFrontMatterYAMLJsaisPasQuoiLa(title) {
    return [
        "---",
        "title: " + title,
        "---"
    ].join("\n")
}

export default function (accessToken, login, origin) {
    const form = document.querySelector("#atelier-create-page form");
    form.addEventListener("submit", (event) => {
            event.preventDefault();

            const title = form.querySelector("#title").value;
            const content = form.querySelector("#content").value || "(Votre contenu)";
            const fileName = makeFileNameFromTitle(title);

            d3.json(`https://api.github.com/repos/${login}/${origin}/contents/${fileName}`, {
                    headers: {Authorization: "token " + accessToken},
                    method: "PUT",
                    body: JSON.stringify(
                        {
                            message: `création de la page ${title}`,
                            content: Buffer.from(`${makeFrontMatterYAMLJsaisPasQuoiLa(title)}\n\n${content}`).toString('base64')
                        }
                    )
                }
            )
        }
    );
}
