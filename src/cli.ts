#!/usr/bin/env node

import { createRequire } from 'node:module'
import path from 'node:path'
import CliTable from 'cli-table3'
import { dl } from 'dl-vampire'
import { delay } from 'es-toolkit'
import filenamify from 'filenamify'
import humanizeDuration from 'humanize-duration'
import logSymbols from 'log-symbols'
import ms from 'ms'
import pmap from 'promise.map'
import rcFactory from 'rc'
import updateNotifier from 'update-notifier'
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'
import { z, ZodError } from 'zod'
import { fromError } from 'zod-validation-error'
import { DEFAULT_COOKIE_FILE, readCookie } from '$auth/cookie'
import { baseDebug } from '$common'
import type { SongValid } from '$define'
import { downloadSong, getAdapter, getFileName, resetFileNameTracker, SKIP_DOWNLOAD } from './index'
import type { PackageJson } from 'type-fest'

const debug = baseDebug.extend('cli')

const _require = createRequire(__filename)
const rawPackageJson = _require('../package.json')
const { version } = rawPackageJson as PackageJson

// check update
updateNotifier({ pkg: rawPackageJson }).notify()

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

yargs(hideBin(process.argv))
  .scriptName('yun')
  .command(
    '$0 <url>',
    '网易云音乐 歌单/专辑 下载器',
    // builder
    (yargs) => {
      return yargs
        .usage('Usage: $0 <url> [options]')
        .positional('url', {
          describe: '歌单/专辑/电台的链接 or 歌单 ID',
          type: 'string',
          demandOption: true, // 直接运行 yun 飘红
        })
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

          skipTrial: {
            desc: '跳过试听歌曲',
            type: 'boolean',
            default: false,
          },
        })
        .config(config)
        .example(`$0 'https://music.163.com/#/playlist?id=7392714527'`, '下载歌单')
        .example('$0 7392714527', '使用 id 下载歌单')
        .example('$0 -c 10 <url>', '10首同时下载')
        .example('$0 -f ":singer - :songName.:ext" <url>', '下载文件名为 "歌手 - 歌名"')
        .epilog('帮助 & 文档: https://github.com/magicdawn/yun-playlist-downloader')
    },
    async (parsed) => {
      try {
        await defaultCommandAction(parsed)
      } catch (e) {
        if (e instanceof ZodError) {
          const validationError = fromError(e)
          console.error(validationError.toString())
          throw validationError
        } else {
          throw e
        }
      }
    },
  )
  .version(version!)
  .help()
  .parse()

type ExpectedArgv = {
  url: string
  concurrency: number
  format: string
  quality: number
  retryTimeout: number
  retryTimes: number
  skip: boolean
  progress: boolean
  cover: boolean
  cookie: string
  skipTrial: boolean
}

async function defaultCommandAction(options: ExpectedArgv) {
  let {
    concurrency,
    format,
    quality,
    retryTimeout,
    retryTimes,
    skip: skipExists,
    progress,
    cover,
    cookie,
    skipTrial,
  } = options

  let url = z
    .union([z.string().url(), z.string().regex(/^\d+$/)], {
      errorMap: () => ({ message: 'url 参数错误: 支持 url 或 歌单ID' }),
    })
    .parse(options.url)

  const table = new CliTable({
    head: [`${logSymbols.info} 当前参数`, '值', '备注'],
  })
  table.push(
    ['concurrency', concurrency, '同时下载数量'],
    ['format', format, '文件名模版'],
    ['quality', quality, '音质(kbps)'],
    ['retry-timeout', retryTimeout, '下载超时(分)'],
    ['retry-times', retryTimes, '下载重试(次)'],
    ['skip', skipExists, '跳过已下载正常文件'],
    ['progress', progress, '显示进度条'],
    ['cover', cover, '下载封面'],
    ['cookie', cookie, 'cookie文件'],
    ['skip-trial', skipTrial, '跳过试听歌曲'],
  )
  console.log(`${table.toString()}\n`)

  // process argv
  quality *= 1000
  retryTimeout = ms(`${retryTimeout}m`)
  readCookie(cookie)

  // only id as url provided
  if (url && /^\d+$/.test(url)) {
    url = `https://music.163.com/#/playlist?id=${url}`
  }

  const start = Date.now()
  const adapter = getAdapter(url)

  // 基本信息
  const name = (await adapter.getTitle()) || ''
  console.log(`${logSymbols.info} 正在下载「${name}」,请稍候...`)

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

  const removed = songs.filter((x) => !x.url)
  const keeped = songs.filter((x) => x.url) as SongValid[]
  if (removed.length) {
    console.log(`${logSymbols.warning} [版权受限] 不可下载 ${removed.length}/${songs.length}`)
    for (const i of removed) {
      console.log(`  ${i.singer} - ${i.songName}`)
    }
  }

  // FIXME
  // process.exit()

  // 开始下载
  const freeTrialCount = keeped.filter((x) => x.isFreeTrial).length
  console.log(`${logSymbols.info} 可下载 ${keeped.length}/${songs.length}, 试听 ${freeTrialCount}/${keeped.length}`)

  // fix index
  const len = keeped.length.toString().length
  keeped.forEach((item, index) => {
    item.rawIndex = index // rawIndex: 0,1 ...
    item.index = String(index + 1).padStart(len, '0') // index, first as 01
  })

  // 重置文件名跟踪器，避免重名文件问题
  resetFileNameTracker()

  await pmap(
    keeped,
    (song) => {
      // 文件名
      const file = getFileName({ format, song, url, name })
      // 如果文件已存在且大小一致，跳过下载
      if (file === SKIP_DOWNLOAD) {
        console.log(`${logSymbols.success} 跳过已存在文件: ${song.singer} - ${song.songName}`)
        return Promise.resolve()
      }
      // 下载
      if (typeof file === 'string') {
        return downloadSong({
          url: song.url,
          file,
          song,
          totalLength: keeped.length,
          retryTimeout,
          retryTimes,
          progress,
          skipExists,
          skipTrial,
        })
      }
      return Promise.resolve()
    },
    concurrency,
  )

  await delay(100) // time for ink render (moveToComplete)
  const dur = humanizeDuration(Date.now() - start, { language: 'zh_CN' })
  console.log('下载完成, 耗时%s', dur)
  process.exit(0)
}
