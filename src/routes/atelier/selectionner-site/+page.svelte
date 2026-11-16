<script lang="ts">
  import type { MinimalGitRepository } from '#lib/providers/index.ts'
  import { makeUrlParam } from '#lib/urls.ts'
  import { goto } from '$app/navigation'
  import Loader from '#lib/components/Loader.svelte'
  import { resolve } from '$app/paths'
  import { getAtelier } from '#lib/atelier/index.svelte.ts'
  import { RepoList } from '#lib/atelier/repo-list.svelte.ts'

  const atelier = getAtelier()
  let currentAccount = $derived(atelier.account.login)
  let currentAccountRepositories = $derived(
    RepoList.sortRepositories(atelier.repos, currentAccount),
  )

  let repo: MinimalGitRepository | undefined = $state()
  let loading = $state(false)

  const displayRepoName = (repo: MinimalGitRepository) => {
    if (repo.owner === undefined || repo.owner === currentAccount) {
      return repo.name
    } else {
      return `${repo.owner} / ${repo.name}`
    }
  }

  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault()

    if (!repo) return
    goto(makeUrlParam(resolve(`/atelier/(site)/pages`), repo.owner, repo.repoPath))
  }
</script>

<section class="screen">
  <h3>Choisir le site sur lequel vous souhaitez travailler</h3>

  {#if !currentAccountRepositories}
    <Loader />
  {:else}
    <div class="wrapper">
      <form onsubmit={onSubmit}>
        <div>
          <label for="name">Nom de votre site</label>
          <select id="name" bind:value={repo}>
            {#each currentAccountRepositories as repo}
              <option value={repo}>{displayRepoName(repo)}</option>
            {/each}
          </select>
        </div>

        <div class="actions-zone">
          <button type="submit" class="btn__medium btn" disabled={loading}>
            Choisir ce site
          </button>
        </div>
      </form>
    </div>
  {/if}
</section>

<style lang="css">
  select {
    font-size: 1.2rem;
    padding: 0.5em;
  }

  .actions-zone {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    margin-bottom: 6rem;
  }
</style>
