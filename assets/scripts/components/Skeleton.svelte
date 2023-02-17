<script>
  import Header from "./Header.svelte";
  export let publishedWebsiteURL = undefined;
</script>

<Header {publishedWebsiteURL} />

<main>
  <slot></slot>
</main>
