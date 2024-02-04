import { request } from '$singleton'

/**
 * 获取html
 */
export function getHtml(url: string): Promise<string> {
  return request.get(url, { prefixUrl: '' }).text()
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

/**
 * 线程堵塞
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
