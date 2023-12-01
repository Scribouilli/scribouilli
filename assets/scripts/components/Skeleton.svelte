<script>
  import Header from "./Header.svelte";
  import Footer from "./Footer.svelte";

  /** @type {boolean} */
  export let showArticles = false;

  /** @type {any} */
  export let buildStatus = undefined;

  /** @typedef {import("./../store.js").ScribouilliState} ScribouilliState */
  /** @type {ScribouilliState["currentRepository"] | undefined} */
  export let currentRepository = undefined;

  /** @type {ScribouilliState["conflict"]}*/
  export let conflict = undefined
</script>

<Header {showArticles} {currentRepository} {buildStatus} {conflict} />

<main>
  <slot />
</main>

<Footer/>
