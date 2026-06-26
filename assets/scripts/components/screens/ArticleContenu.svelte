<script lang="ts">
  import {makeAtelierListArticlesURL} from '../../routes/atelier-list-articles.ts'
  import type { EditeurFile } from '../../types/atelier.ts'
  import ScribouilliGitRepo from '../../scribouilliGitRepo.ts';

  import Editeur from "./intern/Editeur.svelte";
  import Loader from '../loaders/Loader.svelte'
  import Skeleton from '../Skeleton.svelte'
  import type { BuildStatus } from '../../types/git.ts'
  
  interface Props {
    fileP: Promise<EditeurFile>
    buildStatus: BuildStatus
    contenus: { path: string }[]
    showArticles: boolean
    currentRepository: ScribouilliGitRepo
    onDelete: () => void
    onSave: (file: EditeurFile) => void
  }

  let {
    fileP,
    buildStatus,
    contenus,
    showArticles,
    currentRepository,
    onDelete,
    onSave,
  }: Props = $props();
</script>

<Skeleton {currentRepository} {buildStatus} {showArticles}>
  {#await fileP}
    <Loader />
  {:then file} 
    <Editeur
      {file}
      {contenus}
      editionTitle="Édition d'un article"
      listPrefix={makeAtelierListArticlesURL(currentRepository)}
      deleteTitle="Supprimer l'article"
      {onDelete}
      {onSave}
    />
  {/await}
</Skeleton>