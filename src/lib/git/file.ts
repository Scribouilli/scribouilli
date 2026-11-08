import { GitAgent } from './agent'
import { state } from '../store.svelte'

export const writeFileAndCommit = async (
  fileName: string,
  content: string | Uint8Array,
  commitMessage?: string,
  gitAgent: GitAgent | undefined = state.gitAgent,
): Promise<string> => {
  if (typeof commitMessage !== 'string' || commitMessage === '') {
    commitMessage = `Modification du fichier ${fileName}`
  }

  if (!gitAgent) {
    throw new TypeError('gitAgent is undefined')
  }

  await gitAgent.writeFile(fileName, content)
  return gitAgent.commit(commitMessage)
}

export const writeFileAndPushChanges = async (
  fileName: string,
  content: string | Uint8Array,
  commitMessage: string = '',
  gitAgent: GitAgent | undefined = state.gitAgent,
): ReturnType<typeof GitAgent.prototype.safePush> => {
  if (!gitAgent) {
    throw new TypeError('gitAgent is undefined')
  }

  await writeFileAndCommit(fileName, content, commitMessage, gitAgent)
  return gitAgent.safePush()
}

export const deleteFileAndCommit = async (
  fileName: string,
  commitMessage: string = '',
  gitAgent: GitAgent | undefined = state.gitAgent,
): ReturnType<typeof GitAgent.prototype.commit> => {
  if (!gitAgent) {
    throw new TypeError('gitAgent is undefined')
  }

  if (commitMessage === '') {
    commitMessage = `Suppression du fichier ${fileName}`
  }

  await gitAgent.removeFile(fileName)
  return gitAgent.commit(commitMessage)
}

export const deleteFileAndPushChanges = (
  fileName: string,
  commitMessage: string,
  gitAgent: GitAgent | undefined = state.gitAgent,
): ReturnType<typeof GitAgent.prototype.safePush> => {
  if (!gitAgent) {
    throw new TypeError('gitAgent is undefined')
  }

  deleteFileAndCommit(fileName, commitMessage, gitAgent)
  return gitAgent.safePush()
}

export const file = {
  deleteFileAndPushChanges,
  deleteFileAndCommit,
  writeFileAndCommit,
  writeFileAndPushChanges,
}
