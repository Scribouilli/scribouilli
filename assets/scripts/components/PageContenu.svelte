<script>
  export let title;
  export let content;
  export let sha;

  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch("save", { content, title, sha });
  };
</script>

<section class="screen">
  <h3>Édition d'une page</h3>

  <div class="wrapper">
    <form on:submit={onSubmit}>
      <div>
        <label for="title">Titre</label>
        <input bind:value={title} type="text" id="title" />
      </div>

      <p>
        Attention, si le titre contient <code>/</code>, <code>#</code> ou <code>?</code>, ça peut ne pas marcher
      </p>

      <div>
        <label for="content">Contenu</label>
        <textarea bind:value={content} id="content" cols="30" rows="10" />
      </div>
      <button type="submit" class=" btn__medium btn">Enregistrer la page</button>
      <a href="/atelier-list-pages">Retour</a>
    </form>
  </div>
</section>

<style lang="scss">
    div {
        & + p {
            margin-top: .2rem;
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