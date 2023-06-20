// @ts-check

import { svelteTarget } from "../config";
import databaseAPI from "../databaseAPI";
import { replaceComponent } from "../routeComponentLifeCycle";
import store from "../store";
import { setCurrentRepositoryFromQuerystring } from "../actions";
import { handleErrors } from "../utils";
import Settings from "../components/screens/Settings.svelte";

const blogMdContent =
`---
layout: default
title: Articles
permalink: /articles/
---
<h1>
  Articles
</h1>

{% for post in site.posts %}
<article class="blog-item">
  <h2>
    <a href="{{post.url | relative_url}}"> {{ post.title }} </a>
  </h2>

  <a href="{{post.url | relative_url}}"> Lire l'article ➞ </a>
</article>
<hr />
{% endfor %}
`

function mapStateToProps(state) {
  return {
    buildStatus: state.buildStatus,
    theme: state.theme,
    deleteRepositoryUrl: `https://github.com/${state.login}/${state.currentRepository.name}/settings#danger-zone`,
    blogEnabled: state.blogIndexSha !== undefined,
    showArticles: state.blogIndexSha !== undefined || state.articles?.length > 0,
    currentRepository: state.currentRepository,
  };
}

export default ({ querystring }) => {
    setCurrentRepositoryFromQuerystring(querystring);

  const settings = new Settings({
    target: svelteTarget,
    props: mapStateToProps(store.state),
  });

  settings.$on("delete-site", () => {
    Promise.resolve(store.state.login).then((login) => {
      databaseAPI
        .deleteRepository(login, store.state.currentRepository.name)
        .then(() => {
          store.mutations.removeSite(store.state);
          page("/create-project");
        })
        .catch((msg) => handleErrors(msg));
    });
  });

  settings.$on("update-theme", ({ detail: { theme } }) => {
    Promise.resolve(store.state.login).then((login) => {
      databaseAPI
        .updateCustomCSS(login, store.state.currentRepository.name, theme.css, theme.sha)
        .then((response) => {
          store.mutations.setTheme(store.state.theme.css, response.content.sha);
          store.state.buildStatus.setBuildingAndCheckStatusLater(10000);
        })
        .catch((msg) => handleErrors(msg));
    });
  });

  settings.$on("toggle-blog", async ({ detail: { activated } }) => {
    const login = await store.state.login

    try {
      if (activated) {
        const resp = await databaseAPI.createFile(
          login,
          store.state.currentRepository.name,
          'blog.md',
          {
            message: 'Activation du blog',
            content: Buffer.from(blogMdContent).toString('base64'),
          },
        )
        const { content: { sha } } = await resp.json()
        store.mutations.setBlogIndexSha(sha)
      } else {
        await databaseAPI.deleteFile(
          login,
          store.state.currentRepository.name,
          'blog.md',
          store.state.blogIndexSha
        )
        store.mutations.setBlogIndexSha(undefined)
      }
    } catch (msg) {
      handleErrors(msg)
    }
  })

  if (!store.state.theme.sha) {
    Promise.resolve(store.state.login).then((login) => {
      databaseAPI
        .getFile(login, store.state.currentRepository.name, databaseAPI.customCSSPath)
        .then(({ content, sha }) => {
          store.mutations.setTheme(
            Buffer.from(content, "base64").toString().trim(),
            sha
          );
        })
        .catch((msg) => handleErrors(msg));
    });
  }

  replaceComponent(settings, mapStateToProps);
};
