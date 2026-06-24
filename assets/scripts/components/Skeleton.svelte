<script lang="ts">
  import Header from "./Header.svelte";
  import Footer from "./Footer.svelte";
  import type { ScribouilliState } from "../store"
  import type { Snippet } from "svelte"

  interface Props {
    showArticles?: boolean
    buildStatus?: any
    currentRepository?: ScribouilliState["currentRepository"] | undefined
    conflict?: ScribouilliState["conflict"]
    children?: Snippet
  }

  let {
    showArticles = false,
    buildStatus = undefined,
    currentRepository = undefined,
    conflict = undefined,
    children
  }: Props = $props();
</script>

<Header {showArticles} {currentRepository} {buildStatus} {conflict} />

<main>
  {@render children?.()}
</main>

<Footer/>
