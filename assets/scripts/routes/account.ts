import { Context } from 'page'
import Account from '../components/screens/Account.svelte'
import { replaceComponent } from '../routeComponentLifeCycle.svelte.ts'

export default ({ querystring }: Context) => {
  const params = new URLSearchParams(querystring)
  const gitProvider = params.get('provider')

  console.log('gitProvider', gitProvider)

  if (!gitProvider) {
    throw new TypeError(`Missing 'provider' parameter`)
  }

  // TODO: vérifier que c'est ok d'avoir des props qui viennent pas du state,
  // mais du monde extérieur (ici l'URL de la page)
  replaceComponent(Account, () => {
    return { gitProvider }
  })
}
