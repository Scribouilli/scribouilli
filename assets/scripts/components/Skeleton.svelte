<script lang="ts">
  import Header from "./Header.svelte";
  import Footer from "./Footer.svelte";
  import type { ScribouilliState } from "../store"
  import type { Snippet } from "svelte"
  import type { BuildStatus } from "../types/git"

  interface Props {
    showArticles?: boolean
    buildStatus?: BuildStatus
    currentRepository?: ScribouilliState["currentRepository"] | undefined
    conflict?: ScribouilliState["conflict"]
    children?: Snippet
  }

  let {
    showArticles = false,
    buildStatus = "in_progress" as const,
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
