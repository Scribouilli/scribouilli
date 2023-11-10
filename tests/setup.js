import 'mock-local-storage'
import { JSDOM } from 'jsdom'
import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

const dom = new JSDOM(``, {
  url: 'https://example.com/',
  referrer: 'https://example.com/',
  contentType: 'text/html',
  includeNodeLocations: true,
  storageQuota: 10000000,
})

global.sinon = sinon
global.chai = chai
global.expect = expect
chai.use(sinonChai)

global.document = dom.window.document
global.window = dom.window
global.location = dom.window.location
global.navigator = dom.window.navigator
global.history = dom.window.history
