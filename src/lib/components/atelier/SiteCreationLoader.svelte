<script lang="ts">
  import heartsLoader from '#lib/assets/images/hearts.svg'
  import NewTabLink from '../NewTabLink.svelte'
</script>

<h2>Nous sommes en train de créer le site&nbsp;!</h2>
<p>Cela peut prendre 2-3 minutes…</p>
<img src={heartsLoader} alt="cœur sur toi le temps que ça charge" />
<div>
  <p>Pendant le chargement, vous pouvez&nbsp;:</p>
  <ul>
    <li>

      lire un article pour apprendre à
      <NewTabLink href="https://flus.fr/carnet/markdown.html">bidouiller avec du Markdown</NewTabLink>
      .
    </li>
    <li>ou chanter une petite chanson.</li>
  </ul>
</div>
