const debug = require('debug')('yun:util')
const {umi} = require('./singleton.js')

/**
 * 获取html
 */

exports.getHtml = url => {
  return umi.get(url, {
    prefix: '',
    responseType: 'text',
  })
}

/**
 * mormalize url
 *
 * http://music.163.com/#/playlist?id=12583200
 * to
 * http://music.163.com/playlist?id=12583200
 */

exports.normalizeUrl = url => url.replace(/(https?:.*?\/)(#\/)/, '$1')

/**
 * getId
 */

exports.getId = function(url) {
  url = exports.normalizeUrl(url) // remove #
  const u = new URL(url)
  const id = u.searchParams.get('id')
  return id
}
