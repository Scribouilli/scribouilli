<script>
  import Header from "./Header.svelte";
  import Footer from "./Footer.svelte";

  export let publishedWebsiteURL = undefined;
  export let buildStatus = undefined;
  export let repositoryURL = undefined;
  export let showArticles
</script>

<Header {publishedWebsiteURL} {buildStatus} {repositoryURL} {showArticles} />

<main>
  <slot />
</main>

<Footer/>
