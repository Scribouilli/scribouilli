<script>
  import ListContenu from "./intern/ListContenu.svelte";

  export let publishedWebsiteURL;
  export let buildStatus;
  export let pages;
  export let repositoryURL;
  export let showArticles
</script>

<ListContenu
  {publishedWebsiteURL}
  {buildStatus}
  listContenu={pages}
  {repositoryURL}
  {showArticles}
  title="L'atelier — Pages"
  atelierPrefix="./atelier-page"
  newContentButtonText="Nouvelle page"
/>

<style lang="scss">
</style>
