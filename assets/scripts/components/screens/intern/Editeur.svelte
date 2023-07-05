<script>
  //@ts-check
  export let fileP;
  export let imageDirUrl;
  export let buildStatus;
  export let contenus = [];
  export let editionTitle;
  export let listPrefix;
  export let deleteTitle;
  export let showArticles;
  export let currentRepository;

  import { createEventDispatcher } from "svelte";
  import Skeleton from "../../Skeleton.svelte";
  import { makeFileNameFromTitle } from "../../../utils";

  let file = {
    fileName: "",
    content: "",
    previousContent: undefined,
    title: "",
    previousTitle: undefined,
  };

  fileP.then((_file) => {
    file = _file;
  });

  let deleteDisabled = true;

  let filesPath = contenus.map((contenu) => contenu.path);

  const dispatch = createEventDispatcher();

  const validateTitle = (e) => {
    const titleChanged = file.previousTitle?.trim() !== file.title.trim();
    if (
      titleChanged &&
      filesPath &&
      filesPath.includes(makeFileNameFromTitle(file.title))
    ) {
      e.target.setCustomValidity(
        "Vous avez déjà utilisé ce nom. Veuillez en choisir un autre."
      );

      return;
    }

    e.target.setCustomValidity("");
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (e.target.checkValidity()) {
      dispatch("save", {
        fileName: file.fileName,
        content: file.content.trim(),
        previousContent: file.previousContent,
        title: file.title.trim(),
        previousTitle: file.previousTitle,
      });
    }
  };

  const onBackClick = (e) => {
    if (
      file.previousContent.trim() !== file.content.trim() ||
      file.title?.trim() !== file.previousTitle?.trim()
    ) {
      if (
        !confirm(
          "Êtes-vous sûr·e de vouloir revenir en arrière ? Toutes vos modifications seront perdues."
        )
      ) {
        e.preventDefault();
      }
    }
  };
</script>

<Skeleton {currentRepository} {buildStatus} {showArticles}>
  <section class="screen">
    <h3>{editionTitle}</h3>

    {#await file}
      <img src="./assets/images/oval.svg" alt="Chargement du contenu" />
    {:then}
      <div class="wrapper">
        <form on:submit={onSubmit}>
          <div>
            <label for="title">Titre</label>
            <input
              bind:value={file.title}
              on:change={validateTitle}
              type="text"
              id="title"
              required
            />
          </div>

          <p>
            Attention, si le titre contient <code>/</code>, <code>#</code> ou
            <code>?</code>, ça peut ne pas marcher
          </p>

          <div class="accordion">
            <h4 class="label">Aide</h4>
            <details>
              <summary>Mettre en forme le contenu</summary>
              <div>
                <p>
                  Pour mettre en forme votre contenu, vous pouvez bidouiller
                  <a
                    href="https://flus.fr/carnet/markdown.html"
                    target="_blank"
                  >
                    avec du Markdown
                  </a>
                  … ou
                  <a
                    href="https://developer.mozilla.org/fr/docs/Learn/Getting_started_with_the_web/HTML_basics"
                    target="_blank"
                  >
                    apprendre le HTML
                  </a>
                </p>
              </div>
            </details>

            <details>
              <summary>Héberger des images</summary>
              <div>
                <p>
                  Pour héberger des images, nous vous avons créé
                  <a href={imageDirUrl} target="_blank"> un petit dossier </a>.
                  <br />
                  Vous pouvez y déposer vos images, récupérer le lien et mettre l'image
                  dans votre site grâce au Markdown avec
                  <!-- Utilisation de Figure pour pouvoir sélectionner facilement le code en cliquant plusieurs fois dessus -->
                  <figure>
                    ![Texte décrivant l'image](https://ladressedemonimage.png)
                  </figure>
                </p>
              </div>
            </details>
          </div>

          <div class="content">
            <label for="content">Contenu</label>
            <textarea
              bind:value={file.content}
              id="content"
              cols="30"
              rows="10"
            />
          </div>
          <div class="actions-zone">
            <a href={listPrefix} class="btn__retour" on:click={onBackClick}
              >Retour</a
            >
            <button type="submit" class="btn__medium btn"
              >Lancer la publication (~ 2 min)</button
            >
          </div>

          {#if file.fileName && file.fileName !== "index.md"}
            <div class="wrapper white-zone">
              <h3>{deleteTitle}</h3>
              <label>
                <input
                  type="checkbox"
                  on:change={() => {
                    deleteDisabled = !deleteDisabled;
                  }}
                />
                Afficher le bouton de suppression
              </label>
              <button
                type="button"
                on:click={() => dispatch("delete")}
                disabled={deleteDisabled}
                class=" btn__medium btn btn__danger"
              >
                {deleteTitle}
              </button>
            </div>
          {/if}
        </form>
      </div>
    {/await}
  </section>
</Skeleton>

<style lang="scss">
  div {
    & + p {
      margin-top: 0.4rem;
    }
  }

  .accordion {
    margin-top: 3rem;
  }

  .content {
    margin-top: 2rem;
  }

  .actions-zone {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    margin-bottom: 6rem;
    padding-right: 2rem;
    padding-left: 2rem;
  }

  .btn__retour {
    &::before {
      content: "‹";
      margin-right: 0.5rem;
    }
  }

  details {
    figure {
      padding: 0.4rem;
      font-family: monospace;
      background-color: rgba(255, 255, 255, 0.4);
    }
  }
</style>
