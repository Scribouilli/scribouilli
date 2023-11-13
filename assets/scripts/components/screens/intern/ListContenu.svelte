<script>
  import databaseAPI from '../../../databaseAPI'
  import store from '../../../store'
  import Skeleton from '../../Skeleton.svelte'
  import { makePageFrontMatter } from '../../../utils'
  import './../../../types.js'

  /** @type any */
  export let buildStatus

  /** @type {FileContenu[]} */
  export let listContenu = []

  /** @type {string} */
  export let title

  /** @type {string} */
  export let atelierPrefix

  /** @type {string} */
  export let newContentButtonText

  /** @type {boolean | undefined} */
  export let showArticles

  /** @typedef {import("./../../../store.js").ScribouilliState} ScribouilliState */
  /** @type ScribouilliState["currentRepository"] */
  export let currentRepository

  /** @type {boolean} */
  export let allowModification

  /** @type {string} */
  let repoName
  $: repoName = currentRepository.name

  /** @type {string} */
  let account
  $: account = currentRepository.owner

  let modification = false

  // @ts-ignore
  const editClick = async e => {
    if (modification) {
      for (let page of listContenu) {
        await databaseAPI.writeFile(
          store.state.currentRepository.owner,
          store.state.currentRepository.name,
          page.path,
          `${
            page.title
              ? makePageFrontMatter(
                  page.title,
                  page.index,
                  page.inMenu,
                ) + '\n'
              : ''
          }${page.content}`,
        )
      }

      await databaseAPI.commit(
        store.state.currentRepository.owner,
        store.state.currentRepository.name,
        'Changement index',
      )

      await databaseAPI.push(
        store.state.currentRepository.owner,
        store.state.currentRepository.name,
      )
    }
    modification = !modification
  }
</script>

<Skeleton {currentRepository} {buildStatus} {showArticles}>
  <section class="screen">
    <div>
      <header>
        <h2>
          {title}
        </h2>
        <a
          href="{atelierPrefix}?repoName={repoName}&account={account}"
          class="btn btn__medium">{newContentButtonText}</a
        >
      </header>

      <div>
        <ul>
          {#each listContenu as contenu}
            <li>
              <span>{contenu.title}</span>
              {#if modification}
                <div class="gestionMenu">
                  <label>
                    Ordre de la page dans le menu
                    <input
                      class="order"
                      aria-label="Ordre de la page dans le menu"
                      type="number"
                      min="1"
                      max={store.state.pages?.length}
                      bind:value={contenu.index}
                    />
                  </label>
                  <label>
                    Afficher dans le menu
                    <input
                      class="inMenu"
                      aria-label="Affichage de la page dans le menu"
                      type="checkbox"
                      bind:checked={contenu.inMenu}
                    />
                  </label>
                </div>
              {:else}
                <a
                  href="{atelierPrefix}?path={contenu.path}&repoName={repoName}&account={account}"
                >
                  Modifier</a
                >
              {/if}
            </li>
          {/each}
        </ul>
        {#if allowModification}
          <button class="btn btn_small btn_secondary" on:click={editClick}
            >{#if modification}
              Enregistrer
            {:else}
              Modifier le menu
            {/if}</button
          >
        {/if}
      </div>
    </div>
  </section>
</Skeleton>

<style lang="scss">
  ul {
    margin: auto;
    margin-bottom: 4rem;
    text-align: left;
    width: 25em;

    li {
      font-size: 1.3rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1em;
      padding: 1rem;
      position: relative;

      & + li {
        border-top: 1px solid black;
      }

      .gestionMenu {
        label {
          display: flex;
          align-items: center;
          font-weight: normal;
          font-size: 1rem;
          margin-top: 0.5em;
        }
        .order {
          max-width: 3em;
        }

        .inMenu {
          display: block;
          width: auto;
          margin-right: 0.5em;
          margin-top: 0.5em;
        }
      }

      a::before {
        content: ' ';
        display: block;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
      }

      label {
        input {
          width: 100%;
          margin-left: 0.5em;
        }
      }
    }
  }

  header {
    border: none;
    gap: 5em;
    width: 26em;
    justify-content: space-between;
    margin: auto;
    margin-bottom: 1.5rem;
    padding: 0;

    & > * {
      flex: 0 1 auto;
    }

    h2 {
      margin: 0.2em 0;
    }
  }
</style>
