import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

export const DEFAULT_COOKIE_FILE = 'yun.cookie.txt'

export let COOKIE_CONTENT: string = undefined

export function readCookie(cookieFile: string) {
  if (!cookieFile) return

  const file = resolve(cookieFile)
  if (!existsSync(file)) {
    console.log(`[cookie] cookie 文件不存在: %s`, file)
    return
  } else {
    console.log(`[cookie] 使用 cookie 文件: %s`, file)
  }

  let str = readFileSync(file, 'utf-8')

  // 去除注释 & 空行
  str = str
    .split('\n')
    .filter((line) => {
      if (!line.trim()) return false // empty line
      if (line.startsWith('//')) return false // comment
      return true
    })
    .join('')

  COOKIE_CONTENT = str
}
