'use strict'

/**
 * module dependencies
 */

const playlist = require('./playlist')

/**
 * title getter
 */

exports.getTitle = $ => $('h2.f-ff2').text()

/**
 * 同playlist
 */

exports.getSongs = playlist.getSongs
