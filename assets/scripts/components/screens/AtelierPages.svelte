<script>
  import ListContenu from "./intern/ListContenu.svelte";

  export let publishedWebsiteURL;
  export let buildStatus;
  export let pages;
  export let repositoryURL;
</script>

<ListContenu
  {publishedWebsiteURL}
  {buildStatus}
  listContenu={pages}
  {repositoryURL}
  title="L'atelier — Pages"
  atelierPrefix="./atelier-page"
  newContentButtonText="Nouvelle page"
/>

<style lang="scss">
</style>
