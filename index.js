var request = require('superagent-bluebird-promise').agent();
var co = require('co');
var padLeft = require('lodash').padLeft;
var fs = require('fs');

/**
 * 获取html
 */
var getHtml = function(url) {
  var req = request
    .get(url)
    .promise()
    .then(function(res) {
      return res.text;
    });

  return req;
};

/**
 * mormalize url
 *
 * http://music.163.com/#/playlist?id=12583200
 * to
 * http://music.163.com/playlist?id=12583200
 */
var normalizeUrl = function(url) {
  return url.replace(/(https?:.*?\/)(#\/)/, '$1')
};

/**
 * 获取歌单名称
 */
var getPlaylistName = function($) {
  return $('h2.f-ff2.f-brk').text();
};

/**
 * 歌单歌曲
 */
var getSongs = co.wrap(function * ($) {
  var trs = $('#m-song-list-module tr');

  // prepare id
  var ids = trs.map(function() {
    return $(this).attr('data-id');
  }).get();

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

  // e.g 100 songs -> len = 3
  var len = String(detail.songs.length).length;

  return detail.songs.map(function(song, index) {
    return {

      // 歌手
      singer: song.artists[0].name,

      // 歌曲
      title: song.name,

      // 专辑
      // album: song.album.name,

      // index, first as 01
      index: padLeft(String(index + 1), len, '0'),

      // 地址
      url: song.mp3Url
    };
  });
});

/**
 * 下载一个文件
 */
var download = function(url, file) {
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
      })
  });
};

/**
 * do exports
 */
exports.getHtml = getHtml;
exports.normalizeUrl = normalizeUrl;
exports.getPlaylistName = getPlaylistName;
exports.getSongs = getSongs;
exports.download = download;