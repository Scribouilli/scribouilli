<script lang="ts">
  import type { LayoutProps } from './$types'
  import { error } from '#lib/error.svelte.ts'
  import '#lib/assets/styles/styles.css'

  let { children }: LayoutProps = $props()

  import Header from '#lib/components/Header.svelte'
  import Footer from '#lib/components/Footer.svelte'
  import { Atelier, setAtelier } from '#lib/atelier/index.svelte.ts'
  import { resolve } from '$app/paths'
  import { page } from '$app/state'

  console.log('set atelier')
  const atelier = new Atelier()
  atelier.refresh()
  setAtelier(atelier)
</script>

<Header />

{#if error.error }
  <main>
    <section class="wrapper screen">
      <header>
        <h2>Une erreur est survenue</h2>
      </header>

      <p>Vous pouvez retourner à l’atelier ou rafraîchir la page, puis réessayez à nouveau.</p>

      <p>
        Si cette erreur persiste vous pouvez nous contacter par email à <a href="mailto:coucou@scribouilli.org">coucou@scribouilli.org</a> en joignant le code d’erreur ci-dessous.
      </p>

      <div data-sveltekit-reload>
        <a class="btn btn_secondary btn__medium" href="{resolve("/")}">Retourner à l’atelier</a>
        <a class="btn btn_secondary btn__medium" href="{page.url.pathname}">Rafraîchir la page</a>
      </div>

      <div class="wrapper white-zone error-info">
          <div class="error-message">{error.error.message}</div>
          <pre class="error-stack">{error.error.stack}</pre>
      </div>
    </section>
  </main>
{:else}
  <main>
    {@render children()}
  </main>
{/if}

<Footer />

<style>
  .error-info {
    margin-top: 3rem;
    font-size: .8em;
  }
  .error-message, .error-stack {
    font-family: monospace;
  }

  .error-stack {
    white-space: pre;
    text-align: left;
    overflow: auto;
  }

  .error-message {
    text-align: start;
    font-size: 1.25em;
    font-weight: bold;
    margin-bottom: .5em;
  }
</style>
