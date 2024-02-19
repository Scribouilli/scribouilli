import '../setup.js'
import { fakeStateWithOneSite } from '../fixtures.js'
import {
  saveCustomCSS
} from '../../assets/scripts/actions/current-repository.js'
import gitAgent from '../../assets/scripts/gitAgent.js'
import store from '../../assets/scripts/store.js'

throw 'Test désactivé parce que je ne sais pas stub gitAgent comme propriété de store.state'

// Use a common sandbox for all tests so we can easily restore it after each test.
const sandbox = sinon.createSandbox()

describe('actions/current-repository.js', () => {
  beforeEach(() => {
    sandbox.stub(store, 'state').value(fakeStateWithOneSite)
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('saveCustomCSS', () => {
    before(() => {
      sandbox.stub(gitAgent, 'writeFile').resolves()
      sandbox.stub(gitAgent, 'commit').resolves()
      sandbox.stub(gitAgent, 'safePush').resolves()
    })

    it('calls writeFile, commit and safePush', done => {
      saveCustomCSS('body{ background: pink; }')
        .then(() => {
          expect(gitAgent.writeFile).to.have.been.calledWith(
            store.state.currentRepository,
            'assets/css/custom.css', 
            'body{ background: pink; }'
          )
          expect(gitAgent.commit).to.have.been.calledWith(
            store.state.currentRepository,
            `mise à jour du ficher de styles custom`
          )
          expect(gitAgent.safePush).to.have.been.calledWith(
            store.state.currentRepository
          )
          done()
        })
        .catch(e => done(e))
    })
  })

})
