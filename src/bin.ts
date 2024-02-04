#!/usr/bin/env node

import { DEFAULT_COOKIE_FILE, readCookie } from '$auth/cookie'
import createEsmUtils from 'esm-utils'
import rcFactory from 'rc'
import { PackageJson } from 'type-fest'
import updateNotifier from 'update-notifier'
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'
import { ExpectedArgv, main } from '$cmd/yun'
import { loginCommand } from '$cmd/login'

const { require } = createEsmUtils(import.meta)
const packageJson = require('../package.json')
const { version } = packageJson as PackageJson

// check update
updateNotifier({ pkg: packageJson }).notify()
// updateNotifier({
//   pkg: { name: 'yun-playlist-downloader', version: '1.0.0' },
//   updateCheckInterval: 0,
// }).notify()

let DEFAULT_FORMAT = ':name/:singer - :songName.:ext'
if (process.argv.some((s) => s.match(/(dj)?radio/))) {
  // e.g
  // https://music.163.com/#/program?id=2064329279
  // 等什么君/2019-11-27 - 第56期 - 琴师(Cover:音频怪物)
  DEFAULT_FORMAT = ':name/:programDate 第:programOrder期 - :songName.:ext'
}

// get config
const config = rcFactory('yun', {
  'concurrency': 5,
  'format': DEFAULT_FORMAT,
  'quality': 999,
  'retry-timeout': 3, // 3 mins
  'retry-times': 3, // 3 times
  'skip': true,
  'progress': true,
})

const parser = yargs(hideBin(process.argv))
  .command(
    '$0 <url>',
    '网易云音乐 歌单/专辑 下载器',
    // builder
    (yargs) => {
      return yargs
        .scriptName('yun')
        .usage('Usage: $0 <url> [options]')
        .positional('url', { describe: '歌单/专辑/电台的链接 or 歌单 ID', type: 'string' })
        .alias({
          h: 'help',
          v: 'version',
          c: 'concurrency',
          f: 'format',
          q: 'quality',
          s: 'skip',
          p: 'progress',
        })
        .options({
          concurrency: {
            desc: '同时下载数量',
            type: 'number',
            default: 5,
          },

          format: {
            desc: '文件格式',
            type: 'string',
            default: DEFAULT_FORMAT,
          },

          quality: {
            desc: '音质, 默认 999k 即最大码率, 可选 128/192/320',
            type: 'number',
            default: 999,
            choices: [128, 192, 320, 999],
          },

          retryTimeout: {
            desc: '下载超时(分)',
            type: 'number',
            default: 3,
          },

          retryTimes: {
            desc: '下载重试次数',
            type: 'number',
            default: 3,
          },

          skip: {
            desc: '对于已存在文件且大小合适则跳过',
            type: 'boolean',
            default: true,
          },

          progress: {
            desc: '是否显示进度条',
            type: 'boolean',
            default: true,
          },

          cover: {
            desc: '下载封面',
            type: 'boolean',
            default: false,
          },

          cookie: {
            desc: 'cookie文件',
            type: 'string',
            default: DEFAULT_COOKIE_FILE,
          },
        })
        .config(config)
        .example(`$0 'https://music.163.com/#/playlist?id=7392714527'`, '下载歌单')
        .example('$0 7392714527', '使用 id 下载歌单')
        .example('$0 -c 10 <url>', '10首同时下载')
        .example('$0 -f ":singer - :songName.:ext" <url>', '下载文件名为 "歌手 - 歌名"')
        .example('$0 login --help', '查看登录操作相关帮助')
        .epilog('帮助 & 文档: https://github.com/magicdawn/yun-playlist-downloader')
    }
  )
  /**
   * yun login
   */
  .command(
    'login',
    '登录账号缓存 cookie 文件',
    (yargs) => {
      // 放弃在这折腾，所有子命令的执行在 $login.ts
      // 在这里写存在线程竞争的问题
      return (
        yargs
          // .scriptName('yun')
          .command('check', '检查是否已经缓存了 cookie 文件', (yargs) => {})
          .command('delete', '删除已有的 cookie 文件', (yargs) => {})
          .help()
      )
    },
    (args) => {
      /* 无子命令，yun login 的情况下。 */
    }
  )
  .version(version!)
  .help()

const argv = (await parser.argv) as unknown as ExpectedArgv
// if runing help, process will exit and not continued here

const cmd: string[] = argv['_']

if (cmd[0] == 'login') {
  loginCommand(cmd)
} else {
  main(argv)
}
