<script lang="ts">
  import { getAtelier } from '#lib/atelier/index.svelte.ts'
  import IconInProgress from './icons/IconInProgress.svelte'
  import IconSuccess from './icons/IconSuccess.svelte'
  import NewTabLink from './NewTabLink.svelte'

  const atelier = getAtelier()
  let buildStatus = $derived(atelier.repo.buildStatus)
  let publishedWebsiteURL: string | undefined = $derived(atelier.repo.publishedUrl)
</script>

{#if atelier.repo.status === 'ready' || atelier.repo.status === 'sync'}
  <div class="status">
    <p>
      {#if !publishedWebsiteURL}
        (L'adresse du site va apparaître ici…)
      {:else}
        <NewTabLink href={publishedWebsiteURL} class="project-name">
          {publishedWebsiteURL}
        </NewTabLink>
      {/if}
    </p>
    <p class="build" aria-live="polite" aria-atomic="true">
      {#if buildStatus === 'in_progress'}
        <IconInProgress /> En cours de publication (2-3 min)
      {:else if buildStatus === 'error'}
        <IconInProgress /> En cours de publication (15 min max)
      {:else if buildStatus === 'success'}
        <IconSuccess /> Site à jour
      {/if}
    </p>
  </div>
{/if}

<style>
  .build {
    margin-top: 0.3rem;
  }

  .status {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    flex-wrap: wrap;

    p {
      margin: 0em;
    }
  }
</style>
