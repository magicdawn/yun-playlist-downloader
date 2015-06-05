'use strict';

var padLeft = require('lodash').padLeft;

exports.getTitle = function($) {
  return $('h2.f-ff2.f-brk').text();
};


exports.getIds = function($) {
  var trs = $('#m-song-list-module tr');

  // prepare id
  var ids = trs.map(function() {
    return $(this).attr('data-id');
  }).get();

  return ids;
};


exports.getSongs = function(detail) {
  // e.g 100 songs -> len = 3
  var len = String(detail.songs.length).length;

  return detail.songs.map(function(song, index) {
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