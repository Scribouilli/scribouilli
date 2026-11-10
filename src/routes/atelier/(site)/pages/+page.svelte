<script lang="ts">
  import ListContenu from '#lib/components/atelier/ListContenu.svelte'
  import { deleteFileAndPushChanges, writeFileAndPushChanges } from '#lib/git/file.ts'
  import { resolve } from '$app/paths'
  import { getCurrentRepo } from '#lib/context.ts'
  import type { Page } from '#lib/page.ts'
  import { error } from '@sveltejs/kit'

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
  let repo = getCurrentRepo()
  let pages: Page[] = $state([])

  repo.pages.listAll().then(newPages => (pages = newPages))

  async function onBlogToggle(blogEnabled: boolean): Promise<void> {
    const repo = getCurrentRepo()
    // TODO: move this somewhere else
    try {
      if (!blogEnabled) {
        await writeFileAndPushChanges(repo.gitAgent, 'blog.md', blogMdContent, 'Activation du blog')
      } else {
        const blogPath = repo.getBlogIndexFilname(pages) as string
        await deleteFileAndPushChanges(repo.gitAgent, blogPath, 'Désactivation du blog')
      }
      pages = await repo.pages.listAll()
    } catch (msg: any) {
      console.error(msg)
      error(500, String(msg))
    }
  }
</script>

<ListContenu
  listContenu={pages}
  title="Pages"
  atelierPrefix={resolve('/atelier/(site)/pages/edit')}
  newContentButtonText="Nouvelle page"
  allowModification={true}
  {onBlogToggle}
/>
