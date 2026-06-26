import GitAgent from '../GitAgent.ts'
import store from '../store.ts'

export const writeFileAndCommit = async (
  fileName: string,
  content: string | Uint8Array,
  commitMessage?: string,
): Promise<string> => {
  if (typeof commitMessage !== 'string' || commitMessage === '') {
    commitMessage = `Modification du fichier ${fileName}`
  }
  const { gitAgent } = store.state

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
): ReturnType<typeof GitAgent.prototype.safePush> => {
  const { gitAgent } = store.state

  if (!gitAgent) {
    throw new TypeError('gitAgent is undefined')
  }

  await writeFileAndCommit(fileName, content, commitMessage)
  return gitAgent.safePush()
}

export const deleteFileAndCommit = async (
  fileName: string,
  commitMessage: string = '',
): ReturnType<typeof GitAgent.prototype.commit> => {
  const { gitAgent } = store.state

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
): ReturnType<typeof GitAgent.prototype.safePush> => {
  const { gitAgent } = store.state

  if (!gitAgent) {
    throw new TypeError('gitAgent is undefined')
  }

  deleteFileAndCommit(fileName, commitMessage)
  return gitAgent.safePush()
}

export const file = {
  deleteFileAndPushChanges,
  deleteFileAndCommit,
  writeFileAndCommit,
  writeFileAndPushChanges,
}
