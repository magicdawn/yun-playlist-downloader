import cheerio from 'cheerio'
import { request } from './singleton'

// import debugFactory from 'debug'
// const debug = debugFactory('yun:util')

/**
 * 获取html
 */

export function getHtml(url: string): Promise<string> {
  return request.get(url, { prefixUrl: '' }).text()
}

/**
 * get cheerio instance
 */

export async function get$(url: string) {
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

export function normalizeUrl(url: string) {
  return url.replace(/(https?:.*?\/)(#\/)/, '$1')
}

/**
 * getId
 */

export const getId = function (url: string) {
  url = normalizeUrl(url) // remove #
  const u = new URL(url)
  const id = u.searchParams.get('id')
  return id
}
