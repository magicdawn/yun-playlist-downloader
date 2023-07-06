import { describe, expect, it } from 'vitest'
import { djradioPrograms } from '../../src/api'

describe('djradioPrograms', function () {
  // 太慢了, 还有操作频繁的限制
  it.skip('it works', async () => {
    // https://music.163.com/#/djradio?id=334619056
    const allPrograms = await djradioPrograms('334619056')
    expect(allPrograms.length).to.greaterThanOrEqual(600)
  })
})
