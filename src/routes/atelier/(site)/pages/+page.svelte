<script lang="ts">
  import ListContenu from '#lib/components/atelier/ListContenu.svelte'
  import { deleteFileAndPushChanges, writeFileAndPushChanges } from '#lib/git/file.ts'
  import { resolve } from '$app/paths'
  import type { Page } from '#lib/atelier/page.svelte.ts'
  import { error } from '@sveltejs/kit'
  import { getAtelier } from '#lib/atelier/index.svelte.ts'
  import { handleErrors } from '#lib/error.ts'

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
  let atelier = getAtelier()
  let pages: Page[] = $derived(atelier.pages)

  async function onBlogToggle(blogEnabled: boolean): Promise<void> {
    const repo = atelier.repo
    // TODO: move this somewhere else
    try {
      let promise
      if (!blogEnabled) {
        promise = writeFileAndPushChanges(
          repo.gitAgent,
          'blog.md',
          blogMdContent,
          'Activation du blog',
        )
      } else {
        const blogPath = repo.getBlogIndexFilname(pages) as string
        promise = deleteFileAndPushChanges(repo.gitAgent, blogPath, 'Désactivation du blog')
      }

      await repo.sync(promise.then(() => repo.pageList.listAll()))
    } catch (msg: any) {
      handleErrors(msg)
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
