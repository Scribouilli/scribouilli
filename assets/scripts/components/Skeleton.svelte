<script>
  import Header from "./Header.svelte";
  export let publishedWebsiteURL = undefined;
  export let buildStatus = undefined;
  export let repositoryURL = undefined;
  import Footer from "./Footer.svelte";
</script>

<Header {publishedWebsiteURL} {buildStatus} {repositoryURL} />

<main>
  <slot />
</main>

<Footer/>
