'use strict';

/**
 * module dependencies
 */

const kit = require('needle-kit');
const request = kit.request;
const fs = kit.fs;
const co = require('co');
const symbols = require('log-symbols');
const path = require('path');
const night = require('./night');
const _ = require('lodash');


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
    .endAsync()
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
exports.download = (url, file, timeout) => new Promise((resolve, reject) => {
  // ensure
  file = path.resolve(file);
  fs.ensureDirSync(path.dirname(file));
  const s = fs.createWriteStream(file);

  // construct
  const req = request
    .get(url)
    .set(headers)
    .on('error', reject);

  // timeout in ms
  if (timeout) req.timeout(timeout);

  // pipe
  req
    .pipe(s)
    .on('error', reject)
    .on('finish', function() {
      this.close(() => {
        resolve();
      });
    });
});

/**
 * predicate e is a SuperagentTimeoutError ?
 *
 * https: //github.com/visionmedia/superagent/blob/v1.7.2/lib/node/index.js#L892-L893
 */

const isSuperagentTimeoutError = e => e.code === 'ECONNABORTED' && e.timeout > 0;

/**
 * tryDownload with timeout & maxTimes
 */

exports.tryDownload = co.wrap(function*(url, file, timeout, maxTimes) {
  const maxTimesBak = maxTimes;
  while (maxTimes > 0) {
    try {
      yield exports.download(url, file, timeout);
      return;
    } catch (e) {
      // timeout了
      if (isSuperagentTimeoutError(e)) {
        maxTimes--;
        continue;
      }

      // 其他原因
      throw e;
    }
  }

  const message = `tryDownload failed, timeout = ${ timeout }, maxTimes = ${ maxTimesBak }`;
  const e = new Error(message);
  e.timeout = timeout;
  e.maxTimes = maxTimesBak;
  throw new Error(e);
});


/**
 * 下载一首歌曲
 */
exports.tryDownloadSong = (url, filename, song, totalLength, timeout, maxTimes) => {
  return exports
    .tryDownload(song.url, filename, timeout, maxTimes)
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
  const item = _.find(types, item => url.indexOf(item.type) > -1);
  if (item) return item;

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
exports.getSongs = co.wrap(function*($, url, quality) {
  const adapter = exports.getAdapter(url);

  // 在 playlist 页面有一个 textarea 标签
  // 包含playlist 的详细信息
  const text = $('ul.f-hide').next('textarea').html();
  let songs = JSON.parse(text);

  // 获取下载链接
  const ids = songs.map(s => s.id);
  let json = yield night.getData(ids, quality); // 0-29有链接, max 30? 没有链接都是下线的
  json = json.filter(s => s.url); // remove 版权保护没有链接的

  // 移除版权限制在json中没有数据的歌曲
  const removed = [];
  for (let song of songs) {
    const id = song.id;
    const ajaxData = _.find(json, 'id', id);

    if (!ajaxData) { // 版权受限
      removed.push(song);
    } else { // we are ok
      song.ajaxData = ajaxData;
    }
  }
  songs = _.xor(songs, removed);

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