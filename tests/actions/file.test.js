import './../setup.js'
import { deleteFileAndCommit } from './../../assets/scripts/actions/file.js'
import databaseAPI from './../../assets/scripts/databaseAPI.js'

describe('deleteFileAndCommit', () => {
  before(() => {
    const sandbox = sinon.createSandbox()

    sandbox.stub(databaseAPI, 'removeFile').resolves()
    sandbox.stub(databaseAPI, 'commit').resolves()
  })

  it('calls removeFile and commit', done => {
    deleteFileAndCommit('test.js')
      .then(() => {
        expect(databaseAPI.removeFile).to.have.been.calledWith(
          'the-madhatter',
          'alice',
          'test.js',
        )
        expect(databaseAPI.commit).to.have.been.calledWith(
          'the-madhatter',
          'alice',
          'Suppression du fichier test.js',
        )
        done()
      })
      .catch(e => done(e))
  })
})
