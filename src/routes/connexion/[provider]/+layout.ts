import type { LayoutLoad } from './$types';
import { PROVIDERS_MAP } from "#lib/config.ts"
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = ({ params }) => {
  const provider = PROVIDERS_MAP.get(params.provider)

  if (!provider) {
    error(404, `Unkown provider ${params.provider}`)
  }

  return {
    provider
  }
}
