'use strict';

/**
 * module dependencies
 */
var playlist = require('./playlist');


exports.getTitle = function($) {
  return $('h2.f-ff2').text();
};

/**
 * 同playlist
 */
exports.getSongs = playlist.getSongs;