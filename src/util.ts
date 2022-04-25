import cheerio from 'cheerio'
import { umi } from './singleton'

// import debugFactory from 'debug'
// const debug = debugFactory('yun:util')

/**
 * 获取html
 */

export const getHtml = (url: string): Promise<string> => {
  return umi.get(url, {
    prefix: '',
    responseType: 'text',
  })
}

/**
 * get cheerio instance
 */

export const get$ = async (url: string) => {
  url = normalizeUrl(url)
  const html = await getHtml(url)
  const $ = cheerio.load(html, {
    decodeEntities: false,
  })
  return $
}

/**
 * mormalize url
 *
 * http://music.163.com/#/playlist?id=12583200
 * to
 * http://music.163.com/playlist?id=12583200
 */

export const normalizeUrl = (url: string) => url.replace(/(https?:.*?\/)(#\/)/, '$1')

/**
 * getId
 */

export const getId = function (url: string) {
  url = exports.normalizeUrl(url) // remove #
  const u = new URL(url)
  const id = u.searchParams.get('id')
  return id
}
