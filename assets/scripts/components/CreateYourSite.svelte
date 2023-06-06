<script>
  import Skeleton from "./Skeleton.svelte";
  import Loader from "./Loader.svelte";
</script>

<Skeleton>
  <section class="screen">
    <div id="creer_compte_github">
      <h2>Créer un site</h2>
      <p>
        Vous pouvez créer un nouveau site ou partir d'un site existant.
      </p>

      <div class="btn-list">
        <a href="./create-new-site" class="btn">Créer un nouveau site</a>
        <a href="./start-from-existing-site" class="btn">
          Partir d'un site existant
        </a>
      </div>
    </div>
  </section>
</Skeleton>
