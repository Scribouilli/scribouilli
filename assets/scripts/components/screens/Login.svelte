<script>
  import Skeleton from "../Skeleton.svelte";

  export let href;
</script>

<Skeleton>
  <section class="screen" id="login">
    <h2>Super, nous allons vous demander les clefs sur la page suivante.</h2>

    <a id="github-login" {href} class="btn">Je me connecte via GitHub</a>
  </section>
</Skeleton>

<style>
  #login {
    width: 70%;
    margin: 0 auto;
  }
</style>
