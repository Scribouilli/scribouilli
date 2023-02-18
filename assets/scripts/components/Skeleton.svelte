<script>
  import Header from "./Header.svelte";
  export let publishedWebsiteURL = undefined;
  export let buildStatus = undefined;
</script>

<Header {publishedWebsiteURL} {buildStatus}/>

<main>
  <slot></slot>
</main>
