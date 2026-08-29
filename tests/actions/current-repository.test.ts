import '../setup.ts'
import { file } from '../../assets/scripts/actions/file.ts'
import { saveCustomCSS } from '../../assets/scripts/actions/current-repository.ts'
import { CUSTOM_CSS_PATH } from '../../assets/scripts/config.ts'
import { describe } from 'mocha'
import sinon from 'sinon'
import { expect } from 'chai'
import GitAgent from '../../assets/scripts/GitAgent.ts'
import GitHubAPI from '../../assets/scripts/oauth-services-api/github.ts'

describe('actions/current-repository.ts', () => {
  describe('saveCustomCSS', () => {
    it('calls writeFile, commit and safePush', done => {
      const fakeStore = {
        mutations: {
          setTheme: sinon.stub(),
        },
        state: {
          currentRepository: {
            origin: 'github.com',
            publicRepositoryURL: 'https://github.com/test/site',
            owner: 'test',
            repoName: 'site',
            repoId: 'test-site',
            publishedWebsiteURL: Promise.resolve('https://test.github.io/site'),
            repoType: 'github' as const
          },
          gitAgent: new GitAgent({
            remoteURL: 'https://github.com',
            repoId: 'test-site',
            gitServiceProvider: new GitHubAPI('fake token')
          }),
        },
        subscribe: sinon.stub(),
      }
      sinon.stub(file, 'writeFileAndPushChanges')
      const css = 'body { background: pink; }'

      saveCustomCSS(css, fakeStore)

      expect(file.writeFileAndPushChanges).to.have.been.calledWithExactly(
        CUSTOM_CSS_PATH,
        css,
        'mise à jour du fichier de styles custom',
      )

      done()
    })
  })
})
