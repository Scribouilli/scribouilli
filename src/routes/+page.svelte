<script lang="ts">
  import { redirectForRepos } from '#lib/user.ts'
  import { onMount } from 'svelte'
  import heartsLoader from '#lib/assets/images/hearts.svg'
  import { getAtelier } from '#lib/atelier/index.svelte.ts'

  let showWelcome = $state(false)
  const atelier = getAtelier()

  onMount(async () => {
    try {
      await atelier
        .ensureProvider()
        .then(({ api }) => api.getCurrentUserRepositories())
        .then(redirectForRepos)
    } catch (e) {
      console.log('failed to load acount from storage, showing welcome screen', e)
      showWelcome = true
    }
  })
</script>

<div class="container">
  {#if atelier.status !== 'signed-out'}
    <h2>Nous regardons si vous avez plusieurs sites Scribouilli…</h2>
    <div class="loader">
      <img src={heartsLoader} alt="cœur sur toi le temps que ça charge" />
    </div>
  {:else if showWelcome}
    <h2>Créez votre petit site facilement !</h2>
    <div class="action-list">
      <a href="/connexion" class="btn">C'est parti !</a>
    </div>
  {/if}
</div>
