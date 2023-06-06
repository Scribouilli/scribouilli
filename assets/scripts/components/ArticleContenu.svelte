<script>
  export let fileName;
  export let title;
  export let content;
  export let imageDirUrl;
  export let previousContent;
  export let previousTitle;
  export let sha;
  export let publishedWebsiteURL;
  export let buildStatus;
  export let articlesP;
  export let makeFileNameFromTitle;

  import { createEventDispatcher } from "svelte";
  import Skeleton from "./Skeleton.svelte";

  $: deleteDisabled = true;

  let filesPath = undefined;

  const dispatch = createEventDispatcher();

  articlesP.then((articles) => {
    if (articles ) {
      filesPath = articles.map((article) => article.path);
    }
  });

  const validateTitle = (e) => {
    const titleChanged =
      (sha === "" || previousTitle) && previousTitle?.trim() !== title.trim();
    if (titleChanged && filesPath && filesPath.includes(makeFileNameFromTitle(title))) {
      e.target.setCustomValidity(
        "Vous avez déjà utilisé ce nom pour un autre article. Veuillez en choisir un autre."
      );

      return;
    }

    e.target.setCustomValidity("");
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (e.target.checkValidity()) {
      dispatch("save", {
        fileName: fileName,
        content: content.trim(),
        previousContent,
        title: title?.trim(),
        previousTitle,
        sha,
      });
    }
  };

  const onBackClick = (e) => {
    if (
      previousContent.trim() !== content.trim() ||
      title?.trim() !== previousTitle?.trim()
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

<Skeleton {publishedWebsiteURL} {buildStatus}>
  <section class="screen">
    <h3>Édition d'un article</h3>

    {#await articlesP}
      <img src="./assets/images/oval.svg" alt="Chargement du contenu" />
    {:then}
      <div class="wrapper">
        <form on:submit={onSubmit}>
          <div>
            <label for="title">Titre</label>
            <input
              bind:value={title}
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
                  <a href="https://flus.fr/carnet/markdown.html" target="_blank">
                    avec du Markdown
                  </a>
                  … ou
                  <a href="https://developer.mozilla.org/fr/docs/Learn/Getting_started_with_the_web/HTML_basics" target="_blank">
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
                  <a href={imageDirUrl} target="_blank">
                    un petit dossier
                  </a>.
                  <br />
                  Vous pouvez y déposer vos images, récupérer le lien et mettre l'image dans votre article grâce au Markdown avec
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
            <textarea bind:value={content} id="content" cols="30" rows="10" />
          </div>
          <div class="actions-zone">
            <a
              href="./atelier-list-articles"
              class="btn__retour"
              on:click={onBackClick}>Retour</a
            >
            <button type="submit" class="btn__medium btn"
              >Lancer la publication (~ 2 min)</button
            >
          </div>

          {#if sha && fileName && fileName !== "index.md"}
            <div class="wrapper white-zone">
              <h3>Supprimer l'article</h3>
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
                on:click={dispatch("delete", { sha })}
                disabled={deleteDisabled}
                class=" btn__medium btn btn__danger"
              >
                Supprimer l'article
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
      background-color: rgba(255,255,255,.4);
    }
  }
</style>
