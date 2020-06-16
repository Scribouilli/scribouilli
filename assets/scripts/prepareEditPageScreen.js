import prepareAtelierPageScreen from "./prepareAtelierPagesScreen.js";

export default function prepareEditPageScreen(accessToken, login, origin, {sha, path}) {
    const titrePage = document.querySelector("#atelier-edit-page .titre-page");
    const deleteButton = document.querySelector("#atelier-edit-page .delete-page");

    titrePage.textContent = path;

    deleteButton.addEventListener("click", () => {
        d3.json(`https://api.github.com/repos/${login}/${origin}/contents/${path}`, {
                headers: {Authorization: "token " + accessToken},
                method: "DELETE",
                body: JSON.stringify(
                    {
                        message: `suppression de la page ${path}`,
                        sha
                    }
                )
            }
        )
            .then(
                location.href = "#atelier-pages",
                prepareAtelierPageScreen(accessToken, login, origin)
            )
    })
}