const DjradioAdapter = require('../../../lib/adapter/djradio.js')
const {get$} = require('../../../lib/util.js')

describe('DjradioAdapter', () => {
  it('getDetail works', async () => {
    const adapter = new DjradioAdapter()

    const url = 'https://music.163.com/#/djradio?id=349857751'
    const $ = await get$(url)
    const quality = 320
    const programs = await adapter.getAllPrograms($, url, quality)

    // 2019-12-28
    // 有 421 期
    programs.length.should.aboveOrEqual(421)
  })
})
