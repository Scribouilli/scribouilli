import { registerHooks } from 'node:module'

registerHooks({
  // Un hook qui remplace store.ts avec fake-store.ts
  resolve(specifier, context, nextResolve) {
    if (specifier.endsWith('/store.ts') || specifier.endsWith('/store')) {
      const url = new URL(specifier, context.parentURL)
      if (url.pathname.endsWith('/assets/scripts/store.ts')) {
        return {
          url: new URL('./fake-store.ts', import.meta.url).toString(),
          shortCircuit: true,
        }
      }
    }
    return nextResolve(specifier, context)
  },
})
