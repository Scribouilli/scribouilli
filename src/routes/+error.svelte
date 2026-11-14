<script lang="ts">
  let { error } = $props()
</script>

<section class="screen">
  <header>
    <h2>Une erreur est survenue</h2>
  </header>
  <div class="wrapper white-zone">
    <code>{error.message}</code>
  </div>
</section>
