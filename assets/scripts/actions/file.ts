import GitAgent from '../GitAgent.ts'
import store, { type PartialStore } from '../store.ts'

export const writeFileAndCommit = async (
  fileName: string,
  content: string | Uint8Array,
  commitMessage?: string,
  localStore: PartialStore<'gitAgent', never> = store,
): Promise<string> => {
  if (typeof commitMessage !== 'string' || commitMessage === '') {
    commitMessage = `Modification du fichier ${fileName}`
  }
  const { gitAgent } = localStore.state

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
  localStore = store,
): ReturnType<typeof GitAgent.prototype.safePush> => {
  const { gitAgent } = localStore.state

  if (!gitAgent) {
    throw new TypeError('gitAgent is undefined')
  }

  await writeFileAndCommit(fileName, content, commitMessage)
  return gitAgent.safePush()
}

export const deleteFileAndCommit = async (
  fileName: string,
  commitMessage: string = '',
  localStore = store,
): ReturnType<typeof GitAgent.prototype.commit> => {
  const { gitAgent } = localStore.state

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
  localStore = store,
): ReturnType<typeof GitAgent.prototype.safePush> => {
  const { gitAgent } = localStore.state

  if (!gitAgent) {
    throw new TypeError('gitAgent is undefined')
  }

  deleteFileAndCommit(fileName, commitMessage, localStore)
  return gitAgent.safePush()
}

export const file = {
  deleteFileAndPushChanges,
  deleteFileAndCommit,
  writeFileAndCommit,
  writeFileAndPushChanges,
}
