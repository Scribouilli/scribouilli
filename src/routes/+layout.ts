import { browser } from '$app/env'

export const prerender = true

if (browser) {
  // Buffer est utilisé par les dépendances de isomorphic-git
  const buffer = await import('buffer')
  window.Buffer = buffer.Buffer
}
