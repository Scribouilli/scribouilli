<script>
  import ListContenu from "./intern/ListContenu.svelte";

  export let publishedWebsiteURL;
  export let buildStatus;
  export let articles;
  export let repositoryURL;
</script>

<ListContenu
  {publishedWebsiteURL}
  {buildStatus}
  listContenu={articles}
  {repositoryURL}
  title="L'atelier — Articles"
  atelierPrefix="./atelier-article"
  newContentButtonText="Nouvel article"
/>

<style lang="scss">
</style>
