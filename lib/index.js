'use strict';

/**
 * module dependencies
 */

/* jshint -W079 */
var Promise = require('bluebird');
var co = require('co');
var request = require('superagent-bluebird-promise').agent();
var CookieAccessInfo = require('cookiejar').CookieAccessInfo;
var padLeft = require('lodash').padLeft;
var fs = require('fs');
var symbols = require('log-symbols');

/**
 * 下载特殊headers
 */
var headers = {
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.99 Safari/537.36'
};


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
      .set(headers)
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
 * 下载一首歌曲
 */
exports.downloadSong = function(url, filename, song, totalLength) {
  return exports
    .download(song.url, filename)
    .then(function() {
      console.log(`${ symbols.success } ${ song.index }/${ totalLength } 下载完成 ${ song.filename }`);
    })
    .catch(function(e) {
      console.log(`${ symbols.error } ${ song.index }/${ totalLength } 下载失败 ${ song.filename }`);
      console.error(e.stack || e);
    });
};

/**
 * page type
 */
var types = exports.types = {
  playlist: 'playlist',
  album: 'album',
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
  } else { // arg as url
    type = exports.getType(arg);
  }

  return require('./' + type);
};

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
exports.getSongs = co.wrap(function*($, type) {
  var adapter = exports.getAdapter(type);

  // 在 playlist 页面有一个 textarea 标签
  // 包含playlist 的详细信息
  // debugger;
  var text = $('ul.f-hide').next('textarea').html();
  var songs = JSON.parse(text);


  // 根据详细信息获取歌曲
  return adapter.getSongs(songs);
});