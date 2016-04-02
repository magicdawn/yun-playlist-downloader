'use strict';

const Nightmare = require('nightmare');
const co = require('co');
const _ = require('lodash');
const request = require('needle-kit').request;
const debug = require('debug')('yun:night');

/**
 * getData
 */

exports.getData = co.wrap(function*(ids, quality) {
  if (!ids || !ids.length) return;
  quality = quality || 320000; // 320 | 192 | 128

  // bl
  let bl = {
    br: quality,
    'csrf_token': '',
    ids: ids
  };
  bl = JSON.stringify(bl);

  // args
  const defaultArgs = [
    '010001',
    '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7',
    '0CoJUm6Qyw8W8jud'
  ];
  const args = _.cloneDeep(defaultArgs);
  args.unshift(bl);
  const night = Nightmare();

  let body;
  let err;
  try {
    /* eslint-env browser */
    body = yield night
      .goto('http://music.163.com')
      .evaluate((args) => {
        return window.asrsea.apply(window, args);
      }, args);
  } catch (e) {
    err = e;
  } finally {
    night.end();
    if (err) throw err;
  }

  // encText -> params
  body.params = body.encText;
  delete body.encText;

  const res = yield request
    .post('http://music.163.com/weapi/song/enhance/player/url?csrf_token=6817f1ae5c9664c9076e301c537afc29')
    .type('form')
    .send(body)
    .endAsync();
  let json = res.text;
  json = JSON.parse(json);

  debug('POST result: %j', json);
  return json.data;
});