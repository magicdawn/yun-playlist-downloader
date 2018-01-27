'use strict'

const { parse: urlparse } = require('url')
const { parse: qsparse } = require('querystring')
const { extname } = require('path')
const { padStart, trimStart } = require('lodash')
const API = require('@magicdawn/music-api')
const debug = require('debug')('yun:adapter:playlist')

/**
 * get title for a page
 * @param  {Cheerio} $ Cheerio instance
 * @return {String} title
 */

exports.getTitle = $ => $('h2.f-ff2.f-brk').text()

/**
 * get songs detail
 *
 * @param {Array} [songs] songs
 */

exports.getSongs = songs => {
  // e.g 100 songs -> len = 3
  const len = String(songs.length).length

  return songs.map(function(song, index) {
    return {
      // 歌手
      singer: song.ar[0].name,

      // 歌曲名
      songName: song.name,

      // url for download
      url: song.ajaxData.url,

      // extension
      ext: trimStart(extname(song.ajaxData.url), '.'),

      // index, first as 01
      index: padStart(String(index + 1), len, '0'),

      // rawIndex: 0,1 ...
      rawIndex: index,
    }
  })
}

/**
 * playlist detail
 */

exports.getDetail = async ($, url, quality) => {
  const parsedUrl = urlparse(url)
  const parsedQuery = qsparse(parsedUrl.query)
  const { id } = parsedQuery
  debug('id = %s', id)
  return exports._getDetail(id)
}

exports._getDetail = async id => {
  const ret = await API.getPlaylist('netease', { id, raw: true })
  return ret.playlist.tracks
}
