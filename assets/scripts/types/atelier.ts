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
  fileName: string
  content: string
  previousContent: string | undefined
  title: string
  index: number
  previousTitle: string | undefined
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

export type BackendType = 'github' | 'gitlab' | 'scribouilli'

export interface ScribouilliBackendProvider {
  id: string
  origin: string
  clientId?: string
  type: BackendType
  description: string
  name: string
  signupInstructions?: string
  signupEnabled: boolean
  signupLink?: string
  corsProxy?: string
}
