<script>
  import Header from "./Header.svelte";
  export let publishedWebsiteURL;
</script>

<Header {publishedWebsiteURL} />

<main>
  <slot></slot>
</main>
