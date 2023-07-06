import { describe, expect, it } from 'vitest'
import { getId, normalizeUrl } from '../src/util'

describe('util', function () {
  it('normalizeUrl', () => {
    let url = 'http://music.163.com/#/playlist?id=12583200'
    url = normalizeUrl(url)
    expect(url).to.equal('http://music.163.com/playlist?id=12583200')
  })

  it('.getId', () => {
    const id = getId('https://music.163.com/#/program?id=2064329279')
    expect(id).to.equal('2064329279')
  })
})
