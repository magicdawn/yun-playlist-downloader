import {extend} from 'umi-request'
import encrypt from './api/encrypt'

const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'

// 下载特殊headers
const headers = {
  'referer': 'http://music.163.com/',
  'user-agent': CHROME_UA,
}

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
// async: js support, ts def does not
umi.interceptors.request.use((url, options) => {
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

export {CHROME_UA, umi}
