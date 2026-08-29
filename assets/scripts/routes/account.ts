import { Context } from 'page'
import Account from '../components/screens/Account.svelte'
import { replaceComponent } from '../routeComponentLifeCycle.svelte.ts'
import { PROVIDERS_MAP } from '../config.ts'

export default ({ querystring }: Context) => {
  const params = new URLSearchParams(querystring)
  const providerId = params.get('provider')

  console.log('providerId', providerId)

  if (!providerId) {
    throw new TypeError(`Missing 'provider' parameter`)
  }

  const provider = PROVIDERS_MAP.get(providerId)

  if (!provider) {
    throw new TypeError(`Unkown provider ${providerId}`)
  }

  // TODO: vérifier que c'est ok d'avoir des props qui viennent pas du state,
  // mais du monde extérieur (ici l'URL de la page)
  replaceComponent(Account, () => {
    return { provider }
  })
}
