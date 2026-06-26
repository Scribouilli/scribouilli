import './../setup.ts'
import {
  writeFileAndCommit,
  writeFileAndPushChanges,
  deleteFileAndCommit,
  deleteFileAndPushChanges,
} from './../../assets/scripts/actions/file.ts'
import store from './../../assets/scripts/store.ts'
import sinon from 'sinon'
import { expect } from 'chai'

describe('actions/file.ts', () => {
  beforeEach(() => {
    sinon.reset()
  })

  describe('writeFileAndCommit', () => {
    it('calls writeFile and commit', done => {
      writeFileAndCommit('test.ts', 'Curiouser and curiouser!', undefined)
      done()
      expect(store.state.gitAgent!.writeFile).to.have.been.calledWith(
        'bla',
        'test.ts',
        'Curiouser and curiouser!',
      )
      expect(store.state.gitAgent!.commit).to.have.been.calledWith(
        'fanne',
        'Modification du fichier test.ts',
      )
    })
  })

  describe('writeFileAndPushChanges', () => {
    it('calls writeFile, commit and push', done => {
      writeFileAndPushChanges('test.ts', 'Curiouser and curiouser!')
      done()
      expect(store.state.gitAgent!.writeFile).to.have.been.calledWith(
        store.state.currentRepository,
        'test.ts',
        'Curiouser and curiouser!',
      )
      expect(store.state.gitAgent!.commit).to.have.been.calledWith(
        store.state.currentRepository,
        `Modification du fichier test.js`,
      )
      expect(store.state.gitAgent!.safePush).to.have.been.calledWith(
        store.state.currentRepository,
      )
    })
  })

  describe('deleteFileAndCommit', () => {
    it('calls removeFile and commit', done => {
      deleteFileAndCommit('test.ts')
      done()
      expect(store.state.gitAgent!.removeFile).to.have.been.calledOnce
      expect(store.state.gitAgent!.commit).to.have.been.calledOnce
    })
  })

  describe('deleteFileAndPushChanges', () => {
    it('calls removeFile and commit', done => {
      deleteFileAndPushChanges('test.ts', 'Suppression de test.ts')
      expect(store.state.gitAgent!.safePush).to.have.been.calledOnce
      done()
    })
  })
})
