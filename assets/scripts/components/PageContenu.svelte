<script>
  export let fileName
  export let title;
  export let content;
  export let previousContent;
  export let previousTitle;
  export let sha;
  export let publishedWebsiteURL;
  export let buildStatus;
  export let pagesP;
  export let makeFileNameFromTitle;

  import { createEventDispatcher } from "svelte";
  import Skeleton from "./Skeleton.svelte";

  $: deleteDisabled = true;

  let filesPath = undefined;

  const dispatch = createEventDispatcher();

  pagesP.then((pages) => {
    filesPath = pages.map((page) => page.path);
  });

  const validateTitle = (e) => {
    const titleChanged = (sha === "" || previousTitle) && previousTitle?.trim() !== title.trim();
    if (titleChanged && filesPath.includes(makeFileNameFromTitle(title))) {
      e.target.setCustomValidity(
        "Vous avez déjà utilisé ce nom pour une autre page. Veuillez en choisir un autre."
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
</script>

<Skeleton {publishedWebsiteURL} {buildStatus}>
  <section class="screen">
    <h3>Édition d'une page</h3>

    {#await pagesP}
      <img src="./assets/images/oval.svg" alt="Chargement du contenu" />

    {:then}
    <div class="wrapper">
      <form on:submit={onSubmit}>
        {#if (!sha && !title) || (title && makeFileNameFromTitle(title).path !== "index.md")}
          <div>
            <label for="title">Titre</label>
            <input bind:value={title} on:change={validateTitle} type="text" id="title" required />
          </div>

          <p>
            Attention, si le titre contient <code>/</code>, <code>#</code> ou
            <code>?</code>, ça peut ne pas marcher
          </p>
        {/if}

        <div class="content">
          <label for="content">Contenu</label>
          <p>
            Pour mettre en forme votre contenu, vous pouvez bidouiller
            <a href="https://flus.fr/carnet/markdown.html">avec du Markdown</a>.
          </p>
          <textarea bind:value={content} id="content" cols="30" rows="10" />
        </div>
        <div class="actions-zone">
          <a href="./atelier-list-pages" class="btn__retour">Retour</a>

          <button type="submit" class="btn__medium btn">Enregistrer la page</button>
        </div>

        {#if sha && title && makeFileNameFromTitle(title).path !== "index.md"}
          <div class="wrapper delete-zone">
            <h3>Suppression</h3>
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
              class=" btn__medium btn"
            >
              Supprimer la page
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
      margin-top: 0.2rem;
    }
  }

  .content {
    margin-top: 4rem;
  }

  .actions-zone {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding-right: 2rem;
    padding-left: 2rem;
  }

  .btn__retour {
    &::before {
      content: "‹";
      margin-right: 0.5rem;
    }
  }

  .delete-zone {
    margin-top: 12rem;
    margin-bottom: 2rem;
    background: none;
    border: 4px solid white;

    h3 {
      margin-top: 0;
    }
  }
</style>
