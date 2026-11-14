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

<section class="screen" id="welcome">
  {#if atelier.status !== 'signed-out'}
    <h2>Nous regardons si vous avez plusieurs sites Scribouilli…</h2>
    <img src={heartsLoader} alt="cœur sur toi le temps que ça charge" />
  {:else if showWelcome}
    <h2>Créez votre petit site facilement !</h2>

    <a href="/connexion" class="btn">C'est parti !</a>
  {/if}
</section>
