<script lang="ts">
  import { marked } from 'marked'
  import DOMPurify from 'dompurify'
  import { writeFileAndCommit } from '#lib/git/file.ts'
  import type { EditeurFile, FileContenu } from '#lib/atelier.ts'
  import Loader from '../Loader.svelte'
  import { Pages } from '#lib/atelier/page.svelte.ts'
  import { getAtelier } from '#lib/atelier/index.svelte.ts'
  import NewTabLink from '../NewTabLink.svelte'
  import IconBack from '../icons/IconBack.svelte'
  import { asset } from '$app/paths'

  interface Props {
    file?: EditeurFile

    contenus?: FileContenu[]
    editionTitle: string
    listPrefix: string
    deleteTitle: string

    onDelete: (file: EditeurFile) => void
    onSave: (file: EditeurFile) => void
  }

  let {
    file = $bindable(),

    contenus = [],
    editionTitle,
    listPrefix,
    deleteTitle,

    onDelete,
    onSave,
  }: Props = $props()

  const atelier = getAtelier()
  let files: FileList | undefined = $state()
  // single-image selection
  let image = $derived(files && files[0])
  let imageMd = $state('')
  let deleteDisabled = $state(true)

  let iframe: HTMLIFrameElement | undefined = $state()
  let iframeHeight = $state(150)
  let iframeSrc = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <link rel="stylesheet" href="${asset('editeur-preview/framalibre.css')}">
      <link rel="stylesheet" href="${asset('editeur-preview/preview.css')}">
    </head>
    <body>
    </body>
  </html>
`

  let filesPath = $derived(contenus.map(contenu => contenu.path))

  const validateTitle = (e: Event) => {
    if (!file) {
      return
    }
    const input = e.target as HTMLInputElement
    const titleChanged = file.previousTitle?.trim() !== file.title.trim()
    if (titleChanged && filesPath && filesPath.includes(Pages.makeFileNameFromTitle(file.title))) {
      input.setCustomValidity('Vous avez déjà utilisé ce nom. Veuillez en choisir un autre.')

      return
    }

    input.setCustomValidity('')
  }

  const onSubmit = (e: Event) => {
    e.preventDefault()
    if (!file) {
      return
    }

    const form = e.target as HTMLFormElement

    if (form.checkValidity()) {
      onSave({
        fileName: file.fileName,
        content: file.content.trim(),
        previousContent: file.previousContent,
        title: file.title.trim(),
        index: file.index,
        previousTitle: file.previousTitle,
        blogIndex: file.blogIndex,
      })
    }
  }

  const onBackClick = (e: Event) => {
    if (!file) {
      return
    }

    if (
      file.previousContent?.trim() !== file.content.trim() ||
      file.title?.trim() !== file.previousTitle?.trim()
    ) {
      if (
        !confirm(
          'Êtes-vous sûr·e de vouloir revenir en arrière ? Toutes vos modifications seront perdues.',
        )
      ) {
        e.preventDefault()
      }
    }
  }

  const imageSelect = async () => {
    if (!image) return

    imageMd = 'Mise en ligne en cours…'
    const buffer = new Uint8Array(await image.arrayBuffer())
    const imageFilePath = `images/${image.name}`

    await writeFileAndCommit(
      atelier.repo.gitAgent,
      imageFilePath,
      buffer,
      `Ajout de l'image ${image.name}`,
    )

    const imageLink = `{% link ${imageFilePath} %}`
    imageMd = `![Texte décrivant l'image](${imageLink})`
  }

  const onContentChange = async () => {
    if (!file || !iframe || !iframe.contentDocument) {
      return
    }

    let preview = ''

    try {
      const rawHtml = await marked.parse(file.content)
      preview = DOMPurify.sanitize(rawHtml)
    } catch {
      preview = 'Il y a une erreur dans le Markdown. Veuillez vérifier votre syntaxe.'
    }

    iframe.contentDocument.body.innerHTML = preview
    updateIframeHeight()
  }

  const updateIframeHeight = () => {
    if (!iframe || !iframe.contentDocument) {
      return
    }

    iframeHeight = iframe.contentDocument.documentElement.getBoundingClientRect().height
  }

  const iframeResizeObserver = new ResizeObserver(updateIframeHeight)

  $effect(() => {
    if (iframe) {
      iframeResizeObserver.observe(iframe)
      return () => {
        iframeResizeObserver.disconnect()
      }
    }
  })
</script>

<h1>{editionTitle}</h1>

