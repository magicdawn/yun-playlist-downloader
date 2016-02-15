'use strict';

/**
 * module dependencies
 */

const Promise = require('bluebird');
const co = require('co');
const request = require('superagent');
const padLeft = require('lodash').padLeft;
const fs = require('fs-extra');
const symbols = require('log-symbols');
const path = require('path');

/**
 * patch
 */

const Request = request.Request;
Request.prototype.endAsync = Promise.promisify(Request.prototype.end);

/**
 * 下载特殊headers
 */
const headers = {
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.99 Safari/537.36'
};

/**
 * page type
 */
const types = exports.types = [{
  type: 'playlist',
  typeText: '列表'
}, {
  type: 'album',
  typeText: '专辑'
}];

/**
 * 获取html
 */
exports.getHtml = url => {
  return request
    .get(url)
    .promise()
    .then(res => res.text);
};

/**
 * mormalize url
 *
 * http://music.163.com/#/playlist?id=12583200
 * to
 * http://music.163.com/playlist?id=12583200
 */
exports.normalizeUrl = url => url.replace(/(https?:.*?\/)(#\/)/, '$1');


/**
 * 下载一个文件
 */
exports.download = (url, file) => {
  // ensure
  file = path.resolve(file);
  fs.ensureDirSync(path.dirname(file));

  return new Promise((resolve, reject) => {
    const s = fs.createWriteStream(file);
    request
      .get(url)
      .set(headers)
      .on('error', reject)
      .pipe(s)
      .on('error', reject)
      .on('finish', function() {
        this.close(() => {
          resolve();
        });
      });
  });
};

/**
 * 下载一首歌曲
 */
exports.downloadSong = (url, filename, song, totalLength) => {
  return exports
    .download(song.url, filename)
    .then(() => {
      console.log(`${ symbols.success } ${ song.index }/${ totalLength } 下载完成 ${ filename }`);
    })
    .catch(e => {
      console.log(`${ symbols.error } ${ song.index }/${ totalLength } 下载失败 ${ filename }`);
      console.error(e.stack || e);
    });
};

/**
 * check page type
 *
 * @param { String } url
 * @return { Object } {type, typeText}
 */
exports.getType = url => {
  for (let i = 0; i < types.length; i++) {
    const item = types[i];
    if (url.indexOf(item.type) > -1) {
      return item;
    }
  }

  const msg = 'unsupported type';
  throw new Error(msg);
};

/**
 * get a adapter via `url`
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
exports.getAdapter = url => {
  const type = exports.getType(url);
  const typeKey = type.type;
  return require('./' + typeKey);
};

/**
 * 获取title
 */
exports.getTitle = ($, url) => {
  const adapter = exports.getAdapter(url);
  return adapter.getTitle($);
};

/**
 * 获取歌曲
 */
exports.getSongs = co.wrap(function*($, url) {
  const adapter = exports.getAdapter(url);

  // 在 playlist 页面有一个 textarea 标签
  // 包含playlist 的详细信息
  const text = $('ul.f-hide').next('textarea').html();
  const songs = JSON.parse(text);

  // 根据详细信息获取歌曲
  return adapter.getSongs(songs);
});

/**
 * 获取歌曲文件表示
 */
exports.getFileName = options => {
  let format = options.format;
  const song = options.song;
  const typesItem = exports.getType(options.url);
  const name = options.name; // 专辑 or playlist 名称

  // 从 type 中取值, 先替换 `长的`
  [
    'typeText', 'type'
  ].forEach(t => {
    format = format.replace(new RegExp(':' + t, 'ig'), typesItem[t]);
  });

  // 从 `song` 中取值
  [
    'songName', 'rawIndex',
    'index',
    'singer', 'ext'
  ].forEach(t => {
    // t -> token
    format = format.replace(new RegExp(':' + t, 'ig'), song[t]);
  });

  // name
  format = format.replace(new RegExp(':name', 'ig'), name);

  return format;
};