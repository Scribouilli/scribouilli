import '../setup.ts'
import { file } from '../../assets/scripts/actions/file.ts'
import { saveCustomCSS } from '../../assets/scripts/actions/current-repository.ts'
import { CUSTOM_CSS_PATH } from '../../assets/scripts/config.ts'
import { describe } from 'mocha'
import sinon from 'sinon'
import { expect } from 'chai'

describe('actions/current-repository.ts', () => {
  beforeEach(() => {
    sinon.reset()
  })

  describe('saveCustomCSS', () => {
    it('calls writeFile, commit and safePush', done => {
      sinon.stub(file, 'writeFileAndPushChanges')
      const css = 'body { background: pink; }'

      saveCustomCSS(css)

      expect(file.writeFileAndPushChanges).to.have.been.calledWithExactly(
        CUSTOM_CSS_PATH,
        css,
        'mise à jour du fichier de styles custom',
      )

      done()
    })
  })
})
