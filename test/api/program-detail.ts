import {djradioPrograms} from '../../src/api'
import 'should'

describe('djradioPrograms', function () {
  it('it works', async () => {
    // https://music.163.com/#/djradio?id=334619056
    debugger
    const allPrograms = await djradioPrograms('334619056')
    allPrograms.length.should.aboveOrEqual(400)
  })
})
