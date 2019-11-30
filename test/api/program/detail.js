const programDetail = require('../../../lib/api/program/detail.js')

describe('API/program/detail', function() {
  it('it works', async () => {
    const program = await programDetail('2064329279')
    program.id.toString().should.equal('2064329279')
  })
})
