import prepareAtelierPageScreen from "./prepareAtelierPagesScreen.js";

function makeDeleteProjectButtonListener(accessToken, login, origin, {sha, path}) {
    return () => {
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
            .then(() => {
                    location.href = "#atelier-pages",
                        prepareAtelierPageScreen(accessToken, login, origin)
                }
            )
    }
};

let currentlyAttachedListener = undefined;

export default function prepareEditPageScreen(accessToken, login, origin, {sha, path}) {
    const titrePage = document.querySelector("#atelier-edit-page .titre-page");
    const button = document.querySelector("#atelier-edit-page .delete-page");

    titrePage.textContent = path;

    if (currentlyAttachedListener) {
        button.removeEventListener("click", currentlyAttachedListener);
    }

    const buttonListener = makeDeleteProjectButtonListener(accessToken, login, origin, {sha, path});

    button.addEventListener("click", buttonListener);
    currentlyAttachedListener = buttonListener;
}