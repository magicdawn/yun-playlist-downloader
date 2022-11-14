import got from 'got'

const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'

// 下载特殊headers
const headers = {
  'referer': 'http://music.163.com/',
  'user-agent': CHROME_UA,
}

export const request = got.extend({
  headers,
  prefixUrl: 'https://music.163.com',
  searchParams: {
    /* eslint camelcase: off */
    csrf_token: '6817f1ae5c9664c9076e301c537afc29',
  },
})
