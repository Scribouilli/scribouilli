import './../setup.js'
import { fakeStateWithOneSite } from './../fixtures.js'
import {
  writeFileAndCommit,
  writeFileAndPushChanges,
  deleteFileAndCommit,
  deleteFileAndPushChanges,
} from './../../assets/scripts/actions/file.js'
import gitHelper from './../../assets/scripts/gitHelper.js'
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
      sandbox.stub(gitHelper, 'writeFile').resolves()
      sandbox.stub(gitHelper, 'commit').resolves()
    })

    it('calls removeFile and commit', done => {
      writeFileAndCommit('test.js', 'Curiouser and curiouser!')
        .then(() => {
          expect(gitHelper.writeFile).to.have.been.calledWith(
            'alice',
            'alice.github.io',
            'test.js',
            'Curiouser and curiouser!',
          )
          expect(gitHelper.commit).to.have.been.calledWith(
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
      sandbox.stub(gitHelper, 'writeFile').resolves()
      sandbox.stub(gitHelper, 'commit').resolves()
      sandbox.stub(gitHelper, 'push').resolves()
    })

    it('calls removeFile, commit and push', done => {
      writeFileAndPushChanges('test.js', 'Curiouser and curiouser!')
        .then(() => {
          expect(gitHelper.push).to.have.been.calledWith(
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
      sandbox.stub(gitHelper, 'removeFile').resolves()
      sandbox.stub(gitHelper, 'commit').resolves()
    })

    it('calls removeFile and commit', done => {
      deleteFileAndCommit('test.js')
        .then(() => {
          expect(gitHelper.removeFile).to.have.been.calledWith(
            'alice',
            'alice.github.io',
            'test.js',
          )
          expect(gitHelper.commit).to.have.been.calledWith(
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
      sandbox.stub(gitHelper, 'removeFile').resolves()
      sandbox.stub(gitHelper, 'commit').resolves()
      sandbox.stub(gitHelper, 'push').resolves()
    })

    it('calls removeFile and commit', done => {
      deleteFileAndPushChanges('test.js')
        .then(() => {
          expect(gitHelper.push).to.have.been.calledWith(
            'alice',
            'alice.github.io',
          )
          done()
        })
        .catch(e => done(e))
    })
  })
})
