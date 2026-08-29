<script lang="ts">
  import ScribouilliGitRepo from '../../scribouilliGitRepo'
  import type { ScribouilliState } from './../../store.ts'
  import ListContenu from './intern/ListContenu.svelte'

  interface Props {
    buildStatus: any
    pages: any[] | undefined
    showArticles: boolean | undefined
    currentRepository: ScribouilliGitRepo
    conflict: ScribouilliState['conflict']
    blogEnabled: boolean
    onBlogToggle: (activated: boolean) => void
  }

  let {
    buildStatus,
    pages,
    showArticles,
    currentRepository,
    conflict,
    blogEnabled,
    onBlogToggle,
  }: Props = $props()
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
  {conflict}
  {blogEnabled}
  {onBlogToggle}
/>

<style lang="scss">
</style>
