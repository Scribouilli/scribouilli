import './../setup.js'
import { fakeStateWithOneSite } from './../fixtures.js'
import {
  writeFileAndCommit,
  writeFileAndPushChanges,
  deleteFileAndCommit,
  deleteFileAndPushChanges,
} from './../../assets/scripts/actions/file.js'
import databaseAPI from './../../assets/scripts/databaseAPI.js'
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
      sandbox.stub(databaseAPI, 'writeFile').resolves()
      sandbox.stub(databaseAPI, 'commit').resolves()
    })

    it('calls removeFile and commit', done => {
      writeFileAndCommit('test.js', 'Curiouser and curiouser!')
        .then(() => {
          expect(databaseAPI.writeFile).to.have.been.calledWith(
            'alice',
            'alice.github.io',
            'test.js',
            'Curiouser and curiouser!',
          )
          expect(databaseAPI.commit).to.have.been.calledWith(
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
      sandbox.stub(databaseAPI, 'writeFile').resolves()
      sandbox.stub(databaseAPI, 'commit').resolves()
      sandbox.stub(databaseAPI, 'push').resolves()
    })

    it('calls removeFile, commit and push', done => {
      writeFileAndPushChanges('test.js', 'Curiouser and curiouser!')
        .then(() => {
          expect(databaseAPI.push).to.have.been.calledWith(
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
      sandbox.stub(databaseAPI, 'removeFile').resolves()
      sandbox.stub(databaseAPI, 'commit').resolves()
    })

    it('calls removeFile and commit', done => {
      deleteFileAndCommit('test.js')
        .then(() => {
          expect(databaseAPI.removeFile).to.have.been.calledWith(
            'alice',
            'alice.github.io',
            'test.js',
          )
          expect(databaseAPI.commit).to.have.been.calledWith(
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
      sandbox.stub(databaseAPI, 'removeFile').resolves()
      sandbox.stub(databaseAPI, 'commit').resolves()
      sandbox.stub(databaseAPI, 'push').resolves()
    })

    it('calls removeFile and commit', done => {
      deleteFileAndPushChanges('test.js')
        .then(() => {
          expect(databaseAPI.push).to.have.been.calledWith(
            'alice',
            'alice.github.io',
          )
          done()
        })
        .catch(e => done(e))
    })
  })
})
