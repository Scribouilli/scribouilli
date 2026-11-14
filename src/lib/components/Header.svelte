<script lang="ts">
  import logoAtelier from '#lib/assets/images/logo_atelier.png'
  import type { BackendType } from '#lib/providers/index.ts'
  import { makeUrlParam, makeAtelierListPageURL, makeAtelierListArticlesURL } from '#lib/urls.ts'
  import { resolve } from '$app/paths'
  import { getAtelier } from '#lib/atelier/index.svelte.ts'
  import { page } from '$app/state'

  const atelier = getAtelier()

  let needsAccountVerification: boolean = $derived(
    atelier.repo.buildStatus === 'needs_account_verification',
  )
  let buildStatusClass = $derived(
    atelier.repo.buildStatus ? `build-${atelier.repo.buildStatus}` : undefined,
  )
  let publishedWebsiteURL: string | undefined = $derived(atelier.repo.publishedUrl)
  let repositoryURL: string = $derived(atelier.repo.publicRepositoryURL)
  let repositoryType: BackendType | undefined = $derived(atelier.repo.repoType)
  let homeURL: string = $derived(
    atelier.repo.status !== 'not-intitialized'
      ? makeAtelierListPageURL(atelier.repo)
      : resolve('/'),
  )

  let showArticlesLink = $derived(atelier.isBlogEnabled)

  function makeResolutionDesynchronisationURL(account: string, repoPath: string): string {
    return resolve(
      `/atelier/(site)/resolution-desynchronisation?account=${account}&repoPath=${repoPath}`,
    )
  }

  let resolutionURL: string = $derived(
    makeResolutionDesynchronisationURL(atelier.repo.owner ?? '', atelier.repo.repoPath || ''),
  )
</script>

<header>
  {#if atelier.repo.status === 'ready' || atelier.repo.status === 'sync'}
    <div>
      <p>
        {#if !publishedWebsiteURL}
          (L'adresse du site va apparaître ici…)
        {:else}
          <a href={publishedWebsiteURL} class="project-name" target="_blank">
            {publishedWebsiteURL}
          </a>
        {/if}
      </p>
      {#if buildStatusClass}
        <p class={buildStatusClass}></p>
      {/if}
    </div>
  {/if}

  <h1>
    <a href={homeURL} class="go-home"><img src={logoAtelier} alt="L'atelier de Scribouilli" /></a>
  </h1>

  {#if atelier.repo.status === 'ready' || atelier.repo.status === 'sync'}
    <nav>
      <ul>
        <li>
          <a href={makeAtelierListPageURL(atelier.repo)}> Pages </a>
        </li>

        {#if showArticlesLink}
          <li>
            <a href={makeAtelierListArticlesURL(atelier.repo)}> Articles </a>
          </li>
        {/if}

        <li>
          <a
            href={makeUrlParam(
              resolve(`/atelier/(site)/parametres`),
              atelier.repo.owner,
              atelier.repo.repoPath,
            )}
          >
            Paramètres
          </a>
        </li>
        {#if repositoryURL && repositoryType !== 'scribouilli'}
          <li>
            <a href={repositoryURL} target="_blank">Sur {new URL(repositoryURL).hostname}</a>
          </li>
        {/if}
        {#if repositoryType === 'scribouilli'}
          <li>
            <a href={`${atelier.repo.origin}/settings`} target="_blank">Mon compte</a>
          </li>
        {/if}
      </ul>
    </nav>
  {/if}
</header>

{#if atelier.repo.conflicts && page.route.id !== '/atelier/(site)/resolution-desynchronisation'}
  <section class="warning warning-center">
    <p>
      <span aria-hidden="true">⚠️</span> <strong>Attention !</strong> Votre site ne peut plus se mettre
      à jour.
    </p>

    <p><a href={resolutionURL} class="btn btn__medium">Voir le problème</a></p>
  </section>
{/if}

{#if needsAccountVerification}
  <section class="warning warning-center">
    <p class="centered"><span>⚠️</span> <strong>Attention..</strong></p>

    <p>
      Votre site ne peut pas être publié car GitLab exige de vérifier votre identité avec un n° de
      téléphone (ou un n° de carte bleue).
    </p>

    <p>
      <a href="https://gitlab.com/-/identity_verification" class="btn btn__medium">
        Vérifier mon identité
      </a>
    </p>
  </section>
{/if}

<style lang="scss">
  header {
    margin-bottom: 2rem;
    padding-right: 2rem;
    padding-left: 2rem;
    border-bottom: 1px solid #4d4646;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  header > * {
    flex: 1;
  }

  header > div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  header > div > p {
    margin: 0em;
  }

  header h1 {
    text-align: center;
  }

  header img {
    max-height: 3em;
  }

  .warning {
    max-width: 46rem;
    margin: 0 auto;
    padding: 2rem;
    border-radius: 1rem;
    margin-bottom: 3rem;
    background-color: #fff4e5;
    border: 3px solid #ff4800;

    p {
      margin-top: 0;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .btn {
      background-color: transparent;
    }

    span {
      display: block;
      font-size: 200%;
    }

    .centered {
      text-align: center;
    }
  }

  [class^='build-'] {
    margin-top: 0.3rem;
  }

  .build-in_progress::after {
    content: '🕰 En cours de publication (2-3 min)';
  }

  .build-success::after {
    content: '✅ Site à jour';
  }

  .build-error::after {
    content: '🕰 En cours de publication (15 min max)';
  }
</style>
