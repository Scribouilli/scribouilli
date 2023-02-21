<script>
  import Skeleton from "./Skeleton.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  $: enabled = false;

  export let publishedWebsiteURL;
  export let buildStatus;
  export let themeColor;
  export let deleteRepositoryUrl;

  let colorChanged = false;

  const onThemeSave = (e) => {
    if (colorChanged) {
      document.querySelector(".changed").style.display = "block"
      document.querySelector(".nochange").style.display = "none"
      dispatch("update-theme-color", { themeColor });
      colorChanged = false;

    } else {
      document.querySelector(".nochange").style.display = "block"
      document.querySelector(".changed").style.display = "none"
    }
  };

  const setColor = (e) => {
    if (themeColor.color !== e.target.value) {
      colorChanged = true;
      themeColor.color = e.target.value;
    }
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
              <label for={id}>
                <span style="background-color: {color}" /> {name}</label
              >
            </div>
          {/each}
        </div>
      </div>

      <div class="notifications changed">
        <p>
          La modification est enregistrée et en cours de déploiement (~ 2min).
        </p>
        <p>
          Si la couleur ne change pas, essayez d'actualiser la page sans le
          cache (Ctrl + Maj + R) après les 2 minutes.
        </p>
      </div>

      <div class="notifications nochange">
        <p>C'est déjà la couleur du thème.</p>
      </div>

      <div>
        <button class="btn btn__medium" on:click={onThemeSave}
          >Changer la couleur (~ 2 min.)</button
        >
      </div>
    </div>

    <div class="wrapper white-zone">
      <h3>Supprimer le site</h3>
      <p>
        Pour supprimer le site, cliquez sur le bouton "Delete this repository"
        en bas de la page <a href={deleteRepositoryUrl}>"Settings" de Github</a>
      </p>
    </div>
  </section>
</Skeleton>

<style lang="scss">
  .radios-wrapper {
    width: 70%;
    margin: 0 auto;
  }

  .notifications {
    display: none;
    margin-top: 2rem;
    p {
      text-align: left;
      margin: 0;
      &+p {margin-top: 1rem;}
    }
  }
</style>
