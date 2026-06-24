import { CUSTOM_CSS_PATH } from '../config'
import { replaceComponent } from '../routeComponentLifeCycle.svelte'
import store, { type ScribouilliState } from '../store'
import {
  getCurrentRepoPages,
  getCurrentRepoArticles,
  setCurrentRepositoryFromQuerystring,
  saveCustomCSS,
} from '../actions/current-repository.ts'
import { handleErrors } from '../utils'
import Settings from '../components/screens/Settings.svelte'
import { writeFileAndCommit, deleteFileAndCommit } from '../actions/file'
import { blogIndex, showArticles } from '../actions/article'
import { Context } from 'page'

const blogMdContent = `---
layout: page
title: Articles
permalink: /articles/
blog_index: true
---
<aside>
  S'abonner via le <a href="{{ '/feed.xml' | relative_url }}">flux RSS</a>
  (<a href="https://flus.fr/carnet/a-quoi-servent-les-flux.html">c'est quoi ?</a>)
</aside>

{% for post in site.posts %}
<article class="blog-item">
  <h2>
    {{ post.title }}
  </h2>

  <a href="{{post.url | relative_url}}"> Lire l'article <span aria-hidden="true">➞</span></a>
</article>
<hr />
{% endfor %}
`

function mapStateToProps(state: ScribouilliState) {
  const blogFile = blogIndex(state)
  // TODO: this should probably be `state` not `store.state`
  const { currentRepository, gitAgent } = store.state

  if (!gitAgent) {
    throw new TypeError('gitAgent is undefined')
  }

  if (!currentRepository) {
    throw new TypeError('currentRepository is undefined')
  }

  return {
    buildStatus: state.buildStatus,
    theme: state.theme,
    deleteRepositoryUrl: `${currentRepository.publicRepositoryURL}/settings#danger-zone`,
    blogEnabled: blogFile !== undefined,
    showArticles: showArticles(state),
    currentRepository: state.currentRepository,
    onUpdateTheme: (theme: { css: string }): void => {
      saveCustomCSS(theme.css).catch(handleErrors)
    },
    onToggleBlog: async (activated: boolean): Promise<void> => {
      try {
        if (activated) {
          await writeFileAndCommit(
            'blog.md',
            blogMdContent,
            'Activation du blog',
          )
        } else {
          await deleteFileAndCommit('blog.md', 'Désactivation du blog')
        }
        await getCurrentRepoArticles()
        await getCurrentRepoPages()

        gitAgent.safePush()
      } catch (msg) {
        //@ts-ignore
        handleErrors(msg)
      }
    },
  }
}

export default async ({ querystring }: Context) => {
  await setCurrentRepositoryFromQuerystring(querystring)

  const { gitAgent } = store.state
  if (!gitAgent) {
    throw new TypeError('gitAgent is undefined')
  }

  // TODO: should that really be here?
  if (!store.state.theme.css) {
    gitAgent
      .getFile(CUSTOM_CSS_PATH)
      .then(content => {
        store.mutations.setTheme(content)
      })
      .catch(msg => handleErrors(msg))
  }

  getCurrentRepoPages()

  replaceComponent(Settings, mapStateToProps)
}
