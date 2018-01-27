'use strict'
/* eslint camelcase: off */

const _ = require('lodash')
const rp = require('request-promise')
const debug = require('debug')('yun:api:playurl:music-api')
const encrypt = require('@magicdawn/music-api/src/crypto').aesRsaEncrypt

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
  bl = JSON.stringify(bl)

  // {params, encSecKey}
  // https://github.com/LIU9293/musicAPI/blob/9b75830249b03599817b792c4cb05ded13a50949/src/netease/getSong.js#L11
  const body = encrypt(bl)

  let json = await rp({
    method: 'POST',
    url:
      'http://music.163.com/weapi/song/enhance/player/url?csrf_token=6817f1ae5c9664c9076e301c537afc29',
    form: body,
    simple: false,
  })
  json = JSON.parse(json)

  debug('POST result: %j', json)
  return json.data
}
