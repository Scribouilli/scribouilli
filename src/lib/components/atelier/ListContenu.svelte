<script lang="ts">
  import * as store from '#lib/store.svelte.ts'
  import { Pages } from '#lib/atelier/page.svelte.ts'
  import type { FileContenu } from '#lib/atelier.ts'
  import { makeUrlParam } from '#lib/urls.ts'
  import { getAtelier } from '#lib/atelier/index.svelte.ts'

  interface Props {
    listContenu?: FileContenu[]
    title: string
    atelierPrefix: string
    newContentButtonText: string
    allowModification: boolean
    onBlogToggle?: (activated: boolean) => void
  }

  let {
    listContenu = [],
    title,
    atelierPrefix,
    newContentButtonText,
    allowModification,
    onBlogToggle,
  }: Props = $props()

  let atelier = getAtelier()
  let modification = $state(false)
  let blogEnabled = $derived(onBlogToggle ? atelier.isBlogEnabled : false)

  // TODO: move this somewhere else
  const editClick = async (_e: Event) => {
    if (modification) {
      for (let page of listContenu) {
        // for + await leads to poor pref. PPP: do a Promise.all
        await atelier.repo.gitAgent.writeFile(
          page.path,
          `${
            page.title
              ? Pages.makeFrontMatter(
                  page.title,
                  page.index,
                  page.inMenu,
                  page.blogIndex ? true : undefined,
                ) + '\n'
              : ''
          }${page.content}`,
        )
      }

      await atelier.repo.gitAgent.commit('Changements menu')
      await atelier.repo.gitAgent.safePush()
    }
    modification = !modification
  }

  const toggleBlog = (blogEnabled: boolean) => {
    onBlogToggle!(blogEnabled)
  }
</script>

<section class="screen">
  <div>
    <header>
      <h2>
        {title}
      </h2>
      <a
        href={makeUrlParam(atelierPrefix, atelier.repo.owner, atelier.repo.repoPath)}
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
                href={makeUrlParam(
                  `${atelierPrefix}?path=${encodeURIComponent(contenu.path)}`,
                  atelier.repo.owner,
                  atelier.repo.repoPath,
                )}
              >
                Modifier</a
              >
            {/if}
          </li>
        {/each}
      </ul>
      {#if allowModification}
        <button class="btn btn_small btn_secondary" onclick={editClick}
          >{#if modification}
            Enregistrer
          {:else}
            Modifier le menu
          {/if}</button
        >
      {/if}
    </div>
  </div>

  {#if onBlogToggle}
    <div class="wrapper white-zone">
      <h3>Articles</h3>

      <p>
        Ajoute un lien "Articles" dans le menu. Celui-ci permet de créer et lister une série de
        pages.
      </p>

      <button class="btn btn__medium" onclick={() => toggleBlog(blogEnabled)}>
        {#if blogEnabled}
          Enlever le lien "Articles" (~ 2min)
        {:else}
          Ajouter le lien "Articles" (~ 2min)
        {/if}
      </button>
    </div>
  {/if}
</section>

<style lang="css">
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 5em;
    width: 26em;
    margin: 3rem auto;
    padding: 0;
    border: none;

    & > * {
      flex: 0 1 auto;
    }

    h2 {
      margin: 0.2em 0;
    }
  }

  .white-zone {
    margin-top: 3rem;
  }
</style>
