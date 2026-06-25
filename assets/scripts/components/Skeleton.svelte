<script>
  import Header from "./Header.svelte";
  import Footer from "./Footer.svelte";

  /** @typedef {import("./../store.js").ScribouilliState} ScribouilliState */

  /**
   * @typedef {Object} Props
   * @property {boolean} [showArticles]
   * @property {any} [buildStatus]
   * @property {ScribouilliState["currentRepository"] | undefined} [currentRepository]
   * @property {ScribouilliState["conflict"]} [conflict]
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let {
    showArticles = false,
    buildStatus = undefined,
    currentRepository = undefined,
    conflict = undefined,
    children
  } = $props();
</script>

<Header {showArticles} {currentRepository} {buildStatus} {conflict} />

<main>
  {@render children?.()}
</main>

<Footer/>
