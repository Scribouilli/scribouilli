<script lang="ts">
  import ListContenu from '#lib/components/atelier/ListContenu.svelte'
  import { onMount } from 'svelte'
  import * as store from '#lib/store.svelte.ts'
  import { blogIndex } from '#lib/article.ts'
  import { deleteFileAndCommit, writeFileAndCommit } from '#lib/git/file.ts'
  import {
    getCurrentRepoArticles,
    getCurrentRepoPages,
    setCurrentRepositoryFromQuerystring,
  } from '#lib/atelier.ts'
  import { handleErrors } from '#lib/error.ts'
  import { page } from '$app/state'
  import { error } from '@sveltejs/kit'
  import { resolve } from '$app/paths'

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

  async function onBlogToggle(blogEnabled: boolean): Promise<void> {
    try {
      if (!blogEnabled) {
        await writeFileAndCommit('blog.md', blogMdContent, 'Activation du blog')
      } else {
        const blogPath = blogIndex(store.state) as string
        await deleteFileAndCommit(blogPath, 'Désactivation du blog')
      }
      await getCurrentRepoArticles()
      await getCurrentRepoPages()

      store.state.gitAgent?.safePush()
    } catch (msg: any) {
      handleErrors(msg)
    }
  }

  onMount(async () => {
    await setCurrentRepositoryFromQuerystring(page.url.searchParams)

    if (!store.state.gitAgent) {
      error(500, 'gitAgent is undefined')
    }
    if (!store.state.currentRepository) {
      error(500, 'currentRepository is undefined')
    }
  })
</script>

<ListContenu
  listContenu={store.state.pages}
  title="Pages"
  atelierPrefix={resolve('/atelier-page')}
  newContentButtonText="Nouvelle page"
  allowModification={true}
  {onBlogToggle}
/>
