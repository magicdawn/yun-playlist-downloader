const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'

// 下载特殊headers
const headers = {
  'referer': 'http://music.163.com/',
  'user-agent': CHROME_UA,
}
const r = require('request').defaults({ headers })
const rp = require('request-promise').defaults({ headers })

/**
 * exports
 */

Object.assign(module.exports, {
  CHROME_UA,
  r,
  rp,
})
