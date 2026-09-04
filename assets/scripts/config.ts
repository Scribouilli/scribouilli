import type { ScribouilliBackendProvider } from './types/atelier'
import type { GitSiteTemplate } from './types/git'

export const DEFAULT_CORS_PROXY_URL = 'https://cors.isomorphic-git.org'
export const OAUTH_PROVIDER_STORAGE_KEY = 'scribouilli_oauth_provider'
export const TOCTOCTOC_ORIGIN = `http://localhost:4000`
export const TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER = 'access_token'
export const TOCTOCTOC_OAUTH_PROVIDER_URL_PARAMETER = 'type'
export const TOCTOCTOC_OAUTH_PROVIDER_ORIGIN_PARAMETER = 'origin'
export const defaultRepositoryName = 'mon-scribouilli'
export const gitHubApiBaseUrl = 'https://api.github.com'

export const CUSTOM_CSS_PATH = 'assets/css/custom.css'

export const TEMPLATES: GitSiteTemplate[] = [
  {
    url: 'https://github.com/Scribouilli/site-template.git',
    description: 'mon site vitrine ou mon blog',
    githubRepoId: 'Scribouilli/site-template',
  },
  {
    url: 'https://github.com/Scribouilli/site-template-framalibre.git',
    description: 'ma liste de recommandations liée à Framalibre',
    githubRepoId: 'Scribouilli/site-template-framalibre',
  },
]

export const DEFAULT_TEMPLATE = TEMPLATES[0]

export const PROVIDERS: ScribouilliBackendProvider[] = [
  {
    id: 'localhost',
    type: 'scribouilli',
    origin: 'http://localhost:3000',
    name: 'Scribouilli',
    description: `<strong>Scribouilli</strong>, vous pouvez utilizer Scribouilli pour héberger directement votre site.`,
    signupEnabled: false,
  },
  {
    id: 'gitlab.com',
    type: 'gitlab',
    origin: 'https://gitlab.com',
    clientId:
      '60145cc8950ce0e6486ce2590975c5ffa104b955b9f66e0d58dddbd5a0a13965',
    name: 'Gitlab',
    description: `
      <strong>Gitlab.com</strong> qui est un hébergeur professionnel.<br>
      Si vous n'avez pas encore de compte, Gitlab demandera à <a href="https://docs.gitlab.com/ee/security/identity_verification.html" target="_blank">vérifier votre identité</a> avec un n° de téléphone ou de carte bleue.
    `,
    signupEnabled: true,
    signupLink: 'https://gitlab.com/users/sign_up',
    corsProxy: DEFAULT_CORS_PROXY_URL,
  },
  {
    id: 'git.scribouilli.org',
    type: 'gitlab',
    origin: 'https://git.scribouilli.org',
    clientId:
      '3e8ac6636615d396a8f73e02fa3880e7e2140981b0ca27b0f240a450f69f1c76',
    name: 'ScribouGit',
    description: `
      <strong>ScribouGit</strong>, l'hébergement géré par l'équipe de Scribouilli.<br>
      Si vous n'avez pas encore de compte, nous prendrons le temps de le valider manuellement (cela peut prendre quelques jours).
    `,
    signupEnabled: false,
    signupInstructions: `
      <p>
        Pour vérifier que vous n'êtes pas un robot, envoyez-nous un mail à
        <strong>coucou@scribouilli.org</strong> en indiquant :
      </p>

      <ul class="simple-list">
        <li>le pseudo que vous souhaitez,</li>
        <li>l'email avec lequel vous voulez créer votre compte,</li>
        <li>un message pour nous indiquer quel genre de petit site vous voulez
        créer.</li>
      </ul>
      <p>Pour information, la création du compte pourrait prendre quelques jours de notre côté, on vous préviendra par mail quand c'est fait !
      </p>
    `,
    corsProxy: DEFAULT_CORS_PROXY_URL,
  },
  {
    id: 'github.com',
    origin: 'https://github.com',
    clientId: '64ecce0b01397c2499a6',
    type: 'github',
    description: `Microsoft GitHub®, si vous l'utilisez déjà.`,
    name: 'GitHub',
    signupEnabled: true,
    signupLink: 'https://github.com/signup',
    signupInstructions: `
      <p>
        Pour pouvoir publier votre contenu, il faut que Scribouilli se connecte
        à un compte <a href="https://github.com" target="_blank">GitHub</a>.
      </p>
      <p>La création va se passer sur GitHub.com.</p>
      <p class="text-align-start">Elle comporte 3 étapes :</p>
      <ol>
        <li>
          Rentrez votre mail, mot de passe, et votre nom d'utilisateur·ice
        </li>
        <li>
          Ouvrez le mail que GitHub vous a envoyé, et copiez le code pour
          confirmer votre compte
        </li>
        <li>
          Dès que le code est validé, <strong>revenez sur Scribouilli</strong> et
          cliquez sur <a href="./login?provider=github.com">"J'ai créé un compte"</a>
        </li>
      </ol>
    `,
    corsProxy: DEFAULT_CORS_PROXY_URL,
  },
]
export const PROVIDERS_MAP = new Map(
  PROVIDERS.map(provider => [provider.id, provider]),
)

export const svelteTarget: Element = document.body
