const _ = require('lodash')
const debug = require('debug')('yun:api:program-detail')
const debugDetail = require('debug')('yun-detail:api:program-detail')
const {umi} = require('../../singleton.js')

module.exports = async function programDetail(id) {
  const json = await umi.post('/weapi/dj/program/detail', {
    data: {id},
  })

  debugDetail('result for id=%s,  json=%j', id, json)
  debug('result for id=%s, mainSong.name=%j', id, json.program.mainSong.name)
  return json && json.program
}

if (module === process.mainModule) {
  module.exports('2064329279').then(console.log)
}
