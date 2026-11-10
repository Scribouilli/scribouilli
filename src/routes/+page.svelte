<script lang="ts">
  import * as storage from '#lib/storage.ts'
  import { redirectForRepos } from '#lib/user.ts'
  import { onMount } from 'svelte'
  import heartsLoader from '#lib/assets/images/hearts.svg'
  import { type ScribouilliBackendProvider } from '#lib/providers/index.ts'

  let showWelcome = $state(false)
  let provider: ScribouilliBackendProvider | undefined = $state()

  onMount(() => {
    provider = storage.loadProvider()
    if (provider) {
      provider.api.getCurrentUserRepositories().then(redirectForRepos)
    } else {
      showWelcome = true
    }
  })
</script>

<section class="screen" id="welcome">
  {#if provider}
    <h2>Nous regardons si vous avez plusieurs sites Scribouilli…</h2>
    <img src={heartsLoader} alt="cœur sur toi le temps que ça charge" />
  {:else if showWelcome}
    <h2>Créez votre petit site facilement !</h2>

    <a href="/connexion" class="btn">C'est parti !</a>
  {/if}
</section>
