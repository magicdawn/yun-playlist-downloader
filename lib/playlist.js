'use strict'

const padStart = require('lodash').padStart
const trimStart = require('lodash').trimStart
const extname = require('path').extname

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
      singer: song.artists[0].name,

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
