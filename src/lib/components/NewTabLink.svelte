<script lang="ts">
  import IconNewTabLink from '#lib/components/icons/IconNewTabLink.svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    class?: string
    href: string
    children: Snippet
  }

  let { class: linkClass, href, children }: Props = $props()

  let inner: HTMLElement | undefined = $state()
</script>

<a
  {href}
  class={linkClass ?? ''}
  target="_blank"
  title={inner ? `${inner.innerText} — nouvel onglet` : ''}
>
  <span bind:this={inner}>{@render children()}</span>
  <IconNewTabLink /><span class="visually-hidden">(nouvel onglet)</span>
</a>
