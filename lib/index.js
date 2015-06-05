'use strict';

var request = require('superagent-bluebird-promise').agent();
var co = require('co');
var padLeft = require('lodash').padLeft;
var fs = require('fs');

/**
 * 获取html
 */
exports.getHtml = function(url) {
  return request
    .get(url)
    .promise()
    .then(function(res) {
      return res.text;
    });
};

/**
 * mormalize url
 *
 * http://music.163.com/#/playlist?id=12583200
 * to
 * http://music.163.com/playlist?id=12583200
 */
exports.normalizeUrl = function(url) {
  return url.replace(/(https?:.*?\/)(#\/)/, '$1');
};


/**
 * 下载一个文件
 */
exports.download = function(url, file) {
  return new Promise(function(resolve, reject) {

    var s = fs.createWriteStream(file);

    request
      .get(url)
      .on('error', reject)
      .pipe(s)
      .on('error', reject)
      .on('finish', function() {
        this.close(function() {
          resolve();
        });
      });
  });
};

/**
 * page type
 */
var types = exports.types = {
  playlist: 'playlist',
  album: 'album',
  djradio: 'djradio'
};

/**
 * check page type
 */
exports.getType = function(url) {
  var keys = Object.keys(types);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (url.indexOf(key) > -1) {
      return key;
    }
  }

  var msg = 'unsupported type';
  throw new Error(msg);
};

/**
 * get a adapter
 * arg can be `url` or `type`
 *
 * an adapter should have {
 *   getTitle($) => string
 *
 *   getIds($) => []
 *
 *   getSongs(detail) => {
 *     filename,url,index
 *   }
 * }
 */
exports.getAdapter = function(arg) {
  var type;
  if (types[arg]) {
    type = arg;
  }
  else { // arg as url
    type = exports.getType(arg);
  }

  return require('./' + type);
}

/**
 * 获取title
 */
exports.getTitle = function($, type) {
  var adapter = exports.getAdapter(type);
  return adapter.getTitle($);
};

/**
 * 获取歌曲
 */
exports.getSongs = co.wrap(function * ($, type) {
  var adapter = exports.getAdapter(type);

  // array
  var ids = adapter.getIds($);
  ids = '[' + ids.join(',') + ']';
  ids = encodeURIComponent(ids);

  // detail page
  var url = 'http://music.163.com/api/song/detail/';

  var detail = yield request
    .get(url)
    .query('ids=' + ids)
    .promise()
    .then(function(res) {
      return JSON.parse(res.text);
    });

  if (detail.code !== 200) {
    throw new Error('get detail failed,with status ' + detail.code);
  }

  // console.log(detail.songs[0]);

  /**
   * songs = {
   *   filename,
   *   url,
   *   index,
   * }
   */
  return adapter.getSongs(detail);
});