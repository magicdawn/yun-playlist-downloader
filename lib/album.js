'use strict'

const API = require('@magicdawn/music-api')
const debug = require('debug')('yun:adapter:alnum')
const playlist = require('./playlist')

/**
 * title getter
 */

exports.getTitle = $ => $('h2.f-ff2').text()

/**
 * 同playlist
 */

exports.getSongs = playlist.getSongs

/**
 * alnum detail
 */

exports.getDetail = playlist.getDetail
exports._getDetail = async id => {
  const ret = await API.getAlbum('netease', { id, raw: true })
  return ret.songs
}
