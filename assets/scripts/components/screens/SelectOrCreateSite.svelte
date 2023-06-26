<script>
  import Skeleton from "./../Skeleton.svelte";
  import Loader from "./../loaders/Loader.svelte";
</script>

<Skeleton>
  <section class="screen">
    <div id="creer_compte_github">
      <h2>Travailler sur votre site</h2>
      <p>
        Vous pouvez créer un nouveau site ou partir d'un site existant.
      </p>

      <div class="btn-list">
        <a href="./creer-un-nouveau-site" class="btn">Créer un nouveau site</a>
        <a href="./partir-dun-site-existant" class="btn">
          Partir d'un site existant
        </a>
      </div>
    </div>
  </section>
</Skeleton>