{#if file}
  <form onsubmit={onSubmit}>
    <div class="container">
      <div>
        <label for="title">Titre</label>
        <input bind:value={file.title} onchange={validateTitle} type="text" id="title" required />
      </div>

      <div class="accordion aide-editeur">
        <h2 class="label">Aide</h2>
        <details>
          <summary>Mettre en forme le contenu</summary>
          <div>
            <p>
              Pour mettre en forme votre contenu, vous pouvez bidouiller
              <NewTabLink href="https://flus.fr/carnet/markdown.html">avec du Markdown</NewTabLink>
              … ou avec du HTML grâce
              <NewTabLink href="https://scribouilli.org/aide.html">à nos exemples</NewTabLink>
              d'encart ou de bouton, ou
              <NewTabLink
                href="https://developer.mozilla.org/fr/docs/Learn_web_development/Core/Structuring_content"
              >
                avec ce guide.
              </NewTabLink>
            </p>
          </div>
        </details>

        <details>
          <summary>Ajouter une image</summary>
          <div>
            <ol>
              <li>
                <label for="image">Sélectionnez votre image :</label>
                <input
                  accept="image/png, image/jpeg, image/webp, image/gif, image/svg"
                  bind:files
                  id="image"
                  name="image"
                  type="file"
                  onchange={imageSelect}
                />
              </li>
              <li>Insérez la ligne suivante là où vous souhaitez que votre image apparaisse :</li>
              <figure>
                {imageMd}
              </figure>

              <li>
                Remplacez le texte entre crochets par une description pour les personnes malvoyantes
                (il s'affichera si l'image ne charge pas)
              </li>
            </ol>
          </div>
        </details>
      </div>
    </div>

    <div class="content-preview">
      <div class="content">
        <h2 class="label"><label for="content">Contenu</label></h2>
        <textarea
          bind:value={file.content}
          oninput={onContentChange}
          id="content"
          cols="30"
          rows="10"></textarea>
      </div>

      <div class="preview">
        <h2 class="label">Aperçu</h2>
        <div class="markdown-preview">
          <iframe
            width="100%"
            height={iframeHeight}
            bind:this={iframe}
            srcdoc={iframeSrc}
            onload={onContentChange}
            title="Aperçu"
          ></iframe>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="actions-zone">
        <a href={listPrefix} onclick={onBackClick}><IconBack /> Retour</a>
        <button type="submit" class="btn__medium btn">Lancer la publication (~ 2 min)</button>
      </div>

      {#if file.fileName && file.fileName !== 'index.md'}
        <div class="wrapper white-zone">
          <h2>{deleteTitle}</h2>
          <label>
            <input
              type="checkbox"
              onchange={() => {
                deleteDisabled = !deleteDisabled
              }}
            />
            Afficher le bouton de suppression
          </label>
          <button
            type="button"
            onclick={() => onDelete(file)}
            disabled={deleteDisabled}
            class=" btn__medium btn btn__danger"
          >
            {deleteTitle}
          </button>
        </div>
      {/if}
    </div>
  </form>
{:else}
  <Loader />
{/if}

<style lang="css">
  .accordion {
    margin-top: 3rem;
  }

  .aide-editeur {
    summary {
      margin-bottom: 1.2rem;
    }

    ol {
      list-style: revert;
      padding-left: 2rem;
    }

    li {
      margin-bottom: 1rem;
      label {
        font-weight: normal;
        display: inline;
      }
      input {
        display: inline;
      }
    }
  }

  .content-preview {
    display: flex;
    gap: 1rem;

    & > div {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    @media (max-width: 60rem) {
      flex-direction: column;
      width: 100%;
    }
  }

  textarea {
    height: 100%;
  }

  .preview {
    & > div {
      padding: 0.5em;
      background-color: white;
    }

    .markdown-preview :global {
      ul,
      ol {
        margin-left: 1.5rem;
      }

      ul {
        list-style-type: disc;
      }
    }
  }

  .actions-zone {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    margin-bottom: 6rem;
    padding-right: 2rem;
    padding-left: 2rem;
  }

  details {
    figure {
      padding: 0.4rem;
      font-family: monospace;
      background-color: rgba(255, 255, 255, 0.4);
    }
  }
  :global(.markdown-preview ul) {
    list-style-type: disc !important;
    padding-left: 1rem !important;
  }

  :global(.markdown-preview ol) {
    list-style-type: decimal !important;
    padding-left: 1rem !important;
  }

  :global(.markdown-preview li) {
    margin-bottom: 0.5rem !important;
  }
</style>
