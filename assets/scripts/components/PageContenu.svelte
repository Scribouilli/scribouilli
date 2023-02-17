<script>
  export let title;
  export let content;
  export let sha;
  export let publishedWebsiteURL;

  import { createEventDispatcher } from "svelte";
  import Skeleton from "./Skeleton.svelte";

  $: deleteDisabled = true;

  const dispatch = createEventDispatcher();

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch("save", { content, title, sha });
  };
</script>

<Skeleton {publishedWebsiteURL}>
  <section class="screen">
    <h3>Édition d'une page</h3>

    <div class="wrapper">
      <form on:submit={onSubmit}>
        <div>
          <label for="title">Titre</label>
          <input bind:value={title} type="text" id="title" />
        </div>

        <p>
          Attention, si le titre contient <code>/</code>, <code>#</code> ou
          <code>?</code>, ça peut ne pas marcher
        </p>

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
          <button type="submit" class=" btn__medium btn">Enregistrer la page</button>
        </div>

        {#if sha}
          <div class="wrapper delete-zone">
            <h3>Suppression</h3>
            <label>
              <input
                type="checkbox"
                on:change={() => {
                  deleteDisabled = !deleteDisabled;
                }}
              />
              Activer la suppression de la page
            </label>
            <button
              type="button"
              on:click={dispatch("delete", { sha })}
              disabled={deleteDisabled}
              class=" btn__medium btn">Supprimer la page</button>
          </div>
        {/if}
      </form>
    </div>
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
      content: '‹';
      margin-right: .5rem;
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
