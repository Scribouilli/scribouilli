<script lang="ts">
  import * as store from '#lib/store.svelte.ts'
  import { fetchCurrentUserRepositories, redirectForRepos } from '#lib/user.ts'
  import { onMount } from 'svelte'
  import heartsLoader from '#lib/assets/images/hearts.svg'

  let showWelcome = $state(false)

  onMount(() => {
    if (store.state.oAuthProvider) {
      fetchCurrentUserRepositories().then(redirectForRepos)
    } else {
      showWelcome = true
    }
  })
</script>

<section class="screen" id="welcome">
  {#if store.state.oAuthProvider}
    <h2>Nous regardons si vous avez plusieurs sites Scribouilli…</h2>
    <img src={heartsLoader} alt="cœur sur toi le temps que ça charge" />
  {:else if showWelcome}
    <h2>Créez votre petit site facilement !</h2>

    <a href="/choose-account" class="btn">C'est parti !</a>
  {/if}
</section>
