<script lang="ts">
  import Skeleton from '../Skeleton.svelte'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  interface Props {
    buildStatus: any
    theme: any
    deleteRepositoryUrl: any
    blogEnabled: any
    showArticles: boolean | undefined
    currentRepository: any
  }

  let {
    buildStatus,
    theme = $bindable(),
    deleteRepositoryUrl,
    blogEnabled = $bindable(),
    showArticles,
    currentRepository
  }: Props = $props();

  let notification = $state('')

  const checkThemeColor = (color: string): boolean => {
    const themeColor = theme.css?.replace(
      /(.*)--couleur-primaire(.*)#(?<color>[a-fA-F0-9]{6});(.*)/gs,
      '#$<color>',
    )

    return themeColor === color
  }

  // @ts-ignore
  const saveTheme = e => {
    dispatch('update-theme', { theme })
    notification =
      'Le thème sera mis à jour après le déploiement des modifications (~ 2min)'

    document.body.scrollIntoView()
  }

  // @ts-ignore
  const setColor = e => {
    theme.css = theme.css?.replace(
      /(?<before>(.*)--couleur-primaire(.*))(#[a-fA-F0-9]{6})(?<after>;(.*))/gs,
      `$<before>${e.target.value}$<after>`,
    )
  }

  // @ts-ignore
  const setTheme = e => {
    theme.css = e.target.value
  }

  // @ts-ignore
  const toggleBlog = e => {
    dispatch('toggle-blog', { activated: e.target.checked })
    if (e.target.checked) {
      notification = 'Une section « Articles » a été ajoutée dans le menu'
    } else {
      notification = 'Les articles ont été masqués sur votre site'
    }
  }

  const mesCouleurs = [
    {
      id: 'vertBooteille',
      color: '#2a6442',
      name: 'Vert Booteille',
    },
    {
      id: 'bleu-outre-mer',
      color: '#07357d',
      name: 'Bleu outre-mer',
    },
    {
      id: 'bleu-lagon',
      color: '#0E6270',
      name: 'Bleu lagon',
    },
    {
      id: 'violet-aubergine',
      color: '#753785',
      name: 'Violet aubergine',
    },
    {
      id: 'rouge-brique',
      color: '#993B1F',
      name: 'Rouge brique',
    },
    {
      id: 'marron-volcanique',
      color: '#6C5353',
      name: 'Marron volcanique',
    },
    {
      id: 'gris-breton',
      color: '#53606C',
      name: 'Gris breton',
    },
  ]
</script>

<Skeleton {currentRepository} {buildStatus} {showArticles}>
  <section class="screen" id="settings">
    <h2>Paramètres</h2>

    <div id="notifications">{notification}</div>

    <div class="wrapper white-zone">
      <h3>Sections supplémentaires</h3>

      <label>
        <input
          type="checkbox"
          bind:checked={blogEnabled}
          onchange={toggleBlog}
        />
        Ajouter une page articles
      </label>
    </div>

    <div class="wrapper white-zone">
      <div>
        <h3>Couleur principale</h3>

        <div class="radios-wrapper">
          {#if theme.css}
            {#each mesCouleurs as { id, color, name }}
              <div class="radio">
                <input
                  onclick={setColor}
                  type="radio"
                  name="theme-color-select"
                  {id}
                  value={color}
                  checked={checkThemeColor(color)}
                />
                <label for={id}>
                  <span style="background-color: {color}"></span> {name}</label
                >
              </div>
            {/each}
          {:else}
            <div><img src="./assets/images/oval.svg" alt="" /></div>
          {/if}
        </div>
      </div>

      <div>
        <button class="btn btn__medium" onclick={saveTheme}
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
      <p id="customCSS">
        Pour personnaliser le look de votre site, vous pouvez <a
          href="https://developer.mozilla.org/fr/docs/conflicting/Learn_web_development/Core/Styling_basics"
          >coder en CSS</a
        > ici&nbsp;!
      </p>
      <textarea
        aria-labelledby="customCSS"
        cols="20"
        rows="8"
        onchange={setTheme}
        >{theme.css || 'Chargement du thème personnalisé...'}</textarea
      >
      <button type="button" class="btn btn__medium" onclick={saveTheme}
        >Enregistrer le CSS</button
      >
    </div>

    <div class="wrapper white-zone">
      <h3>Supprimer le site</h3>
      <p>
        Pour supprimer le site, cliquez sur le bouton "Delete this repository"
        en bas de la page <a href={deleteRepositoryUrl}>"Settings" de GitHub</a
        >.
      </p>
      <p>
        Scribouilli saura que le compte est supprimé
        <strong>~&nbsp;2&nbsp;minutes après.</strong>
      </p>
    </div>

    <hr />

    <div class="wrapper white-zone">
      <h3>Autres sites</h3>
      <p>
        Vous pouvez <strong>créer un nouveau site</strong> Scribouilli ou
        retrouver ceux que vous avez <strong>déjà créés</strong>.
      </p>

      <a class="btn btn__medium" href="selectionner-un-site">
        Changer de site
      </a>
    </div>
  </section>
</Skeleton>

<style lang="scss">
  .radios-wrapper {
    width: 70%;
    margin: 0 auto;
  }

  hr {
    margin: 3rem 0;
  }
</style>
