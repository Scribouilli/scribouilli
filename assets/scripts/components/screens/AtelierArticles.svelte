<script>
  import ListContenu from './intern/ListContenu.svelte'

  export let buildStatus
  export let articles
  export let showArticles
  export let currentRepository
</script>

<ListContenu
  {currentRepository}
  {buildStatus}
  listContenu={articles}
  {showArticles}
  title="Articles"
  atelierPrefix="./atelier-article"
  newContentButtonText="Nouvel article"
  allowModification={false}
/>

<style lang="scss">
</style>
