import { GitAgent } from './agent'

export const writeFileAndCommit = async (
  gitAgent: GitAgent,
  fileName: string,
  content: string | Uint8Array,
  commitMessage?: string,
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
  gitAgent: GitAgent,
  fileName: string,
  content: string | Uint8Array,
  commitMessage: string = '',
): ReturnType<typeof GitAgent.prototype.safePush> => {
  if (!gitAgent) {
    throw new TypeError('gitAgent is undefined')
  }

  await writeFileAndCommit(gitAgent, fileName, content, commitMessage)
  return gitAgent.safePush()
}

export const deleteFileAndCommit = async (
  gitAgent: GitAgent,
  fileName: string,
  commitMessage: string = '',
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

export const deleteFileAndPushChanges = async (
  gitAgent: GitAgent,
  fileName: string,
  commitMessage: string,
): ReturnType<typeof GitAgent.prototype.safePush> => {
  if (!gitAgent) {
    throw new TypeError('gitAgent is undefined')
  }

  await deleteFileAndCommit(gitAgent, fileName, commitMessage)
  return gitAgent.safePush()
}

export const file = {
  deleteFileAndPushChanges,
  deleteFileAndCommit,
  writeFileAndCommit,
  writeFileAndPushChanges,
}
