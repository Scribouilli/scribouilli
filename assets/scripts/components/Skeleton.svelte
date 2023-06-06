<script>
  import Header from "./Header.svelte";
  export let publishedWebsiteURL = undefined;
  export let buildStatus = undefined;
  export let repositoryURL = undefined;
</script>

<Header {publishedWebsiteURL} {buildStatus} {repositoryURL} />

<main>
  <slot />
</main>

<script>
  import Footer from "./Footer.svelte";
</script>
