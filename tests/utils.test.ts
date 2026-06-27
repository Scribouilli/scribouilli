import './setup.ts'
import { isItStillCompiling } from '../assets/scripts/utils.ts'
import sinon from 'sinon'
import { expect } from 'chai'
import type { CommitObject } from 'isomorphic-git'

describe('Utils function', () => {
  let now: Date, clock: sinon.SinonFakeTimers

  beforeEach(() => {
    now = new Date('2024-12-03 10:00')
    clock = sinon.useFakeTimers(now.getTime())
  })

  afterEach(() => {
    clock.restore()
  })

  describe('#isItStillCompiling', () => {
    it('returns true when just commited', () => {
      const lastCommit = commitObject({ timestamp: now.getTime() / 1000 })

      expect(isItStillCompiling(lastCommit)).to.be.true
    })

    it('returns true when commited since less than DELAY', () => {
      const commitDatetime = new Date('2024-12-03 10:29')
      const lastCommit = commitObject({
        timestamp: commitDatetime.getTime() / 1000,
      })

      expect(isItStillCompiling(lastCommit)).to.be.true
    })

    it('returns false when commited since more than DELAY', () => {
      const commitDatetime = new Date('2024-12-02 15:30')
      const lastCommit = commitObject({
        timestamp: commitDatetime.getTime() / 1000,
      })

      expect(isItStillCompiling(lastCommit)).to.be.false
    })
  })
})

function commitObject(
  committer: Partial<CommitObject['committer']>,
): Pick<CommitObject, 'committer'> {
  return {
    committer: {
      timestamp: 0,
      name: 'Alice',
      email: 'alice@example.org',
      timezoneOffset: 0,

      ...committer,
    },
  }
}
