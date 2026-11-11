<script lang="ts">
  import type { LayoutProps } from './$types'
  import '#lib/assets/styles/styles.css'

  let { children }: LayoutProps = $props()

  import Header from '#lib/components/Header.svelte'
  import Footer from '#lib/components/Footer.svelte'
  import { Atelier, setAtelier } from '#lib/atelier/index.svelte.ts'

  console.log('set atelier')
  const atelier = new Atelier()
  atelier.refresh()
  setAtelier(atelier)
</script>

<Header />

<main>
  {@render children()}
</main>

<Footer />
