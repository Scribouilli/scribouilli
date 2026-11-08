<script lang="ts">
  import type { LayoutProps } from './$types'
  import '#lib/assets/styles/styles.css'

  let { children }: LayoutProps = $props()

  import Header from '#lib/components/Header.svelte'
  import Footer from '#lib/components/Footer.svelte'
</script>

<Header />

<main>
  {@render children?.()}
</main>

<Footer />
