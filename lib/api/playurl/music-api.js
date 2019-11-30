/* eslint camelcase: off */

const _ = require('lodash')
const debug = require('debug')('yun:api:playurl:music-api')
const encrypt = require('@magicdawn/music-api/src/crypto').aesRsaEncrypt
const {umi} = require('../../singleton.js')

/**
 * getData
 */

module.exports = async function(ids, quality) {
  if (!ids || !ids.length) return
  quality = quality || 320000 // 320 | 192 | 128

  // bl
  let bl = {
    br: quality,
    csrf_token: '',
    ids: ids,
  }

  const json = await umi.post('/weapi/song/enhance/player/url', {
    data: bl,
  })
  debug('POST result: %j', json)
  return json.data
}
