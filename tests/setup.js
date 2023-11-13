import 'mock-local-storage'
import 'fake-indexeddb/auto'

import { JSDOM } from 'jsdom'
import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

// Setup chai and sinon
global.sinon = sinon
global.chai = chai
global.expect = expect
chai.use(sinonChai)

// Use a fake DOM for testing
const dom = new JSDOM(``, {
  url: 'https://example.com/',
  referrer: 'https://example.com/',
  contentType: 'text/html',
  includeNodeLocations: true,
  storageQuota: 10000000,
})

global.document = dom.window.document
global.window = dom.window
global.location = dom.window.location
global.navigator = dom.window.navigator
global.history = dom.window.history
