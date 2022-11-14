#!ts-node

import debugFactory from 'debug'
import dl from 'dl-vampire'
import filenamify from 'filenamify'
import humanizeDuration from 'humanize-duration'
import 'log-reject-error/register'
import logSymbols from 'log-symbols'
import ms from 'ms'
import path from 'path'
import pmap from 'promise.map'
import { Merge } from 'type-fest'
import yargs from 'yargs'
import { DEFAULT_COOKIE_FILE, readCookie } from './auth/cookie'
import { SongValid } from './define'
import { downloadSong, getAdapter, getFileName } from './index'
import { get$ } from './util'

const debug = debugFactory('yun:cli')

let DEFAULT_FORMAT = ':name/:singer - :songName.:ext'
if (process.argv.some((s) => s.match(/(dj)?radio/))) {
  // e.g
  // https://music.163.com/#/program?id=2064329279
  // 等什么君/2019-11-27 - 第56期 - 琴师(Cover:音频怪物)
  DEFAULT_FORMAT = ':name/:programDate 第:programOrder期 - :songName.:ext'
}

// get config
const config = require('rc')('yun', {
  'concurrency': 5,
  'format': DEFAULT_FORMAT,
  'quality': 320,
  'retry-timeout': 3, // 3 mins
  'retry-times': 3, // 3 times
  'skip': true,
  'progress': true,
})

const parser = yargs.command(
  '$0 <url>',
  '网易云音乐 歌单/专辑 下载器',
  // builder
  (yargs) => {
    return yargs
      .scriptName('yun')
      .usage('Usage: $0 <url> [options]')
      .positional('url', { describe: '歌单/专辑的链接', type: 'string' })
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
          desc: '音质',
          type: 'number',
          default: 320,
          choices: [128, 192, 320],
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
      .example('$0 -c 10 <url>', '10首同时下载')
      .example('$0 -f ":singer - :songName.:ext" <url>', '下载格式为 "歌手 - 歌名"')
      .epilog('帮助 & 文档: https://github.com/magicdawn/yun-playlist-downloader')
  }
)

async function main() {
  const argv = await parser.argv

  // url
  let {
    url,
    concurrency,
    format,
    quality,
    retryTimeout,
    retryTimes,
    skip: skipExists,
    progress,
    cover,
  } = argv as Merge<
    typeof argv,
    {
      // url is positional & required
      url: string
    }
  >

  // 打印
  console.log(`
当前参数
concurrency:    ${concurrency}
format:         ${format}
retry-timeout:  ${retryTimeout} (分钟)
retry-times:    ${retryTimes} (次)
quality:        ${quality}
skip:           ${skipExists}
progress:       ${progress}
cover:          ${cover}
`)

  // process argv
  quality *= 1000
  retryTimeout = ms(`${retryTimeout} minutes`) as number
  readCookie(argv.cookie)

  const start = Date.now()
  const $ = await get$(url)
  const adapter = getAdapter($, url)

  // 基本信息
  const name = await adapter.getTitle()
  console.log(`正在下载『${name}』,请稍候...`)

  // 封面
  if (cover) {
    const coverUrl = await adapter.getCover()
    if (!coverUrl) {
      console.log(`${logSymbols.warning} [cover]: 没有找到封面`)
    } else {
      const coverExt = path.extname(coverUrl) || '.jpg'
      const coverFile = `${filenamify(name)}/cover${coverExt}`
      await dl({ url: coverUrl, file: coverFile })
      console.log(`${logSymbols.success} [cover]: 封面已下载 ${coverFile}`)
    }
  }

  const songs = await adapter.getSongs(quality)
  debug('songs : %j', songs)
  // debug('songs : %O', songs[0].raw.playUrlInfo)

  const removed = songs.filter((x) => !x.url)
  const keeped = songs.filter((x) => x.url) as SongValid[]

  if (removed.length) {
    console.log(`${logSymbols.warning} [版权受限] 不可下载 ${removed.length}/${songs.length}`)
    for (let i of removed) {
      console.log(`  ${i.singer} - ${i.songName}`)
    }
  }

  // FIXME
  // process.exit()

  // 开始下载
  console.log(`${logSymbols.info} 可下载 ${keeped.length}/${songs.length} 首`)
  await pmap(
    keeped,
    (song) => {
      // 根据格式获取所需文件名
      const file = getFileName({
        format: format,
        song: song,
        url: url,
        name: name,
      })

      // 下载
      return downloadSong({
        url: song.url,
        file,
        song,
        totalLength: songs.length,
        retryTimeout,
        retryTimes,
        skipExists,
        progress,
      })
    },
    concurrency
  )

  await new Promise((r) => {
    process.nextTick(r)
  })

  const dur = humanizeDuration(Date.now() - start, { language: 'zh_CN' })
  console.log('下载完成, 耗时%s', dur)
}

main()
