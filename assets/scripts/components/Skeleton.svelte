<script>
  import Header from "./Header.svelte";
  import Footer from "./Footer.svelte";

  export let buildStatus = undefined;
  export let showArticles
  export let currentRepository = undefined;
</script>

<Header {showArticles} {currentRepository} {buildStatus} />

<main>
  <slot />
</main>

<Footer/>
