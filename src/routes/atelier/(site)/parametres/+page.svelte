<script lang="ts">
  import { saveCustomCSS } from '#lib/atelier.ts'
  import { getAtelier } from '#lib/atelier/index.svelte.ts'
  import { CUSTOM_CSS_PATH } from '#lib/config.ts'
  import { handleErrors } from '#lib/error.ts'
  import { goto } from '$app/navigation'
  import { resolve } from '$app/paths'
  import { onMount } from 'svelte'

  let themeCss = $derived('')
  let notification = $state('')
  let deleteDisabled = $state(true)
  const atelier = getAtelier()
  const repo = atelier.repo

  onMount(async () => {
    try {
      themeCss = await atelier.repo.gitAgent.getFile(CUSTOM_CSS_PATH)
    } catch (msg: any) {
      handleErrors(msg)
    }
  })

  const onDeleteRepository = () => {
    atelier
      .deleteRepository(repo)
      .then(() => {
        goto(resolve('/atelier'))
      })
      .catch(handleErrors)
  }

  const checkThemeColor = (color: string): boolean => {
    const themeColor = themeCss.replace(
      /(.*)--couleur-primaire(.*)#(?<color>[a-fA-F0-9]{6});(.*)/gs,
      '#$<color>',
    )

    return themeColor === color
  }

  const saveTheme = (e: Event) => {
    e.preventDefault()
    if (themeCss === undefined) {
      return
    }
    notification = 'Le thème sera mis à jour après le déploiement des modifications (~ 2min)'

    repo.sync(saveCustomCSS(repo, themeCss))

    document.body.scrollIntoView()
  }

  const setColor = (e: Event) => {
    themeCss = themeCss.replace(
      /(?<before>(.*)--couleur-primaire(.*))(#[a-fA-F0-9]{6})(?<after>;(.*))/gs,
      `$<before>${(<HTMLInputElement>e.target)?.value}$<after>`,
    )
  }

  const setTheme = (e: Event) => {
    themeCss = (<HTMLInputElement>e.target)?.value
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

<section class="screen" id="settings">
  <h2>Paramètres</h2>

  <div id="notifications">{notification}</div>

  <div class="wrapper white-zone">
    <div>
      <h3>Couleur principale</h3>

      <div class="radios-wrapper">
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
            <label for={id}> <span style="background-color: {color}"></span> {name}</label>
          </div>
        {/each}
      </div>
    </div>

    <div>
      <button class="btn btn__medium" type="button" onclick={saveTheme}
        >Changer la couleur (~&nbsp;2&nbsp;min.)</button
      >
    </div>
    <p>
      Si la couleur ne change pas, essayez d'actualiser la page sans le cache (Ctrl + Maj + R) après
      les&nbsp;2&nbsp;minutes
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
    <textarea aria-labelledby="customCSS" cols="20" rows="8" onchange={setTheme}
      >{themeCss || 'Chargement du thème personnalisé...'}</textarea
    >
    <button type="button" class="btn btn__medium" onclick={saveTheme}>Enregistrer le CSS</button>
  </div>

  {#if atelier.repo.userPermission === 'owner'}
    <div class="wrapper white-zone">
      <h3>Supprimer le site</h3>
      <p>Attention la suppression du site est définitive!</p>

      <label>
        <input
          type="checkbox"
          onchange={() => {
            deleteDisabled = !deleteDisabled
          }}
        />
        Afficher le bouton de suppression
      </label>
      <button
        type="button"
        onclick={onDeleteRepository}
        disabled={deleteDisabled}
        class=" btn__medium btn btn__danger"
      >
        Supprimer le site
      </button>
    </div>
  {/if}

  <hr />

  <div class="wrapper white-zone">
    <h3>Autres sites</h3>
    <p>
      Vous pouvez <strong>créer un nouveau site</strong> Scribouilli ou retrouver ceux que vous avez
      <strong>déjà créés</strong>.
    </p>

    <a class="btn btn__medium" href={resolve('/atelier/selectionner-site')}> Changer de site </a>
  </div>
</section>

<style lang="css">
  .radios-wrapper {
    width: 70%;
    margin: 0 auto;
  }

  hr {
    margin: 3rem 0;
  }
</style>
