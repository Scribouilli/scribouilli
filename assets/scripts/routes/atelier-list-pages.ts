import { replaceComponent } from '../routeComponentLifeCycle.svelte'
import { setCurrentRepositoryFromQuerystring } from '../actions/current-repository.ts'
import AtelierPages from '../components/screens/AtelierPages.svelte'
import { blogIndex, showArticles } from '../actions/article'
import { Context } from 'page'
import type { ScribouilliState } from '../store.ts'
import { writeFileAndCommit, deleteFileAndCommit } from '../actions/file'
import {
  getCurrentRepoPages,
  getCurrentRepoArticles,
} from '../actions/current-repository.ts'
import { handleErrors } from '../utils.ts'

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

const mapStateToProps = (state: ScribouilliState) => {
  const blogFile = blogIndex(state)

  const { currentRepository, gitAgent } = state
  if (!gitAgent) {
    throw new TypeError('gitAgent is undefined')
  }
  if (!currentRepository) {
    throw new TypeError('currentRepository is undefined')
  }

  return {
    pages: state.pages,
    buildStatus: state.buildStatus,
    currentRepository: currentRepository,
    showArticles: showArticles(state),
    conflict: state.conflict,
    blogEnabled: blogFile !== undefined,
    onBlogToggle: async (blogEnabled: boolean): Promise<void> => {
      try {
        if (!blogEnabled) {
          await writeFileAndCommit(
            'blog.md',
            blogMdContent,
            'Activation du blog',
          )
        } else {
          const blogPath = blogIndex(state) as string
          await deleteFileAndCommit(blogPath, 'Désactivation du blog')
        }
        await getCurrentRepoArticles()
        await getCurrentRepoPages()

        gitAgent.safePush()
      } catch (msg: any) {
        handleErrors(msg)
      }
    },
  }
}

export default async ({ querystring }: Context) => {
  await setCurrentRepositoryFromQuerystring(querystring)

  replaceComponent(AtelierPages, mapStateToProps)
}
