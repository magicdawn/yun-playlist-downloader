'use strict';

exports.getTitle = function($) {
  return $('h2.f-ff2').text();
}

/**
 * 同playlist
 */
exports.getIds = require('./playlist').getIds;

/**
 * 同playlist
 */
exports.getSongs = require('./playlist').getSongs;