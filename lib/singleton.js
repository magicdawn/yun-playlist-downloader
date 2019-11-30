const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'

// 下载特殊headers
const headers = {
  'referer': 'http://music.163.com/',
  'user-agent': CHROME_UA,
}

const {extend} = require('umi-request')
const encrypt = require('./api/encrypt/index.js')
const umi = extend({
  headers,
  prefix: 'https://music.163.com',
  requestType: 'form',
  params: {
    /* eslint camelcase: off */
    csrf_token: '6817f1ae5c9664c9076e301c537afc29',
  },
})

// auto encrypt
// {params, encSecKey}
umi.interceptors.request.use(async (url, options) => {
  if (typeof options.data === 'object') {
    options = {
      ...options,
      requestType: 'form',
      data: encrypt(options.data),
    }
  }
  return {url, options}
})

/**
 * exports
 */

Object.assign(module.exports, {
  CHROME_UA,
  umi,
})
