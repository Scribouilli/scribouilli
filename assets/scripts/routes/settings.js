// @ts-check

import { svelteTarget } from "../config";
import databaseAPI from "../databaseAPI";
import { replaceComponent } from "../routeComponentLifeCycle";
import store from "../store";
import { getCurrentRepoPages, setArticles, setCurrentRepositoryFromQuerystring } from "../actions";
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
  const blogFile = state.pages.find(p => p.path === 'blog.md')
  return {
    buildStatus: state.buildStatus,
    theme: state.theme,
    deleteRepositoryUrl: `https://github.com/${state.login}/${state.currentRepository.name}/settings#danger-zone`,
    blogEnabled: blogFile !== undefined,
    showArticles: blogFile !== undefined || state.articles?.length > 0,
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
        .writeCustomCSS(login, store.state.currentRepository.name, theme.css)
        .then((_) => {
          store.mutations.setTheme(store.state.theme.css);
          store.state.buildStatus.setBuildingAndCheckStatusLater(10000);
        })
        .catch((msg) => handleErrors(msg));
    });
  });

  settings.$on("toggle-blog", async ({ detail: { activated } }) => {
    const login = await store.state.login

    try {
      if (activated) {
        await databaseAPI.writeFile(
          login,
          store.state.currentRepository.name,
          'blog.md',
          blogMdContent,
          'Activation du blog',
        )
      } else {
        await databaseAPI.deleteFile(
          login,
          store.state.currentRepository.name,
          'blog.md',
        )
      }
      await setArticles(login)
    } catch (msg) {
      handleErrors(msg)
    }
  })

  if (!store.state.theme.css) {
    Promise.resolve(store.state.login).then((login) => {
      databaseAPI
        .getFile(login, store.state.currentRepository.name, databaseAPI.customCSSPath)
        .then((content) => {
          store.mutations.setTheme(
            content
          );
        })
        .catch((msg) => handleErrors(msg));
    });
  }

  replaceComponent(settings, mapStateToProps);

  Promise.resolve(store.state.login).then(() => getCurrentRepoPages());
};
