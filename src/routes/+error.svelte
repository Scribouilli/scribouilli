<script lang="ts">
  let { error } = $props()
</script>

<div class="container">
  <h1>Une erreur est survenue</h1>

  <div class="white-zone">
    <code>{error.message}</code>
  </div>
</div>
