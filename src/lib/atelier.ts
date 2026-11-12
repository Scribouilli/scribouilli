import yaml from 'js-yaml'

import ScribouilliGitRepo from '#lib/atelier/repo.svelte.ts'
import { logMessage } from '#lib/logger.ts'
import { handleErrors } from '#lib/error.ts'
import { file } from '#lib/git/file.ts'
import { CUSTOM_CSS_PATH } from '#lib/config.ts'

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
  inMenu: boolean
  blogIndex: boolean
  index: number
}

/**
 * @description if baseurl param is set, always update the config with it
 * otherwise, wait for currentRepository.publishedWebsiteURL and
 * compute the new config.baseurl from it
 */
export const setBaseUrlInConfigIfNecessary = async (repo: ScribouilliGitRepo, baseUrl?: string): Promise<any> => {
  let newBaseUrl

  if (baseUrl) {
    // Trim trailing slash
    newBaseUrl = baseUrl.replace(/\/$/, '')
  } else {
    if (repo.repoType === 'github') {
      // Here the repo has finished loading and is ready, so publishedUrl is string
      // TODO: I don’t like the cast
      const publishedWebsiteURL = repo.publishedUrl as string
      const url = new URL(publishedWebsiteURL)

      newBaseUrl = url.pathname.replace(/\/$/, '')
    } else {
      // GitLab instances use Single Domain Pages
      newBaseUrl = ''
    }
  }

  const config = await getCurrentRepoConfig(repo)
  const currentBaseURL = config.baseurl || ''

  if (currentBaseURL === newBaseUrl) {
    // the config does not need to be changed, so let's skip both write/commit/push
    return
  } else {
    if (newBaseUrl === '') {
      console.log('delete baseurl from config')
      delete config.baseurl
    } else {
      console.log('update baseurl in config')
      config.baseurl = newBaseUrl
    }

    const configYmlContent = yaml.dump(config)

    console.log('configYmlContent', configYmlContent)
    return file.writeFileAndPushChanges(
      repo.gitAgent,
      '_config.yml',
      configYmlContent,
      'Mise à jour de `baseurl` dans la config',
    )
  }
}
/**
 * @returns true if the plugin was installed, false if it was already here.
 */
export async function installPluginIfNecessary(
  repo: ScribouilliGitRepo,
  plugin: string,
  version: string
): Promise<boolean> {
  const config: { plugins: string[] } = await getCurrentRepoConfig(repo)

  if (config.plugins.includes(plugin)) {
    return false
  }

  config.plugins.push(plugin)
  const newConfig = yaml.dump(config)

  try {
    const gemFile = await repo.gitAgent.getFile('Gemfile')
    const SECTION_START = 'group :jekyll_plugins do\n'
    const pluginSectionStart = gemFile.indexOf(SECTION_START) + SECTION_START.length
    const newGemfile =
      gemFile.slice(0, pluginSectionStart) +
      `  gem "${plugin}", "~> ${version}"\n\n` +
      gemFile.slice(pluginSectionStart)

    await file.writeFileAndCommit(repo.gitAgent, 'Gemfile', newGemfile, 'Ajout de la gem ' + plugin)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'erreur inconnue'
    logMessage(
      "Erreur lors de la mise à jour du Gemfile, il n'existe probablement pas: " + message,
      'installPluginIfNecessary',
      'warn',
    )
  }

  await file.writeFileAndPushChanges(repo.gitAgent, '_config.yml', newConfig, 'Ajout du plugin ' + plugin)
  return true
}

const getCurrentRepoConfig = async (repo: ScribouilliGitRepo): Promise<any> => {
  return repo.gitAgent
    .getFile('_config.yml')
    .then(configStr => yaml.load(configStr))
    .catch(handleErrors)
}

export function saveCustomCSS(
  repo: ScribouilliGitRepo,
  css: string,
): ReturnType<typeof file.writeFileAndPushChanges> | Promise<void> {
  return file.writeFileAndPushChanges(
    repo.gitAgent,
    CUSTOM_CSS_PATH,
    css,
    'mise à jour du fichier de styles custom',
  )
}
