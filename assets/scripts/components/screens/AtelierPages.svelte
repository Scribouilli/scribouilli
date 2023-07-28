<script>
  import ListContenu from './intern/ListContenu.svelte'

  export let buildStatus
  export let pages
  export let showArticles
  export let currentRepository
</script>

<ListContenu
  {currentRepository}
  {buildStatus}
  listContenu={pages}
  {showArticles}
  title="Pages"
  atelierPrefix="./atelier-page"
  newContentButtonText="Nouvelle page"
  allowModification={true}
/>

<style lang="scss">
</style>
