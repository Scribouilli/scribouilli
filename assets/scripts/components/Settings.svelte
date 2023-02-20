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
    <div class="wrapper white-zone">
      <div>
        <h3 for="theme-color-select">
          Choisir une couleur de thème pour mon site :
        </h3>

        <div class="radios-wrapper">
          <div class="radio">
            <input
              type="radio"
              name="theme-color-select"
              id="vert-booteille"
              value="#2a6442"
              checked
            />
            <label for="vert-booteille">Vert booteille</label>
          </div>

          <div class="radio">
            <input
              type="radio"
              name="theme-color-select"
              id="bleu-outre-mer"
              value="#07357d"
            />
            <label for="bleu-outre-mer">Bleu outre-mer</label>
          </div>

          <div class="radio">
            <input
              type="radio"
              name="theme-color-select"
              id="bleu-lagon"
              value="#0E6270"
            />
            <label for="bleu-lagon">Bleu lagon</label>
          </div>

          <div class="radio">
            <input
              type="radio"
              name="theme-color-select"
              id="violet-aubergine"
              value="#753785"
            />
            <label for="violet-aubergine">Violet aubergine</label>
          </div>

          <div class="radio">
            <input
              type="radio"
              name="theme-color-select"
              id="rouge-brique"
              value="#993B1F"
            />
            <label for="rouge-brique">Rouge brique</label>
          </div>

          <div class="radio">
            <input
              type="radio"
              name="theme-color-select"
              id="marron-volcanique"
              value="#6C5353"
            />
            <label for="marron-volcanique">Marron volcanique</label>
          </div>

          <div class="radio">
            <input
              type="radio"
              name="theme-color-select"
              id="gris-souris"
              value="#53606C"
            />
            <label for="gris-souris">Gris souris</label>
          </div>
        </div>
      </div>

      <div>
        <button class="btn btn__medium">Sauvegarder</button>
      </div>
    </div>

    <div class="wrapper white-zone">
      <h3>Supprimer le site</h3>

      <label>
        <input
          type="checkbox"
          on:change={() => {
            enabled = !enabled;
          }}
        />
        Afficher le bouton de suppression du site
      </label>
      <button on:click={temporaire} disabled={!enabled} class="btn btn__medium btn__danger"
        >Supprimer le site</button
      >
    </div>
  </section>
</Skeleton>

<style lang="scss">
  .white-zone {
    &:first-of-type {
      margin-bottom: 3rem;
    }
  }

  h3 {
    margin-top: 0;
  }

  .radios-wrapper {
    width: 70%;
    margin: 0 auto;
  }
</style>
