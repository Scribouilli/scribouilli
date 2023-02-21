<script>
  import Skeleton from "./Skeleton.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  $: enabled = false;

  export let publishedWebsiteURL;
  export let buildStatus;
  export let themeColor;
  export let deleteRepositoryUrl;

  let notification = "";

  const onThemeSave = (e) => {
    dispatch("update-theme-color", { themeColor });
    notification = "Le thème sera mis à jour après le déploiement des modifications (~ 2min)";
    document.querySelector("#notifications").scrollIntoView();
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

    <div id="notifications">{notification}</div>

    <div class="wrapper white-zone">
      <div>
        <h3 for="theme-color-select">Couleur principale</h3>

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
      <p>
        Si la couleur ne change pas, essayez d'actualiser la page sans le cache (Ctrl + Maj + R)
        après les 2 minutes
      </p>
    </div>

    <div class="wrapper white-zone">
      <h3>Supprimer le site</h3>
      <p>
        Pour supprimer le site, cliquez sur le bouton "Delete this repository" en bas de la page <a
          href={deleteRepositoryUrl}>"Settings" de Github</a
        >.
      </p>
      <p>
        Après, rechargez la page après ~ 1min pour que Scribouilli détecte la supression de votre
        site.
      </p>
    </div>
  </section>
</Skeleton>

<style lang="scss">
  .radios-wrapper {
    width: 70%;
    margin: 0 auto;
  }
</style>
