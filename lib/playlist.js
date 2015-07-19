'use strict';

var padLeft = require('lodash').padLeft;

/**
 * get title for a page
 * @param  {Cheerio} $ Cheerio instance
 * @return {String} title
 */
exports.getTitle = function($) {
  return $('h2.f-ff2.f-brk').text();
};

/**
 * get songs detail
 *
 * @param {Array} [songs] songs
 */
exports.getSongs = function(songs) {
  // e.g 100 songs -> len = 3
  var len = String(songs.length).length;

  return songs.map(function(song, index) {
    return {
      // local file name
      filename: `${ song.artists[0].name } - ${ song.name }`,

      // url for download
      url: song.mp3Url,

      // index, first as 01
      index: padLeft(String(index + 1), len, '0'),
    };
  });
};