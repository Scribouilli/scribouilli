<script>
  import Skeleton from "../Skeleton.svelte";

  /** @type {string} */
  export let href;

  /** @type {string} */
  export let gitProvider

</script>

<Skeleton>
  {#if gitProvider === 'github.com'}
  <section class="screen" id="login">
    <h2>Super, nous allons vous demander les clefs sur la page suivante.</h2>

    <a {href} class="btn">Je me connecte via GitHub</a>
  </section>
  {/if}
  {#if gitProvider === 'gitlab.com'}
  <section class="screen" id="login">
    <h2>Super, nous allons vous demander les clefs sur la page suivante.</h2>

    <a {href} class="btn">Je me connecte via gitlab.com</a>
  </section>
  {/if}
  {#if gitProvider === 'git.scribouilli.org'}
  <section class="screen" id="login">
    <h2>Super, nous allons vous demander les clefs sur la page suivante.</h2>

    <a {href} class="btn">Je me connecte via git.scribouilli.org</a>
  </section>
  {/if}
</Skeleton>

<style>
  #login {
    width: 70%;
    margin: 0 auto;
  }
</style>
