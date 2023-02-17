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

        <div>
          <label for="content">Contenu</label>
          <p>
            Pour mettre en forme votre contenu, vous pouvez bidouiller <a
              href="https://flus.fr/carnet/markdown.html">avec du Markdown</a
            >.
          </p>
          <textarea bind:value={content} id="content" cols="30" rows="10" />
        </div>
        <button type="submit" class=" btn__medium btn">Enregistrer la page</button>

        <h2>Settings</h2>
        <a href="./atelier-list-pages" class="btn__retour">Retour</a>
        {#if sha}
          <label>
            <input
              type="checkbox"
              on:change={() => {
                deleteDisabled = !deleteDisabled;
              }}
            />
            Activer la suppression du site
          </label>
          <button
            type="button"
            on:click={dispatch("delete", { sha })}
            disabled={deleteDisabled}
            class=" btn__medium btn">Supprimer la page</button
          >
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

    &:not(:first-child) {
      margin-top: 4rem;
    }
  }
  .btn {
    margin-top: 1rem;
  }

  a {
    margin-left: 1rem;
  }
</style>
