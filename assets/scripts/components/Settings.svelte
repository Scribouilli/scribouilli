<script>
  import Skeleton from "./Skeleton.svelte";
  import { createEventDispatcher } from "svelte";
  import { each } from "svelte/internal";

  const dispatch = createEventDispatcher();
  $: enabled = false;

  export let publishedWebsiteURL;
  export let buildStatus;
  export let themeColor;

  const temporaire = () => {
    dispatch("delete-site");
  };

  const onThemeSave = (e) => {
    dispatch("update-theme-color", { themeColor });
  };

  const setColor = (e) => {
    themeColor.color = e.target.value;
  };

  const mesCouleurs = [
    {
      id: "vertBooteille",
      color: "#2a6442",
      name: "Vert Booteille",
    },
    {
      id: "bleu-outre-mer",
      color: "#07357d",
      name: "Bleu outre-mer",
    },
    {
      id: "bleu-lagon",
      color: "#0E6270",
      name: "Bleu lagon",
    },
    {
      id: "violet-aubergine",
      color: "#753785",
      name: "Violet aubergine",
    },
    {
      id: "rouge-brique",
      color: "#993B1F",
      name: "Rouge brique",
    },
    {
      id: "marron-volcanique",
      color: "#6C5353",
      name: "Marron volcanique",
    },
    {
      id: "gris-souris",
      color: "#53606C",
      name: "Gris souris",
    },
  ];
</script>

<Skeleton {publishedWebsiteURL} {buildStatus}>
  <section class="screen" id="settings">
    <h2>L'atelier — Paramètres</h2>

    <div class="wrapper white-zone">
      <div>
        <h3 for="theme-color-select">
          Couleur principale
        </h3>

        <div class="radios-wrapper">
          {#each mesCouleurs as { id, color, name }}
            <div class="radio">
              <input
                on:click={setColor}
                type="radio"
                name="theme-color-select"
                {id}
                value={color}
                checked={color === themeColor.color}
              />
              <label for={id}> <span style="background-color: {color}" /> {name}</label>
            </div>
          {/each}
        </div>
      </div>

      <div>
        <button class="btn btn__medium" on:click={onThemeSave}>Changer la couleur (~ 2 min.)</button
        >
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
      <button on:click={temporaire} disabled={!enabled} class="btn btn__medium"
        >Supprimer le site</button
      >
    </div>
  </section>
</Skeleton>

<style lang="scss">
  .radios-wrapper {
    width: 70%;
    margin: 0 auto;
  }
</style>
