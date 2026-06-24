<script lang="ts">
  import {makeAtelierListArticlesURL} from '../../routes/atelier-list-articles.js'
  import type { EditeurFile, FileContenu } from '../../types/atelier.js'
  import ScribouilliGitRepo from '../../scribouilliGitRepo.js';

  import Editeur from "./intern/Editeur.svelte";
  
  interface Props {
    fileP: Promise<EditeurFile>
    buildStatus: any
    contenus: FileContenu[]
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

<Editeur
  {fileP}
  {buildStatus}
  {contenus}
  {showArticles}
  {currentRepository}
  editionTitle="Édition d'un article"
  listPrefix={makeAtelierListArticlesURL(currentRepository)}
  deleteTitle="Supprimer l'article"
  {onDelete}
  {onSave}
/>
