import './setup.js'
import store from './../assets/scripts/store.js'

export const mochaHooks = {
  beforeEach() {
    const sandbox = sinon.createSandbox()

    sandbox.stub(store, 'state').value({
      currentRepository: {
        name: 'alice',
        owner: 'the-madhatter',
      },
    })
  },
  afterEach() {
    sinon.restore()
  },
}
