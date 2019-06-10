const lib = require('../lib/index.js')
const { normalizeUrl } = lib

describe('lib', function() {
  it('normalizeUrl', () => {
    let url = 'http://music.163.com/#/playlist?id=12583200'
    url = normalizeUrl(url)
    url.should.equal('http://music.163.com/playlist?id=12583200')
  })

  it('description', () => {
    // body...
  })
})
