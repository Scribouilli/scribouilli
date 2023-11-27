import './../setup.js'
import { fakeStateWithOneSite } from './../fixtures.js'
import {
  writeFileAndCommit,
  writeFileAndPushChanges,
  deleteFileAndCommit,
  deleteFileAndPushChanges,
} from './../../assets/scripts/actions/file.js'
import gitAgent from './../../assets/scripts/gitAgent.js'
import store from './../../assets/scripts/store.js'

// Use a common sandbox for all tests so we can easily restore it after each test.
const sandbox = sinon.createSandbox()

describe('actions/file.js', () => {
  beforeEach(() => {
    sandbox.stub(store, 'state').value(fakeStateWithOneSite)
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('writeFileAndCommit', () => {
    before(() => {
      sandbox.stub(gitAgent, 'writeFile').resolves()
      sandbox.stub(gitAgent, 'commit').resolves()
    })

    it('calls removeFile and commit', done => {
      writeFileAndCommit('test.js', 'Curiouser and curiouser!')
        .then(() => {
          expect(gitAgent.writeFile).to.have.been.calledWith(
            'alice',
            'alice.github.io',
            'test.js',
            'Curiouser and curiouser!',
          )
          expect(gitAgent.commit).to.have.been.calledWith(
            'alice',
            'alice.github.io',
            'Modification du fichier test.js',
          )
          done()
        })
        .catch(e => done(e))
    })
  })

  describe('writeFileAndPushChanges', () => {
    before(() => {
      sandbox.stub(gitAgent, 'writeFile').resolves()
      sandbox.stub(gitAgent, 'commit').resolves()
      sandbox.stub(gitAgent, 'push').resolves()
    })

    it('calls removeFile, commit and push', done => {
      writeFileAndPushChanges('test.js', 'Curiouser and curiouser!')
        .then(() => {
          expect(gitAgent.push).to.have.been.calledWith(
            'alice',
            'alice.github.io',
          )
          done()
        })
        .catch(e => done(e))
    })
  })

  describe('deleteFileAndCommit', () => {
    before(() => {
      sandbox.stub(gitAgent, 'removeFile').resolves()
      sandbox.stub(gitAgent, 'commit').resolves()
    })

    it('calls removeFile and commit', done => {
      deleteFileAndCommit('test.js')
        .then(() => {
          expect(gitAgent.removeFile).to.have.been.calledWith(
            'alice',
            'alice.github.io',
            'test.js',
          )
          expect(gitAgent.commit).to.have.been.calledWith(
            'alice',
            'alice.github.io',
            'Suppression du fichier test.js',
          )
          done()
        })
        .catch(e => done(e))
    })
  })

  describe('deleteFileAndPushChanges', () => {
    before(() => {
      sandbox.stub(gitAgent, 'removeFile').resolves()
      sandbox.stub(gitAgent, 'commit').resolves()
      sandbox.stub(gitAgent, 'push').resolves()
    })

    it('calls removeFile and commit', done => {
      deleteFileAndPushChanges('test.js')
        .then(() => {
          expect(gitAgent.push).to.have.been.calledWith(
            'alice',
            'alice.github.io',
          )
          done()
        })
        .catch(e => done(e))
    })
  })
})
