const {extname} = require('path')
const {padStart, trimStart} = require('lodash')
const debug = require('debug')('yun:adapter:base')
const _ = require('lodash')
const {getId} = require('../util.js')

const NOT_IMPLEMENTED = 'not NOT_IMPLEMENTED'

module.exports = class BaseAdapter {
  /**
   * get title for a page
   */

  getTitle($) {
    throw new Error(NOT_IMPLEMENTED)
  }

  /**
   * get detail
   */

  getDetail($, url, quality) {
    throw new Error(NOT_IMPLEMENTED)
  }

  getId(url) {
    return getId(url)
  }

  /**
   * get songs detail
   *
   * @param {Array} [songs] songs
   */

  getSongs(songs) {
    // e.g 100 songs -> len = 3
    const len = String(songs.length).length

    return songs.map(function(song, index) {
      return {
        // 歌手
        singer: _.get(song, 'ar.0.name') || _.get(song, 'artists.0.name'),

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

        // raw
        raw: song,
      }
    })
  }
}
