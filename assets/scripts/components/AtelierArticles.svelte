<script>
  import Skeleton from "./Skeleton.svelte";

  export let publishedWebsiteURL;
  export let buildStatus;
  export let articles;

</script>

<Skeleton {publishedWebsiteURL} {buildStatus}>
  <section class="screen" id="atelier-list-articles">
    <div id="articles">
      <h2>L'atelier — Articles</h2>

      <div class="mesArticles">
        <ul class="articles-list">
          {#each (articles || []).sort() as article}
            <li><a href="./atelier-article?article={article.path}">{article.title}</a></li>
          {/each}
        </ul>

        <a href="./atelier-article" class="btn btn__medium">Nouvel article</a>
      </div>
    </div>
  </section>
</Skeleton>

<style lang="scss">
 .articles-list {
    margin-bottom: 4rem;

    li {
      font-size: 1.3rem;
      & + li {
        margin-top: 2rem;
      }

      a {
        text-transform: capitalize;
      }
    }
  }
</style>
