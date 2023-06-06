<script>
  // @ts-check

  import Skeleton from "../Skeleton.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  $: enabled = false;

  export let buildStatus;
  export let theme;
  export let deleteRepositoryUrl;
  export let blogEnabled
  export let showArticles
  export let currentRepository;

  let notification = "";

  const checkThemeColor = (color) => {
    const themeColor = theme.css?.replace(
      /(.*)--couleur-primaire(.*)#(?<color>[a-fA-F0-9]{6});(.*)/gs,
      "#$<color>"
    );

    return themeColor === color;
  };

  const saveTheme = (e) => {
    dispatch("update-theme", { theme });
    notification =
      "Le thème sera mis à jour après le déploiement des modifications (~ 2min)";
    document.querySelector("body").scrollIntoView();
  };

  const setColor = (e) => {
    theme.css = theme.css.replace(
      /(?<before>(.*)--couleur-primaire(.*))(#[a-fA-F0-9]{6})(?<after>;(.*))/gs,
      `$<before>${e.target.value}$<after>`
    );
  };

  const setTheme = (e) => {
    theme.css = e.target.value;
  };

  const toggleBlog = e => {
    dispatch("toggle-blog", { activated: e.target.checked })
    if (e.target.checked) {
      notification = 'Une section « Articles » a été ajoutée dans le menu'
    } else {
      notification = 'Les articles ont été masqués sur votre site'
    }
  }

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
      id: "gris-breton",
      color: "#53606C",
      name: "Gris breton",
    },
  ];
</script>

<Skeleton {currentRepository} {buildStatus} {showArticles}>
  <section class="screen" id="settings">
    <h2>L'atelier — Paramètres</h2>

    <div id="notifications">{notification}</div>

      <div class="wrapper white-zone">
        <h3>Sections supplémentaires</h3>

        <label>
          <input type="checkbox" bind:checked={blogEnabled} on:change={toggleBlog} />
          Ajouter une page articles
        </label>
      </div>

    <div class="wrapper white-zone">
      <div>
        <h3 for="theme-color-select">Couleur principale</h3>

        <div class="radios-wrapper">
          {#if theme.css}
            {#each mesCouleurs as { id, color, name }}
              <div class="radio">
                <input
                  on:click={setColor}
                  type="radio"
                  name="theme-color-select"
                  {id}
                  value={color}
                  checked={checkThemeColor(color)}
                />
                <label for={id}>
                  <span style="background-color: {color}" /> {name}</label
                >
              </div>
            {/each}
          {:else}
            <div><img src="./assets/images/oval.svg" alt="" /></div>
          {/if}
        </div>
      </div>

      <div>
        <button class="btn btn__medium" on:click={saveTheme}
          >Changer la couleur (~&nbsp;2&nbsp;min.)</button
        >
      </div>
      <p>
        Si la couleur ne change pas, essayez d'actualiser la page sans le cache
        (Ctrl + Maj + R) après les&nbsp;2&nbsp;minutes
      </p>
    </div>

    <div class="wrapper white-zone">
      <h3>Personnalisation du site</h3>
      <p>
        Pour personnaliser le look de votre site, vous pouvez <a
          href="https://developer.mozilla.org/fr/docs/Learn/Getting_started_with_the_web/CSS_basics"
          >coder en CSS</a
        > ici&nbsp;!
      </p>
      <textarea cols="20" rows="8" on:change={setTheme}
        >{theme.css || "Chargement du thème personnalisé..."}</textarea
      >
      <button type="button" class="btn btn__medium" on:click={saveTheme}
        >Enregistrer le CSS</button
      >
    </div>

    <div class="wrapper white-zone">
      <h3>Supprimer le site</h3>
      <p>
        Pour supprimer le site, cliquez sur le bouton "Delete this repository"
        en bas de la page <a href={deleteRepositoryUrl}>"Settings" de Github</a
        >.
      </p>
      <p>
        Scribouilli saura que le compte est supprimé <em
          >~&nbsp;2&nbsp;minutes après.</em
        >
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
