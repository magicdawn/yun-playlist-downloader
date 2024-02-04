import { DEFAULT_COOKIE_FILE } from '$auth/cookie'
import { QRCodeLogin } from '$api'
import { existsSync, unlink, writeFile } from 'fs'

export function loginCommand(args: string[]) {
  if (args.length == 1) {
    if (existsSync(DEFAULT_COOKIE_FILE)) {
      console.log('本地已经缓存了 cookie 文件，若要覆盖，请执行 `yun login delete` 进行删除。') // 如果在 yargs .command 里的函数，这里的 yun 可替换为 $0
      process.exit(1)
    } else {
      QRCodeLogin().then((cookie) => {
        writeFile(DEFAULT_COOKIE_FILE, cookie, (err) => {
          if (err) {
            console.log(`写入 cookie 文件[${DEFAULT_COOKIE_FILE}]错误，内容:\n${cookie}`)
          } else {
            console.log('cookie 缓存成功')
          }
          process.exit(0)
        })
      })
    }
  } else {
    switch (args[1]) {
      case 'check': {
        checkCookie()
        break
      }
      case 'delete': {
        try {
          deleteCookie()
        } catch (e) {
          console.error(e)
          process.exit(1)
        }
        break
      }
    }
    process.exit(0)
  }
}

function checkCookie() {
  if (existsSync(DEFAULT_COOKIE_FILE)) {
    console.log('本地已经缓存了 cookie 文件')
  } else {
    console.log('没有缓存 cookie 文件，请使用 `yun login` 命令缓存')
  }
}

function deleteCookie() {
  unlink(DEFAULT_COOKIE_FILE, (err) => {
    if (err) {
      throw new Error(`无法删除 [${DEFAULT_COOKIE_FILE}]，请手动删除。`)
    } else {
      console.log('删除本地缓存 cookie 成功')
    }
  })
}
