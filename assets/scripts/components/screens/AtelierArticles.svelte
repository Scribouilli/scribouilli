<script>
  import ListContenu from "./intern/ListContenu.svelte";

  export let buildStatus;
  export let articles;
  export let showArticles
  export let currentRepository;
</script>

<ListContenu
  {currentRepository}
  {buildStatus}
  listContenu={articles}
  {showArticles}
  title="L'atelier — Articles"
  atelierPrefix="./atelier-article"
  newContentButtonText="Nouvel article"
/>

<style lang="scss">
</style>
