<script>
  import databaseAPI from '../../../databaseAPI'
  import store from '../../../store'
  import Skeleton from '../../Skeleton.svelte'
  import { makePageFrontMatter } from '../../../utils'

  export let buildStatus
  export let listContenu = []
  export let title
  export let atelierPrefix
  export let newContentButtonText
  export let showArticles
  export let currentRepository
  export let allowModification

  let repoName
  $: repoName = currentRepository.name

  let account
  $: account = currentRepository.owner

  let modification = false

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
          'Changement index',
          false,
        )
      }
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
              {#if modification}
                <label>
                  <input
                    aria-label="Activation de la page"
                    type="checkbox"
                    bind:checked={contenu.inMenu}
                  />
                </label>
              {/if}
              <span>{contenu.title}</span>
              {#if modification}
                <label>
                  <input
                    aria-label="Ordre de la page"
                    type="number"
                    min="1"
                    max={store.state.pages.length}
                    bind:value={contenu.index}
                  />
                </label>
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
              Gérer les pages
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
    width: 22em;

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
        width: 3em;

        input {
          width: 100%;
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
