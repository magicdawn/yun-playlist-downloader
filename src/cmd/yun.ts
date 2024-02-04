import { SongValid } from '$define'
import { downloadSong, getAdapter, getFileName } from '$index'
import { baseDebug } from '$common'
import { dl } from 'dl-vampire'
import filenamify from 'filenamify'
import humanizeDuration from 'humanize-duration'
import { padStart } from 'lodash-es'
import logSymbols from 'log-symbols'
import ms from 'ms'
import path from 'path'
import pmap from 'promise.map'
import { readCookie } from '$auth/cookie'

const debug = baseDebug.extend('cli')

export type ExpectedArgv = {
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
}

export async function main(argv) {
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
  } = argv

  // 打印
  console.log(`
	当前参数
	concurrency:    ${concurrency}
	format:         ${format}
	retry-timeout:  ${retryTimeout} (分钟)
	retry-times:    ${retryTimes} (次)
	quality:        ${quality}k
	skip:           ${skipExists}
	progress:       ${progress}
	cover:          ${cover}
	`)

  // process argv
  quality *= 1000
  retryTimeout = ms(`${retryTimeout} minutes`) as number
  readCookie(argv.cookie)

  // only id as url provided
  if (url && /^\d+$/.test(url)) {
    url = `https://music.163.com/#/playlist?id=${url}`
  }

  const start = Date.now()
  const adapter = getAdapter(url)

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

  // fix index
  const len = keeped.length.toString().length
  keeped.forEach((item, index) => {
    item.rawIndex = index // rawIndex: 0,1 ...
    item.index = padStart(String(index + 1), len, '0') // index, first as 01
  })

  await pmap(
    keeped,
    (song) => {
      // 文件名
      const file = getFileName({ format: format, song: song, url: url, name: name })
      // 下载
      return downloadSong({
        url: song.url,
        file,
        song,
        totalLength: keeped.length,
        retryTimeout,
        retryTimes,
        skipExists,
        progress,
      })
    },
    concurrency
  )

  const dur = humanizeDuration(Date.now() - start, { language: 'zh_CN' })
  console.log('下载完成, 耗时%s', dur)
  process.exit(0)
}
