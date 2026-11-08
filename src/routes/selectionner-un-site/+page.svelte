<script lang="ts">
  import { resolve } from '$app/paths'
</script>

<section class="screen">
  <div id="creer_compte_github">
    <h2>Travailler sur votre site</h2>
    <p>Vous pouvez créer un nouveau site ou partir d'un site existant.</p>

    <div class="btn-list">
      <a href={resolve(`/creer-un-nouveau-site`)} class="btn">Créer un nouveau site</a>
      <a href={resolve(`/partir-dun-site-existant`)} class="btn"> Partir d'un site existant </a>
    </div>
  </div>
</section>
