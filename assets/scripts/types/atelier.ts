export interface Page {
  path: string
  title: string
  content?: string
  inMenu?: boolean
  blogIndex?: boolean
  index: number
}

export interface Article {
  path: string
  title: string
  content?: string
}

export interface EditeurFile {
  /** Le chemin du fichier. */
  fileName: string
  /** Le contenu du fichier (en Markdown). */
  content: string
  /** Si le fichier est en cours d'édition ou viens d'être édité, le contenu
  avant les modifications. */
  // TODO: vérifier qu'on en a encore besoin
  previousContent: string | undefined
  /** Si le fichier est en cours d'édition ou viens d'être édité, le titre
  avant les modifications. */
  // TODO: vérifier qu'on en a encore besoin
  previousTitle: string | undefined
  /** Le titre de la page.
   *
   * Stocké dans le frontmatter. */
  title: string
  /** L'ordre dans lequel la page apparaît dans le menu.
   *
   * Stocké dans le frontmatter.
   */
  index: number
  /** Est-ce que cette page est la page d'accueil du blog.
   *
   * Historiquement, ce champ n'existait pas et la page s'appelait toujours
   * `blog.md` mais en fait on veut pouvoir changer son URL, donc on a rajouté
   * ce champ.
   *
   * Stocké dans le frontmatter.
   */
  blogIndex: boolean
}

export interface FileContenu {
  path: string
  title: string
  content: string
  index: number
  inMenu: boolean
  blogIndex: boolean
}
