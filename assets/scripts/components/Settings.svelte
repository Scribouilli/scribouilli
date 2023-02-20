<script>
  import Skeleton from "./Skeleton.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  $: enabled = false;

  export let publishedWebsiteURL;
  export let buildStatus;

  const temporaire = () => {
    dispatch("delete-site");
  };
</script>

<Skeleton {publishedWebsiteURL} {buildStatus}>
  <section class="screen" id="settings">
    <h2>L'atelier — Paramètres</h2>
    <!--<div class="theme-select">
      <div>
        <label for="theme-color-select">Choisir une couleur de thème pour mon site :</label>
        <select class="theme-select-bar">
          <option value="#2a6442">Vert booteille</option>
          <option value="#07357d">Bleu outre-mer</option>
          <option value="#0E6270">Bleu lagon</option>
          <option value="#753785">Violet aubergine</option>
          <option value="#993B1F">Rouge brique</option>
          <option value="#6C5353">Marron volcanique</option>
          <option value="#53606C">Gris souris</option>
        </select>
      </div>
      <div>
        <button class="btn btn__medium">Sauvegarder</button>
      </div>
    </div>-->
    <div class="wrapper delete-zone">
      <label>
        <input
          type="checkbox"
          on:change={() => {
            enabled = !enabled;
          }}
        />
        Afficher le bouton de suppression du site
      </label>
      <button on:click={temporaire} disabled={!enabled} class="btn btn__medium">Supprimer le site</button>
    </div>
  </section>
</Skeleton>


<style lang="scss">
  .theme-select {
    margin-bottom: 3rem;
  }
  .theme-select-bar {
    margin-bottom: 1rem;
  }
</style>
