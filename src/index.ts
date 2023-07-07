import { Song } from '$define'
import { downloadSongWithInk } from '$download/progress/ink'
import { dl } from 'dl-vampire'
import filenamify from 'filenamify'
import LogSymbols from 'log-symbols'
import path from 'path'
import AlbumAdapter from './adapter/album.js'
import BaseAdapter from './adapter/base.js'
import DjradioAdapter, { ProgramSong } from './adapter/djradio.js'
import PlaylistAdapter from './adapter/playlist.js'

/**
 * page type
 */

const allowedPageTypes = ['playlist', 'album', 'djradio'] as const
type PageType = typeof allowedPageTypes extends ReadonlyArray<infer T> ? T : never

interface TypeItem {
  type: PageType
  typeText: string
  adapter: typeof BaseAdapter
}

export const typeItems: TypeItem[] = [
  {
    type: 'playlist',
    typeText: '列表',
    adapter: PlaylistAdapter,
  },
  {
    type: 'album',
    typeText: '专辑',
    adapter: AlbumAdapter,
  },
  {
    type: 'djradio',
    typeText: '电台',
    adapter: DjradioAdapter,
  },
]

/**
 * 下载一首歌曲
 */

export interface DownloadSongOptions {
  url: string
  file: string
  song: Song
  totalLength: number
  retryTimeout: number
  retryTimes: number
  skipExists: boolean
}

export async function downloadSong(options: DownloadSongOptions & { progress?: boolean }) {
  const { progress } = options
  if (progress) {
    return downloadSongWithInk(options)
  } else {
    return downloadSongPlain(options)
  }
}

export async function downloadSongPlain(options: DownloadSongOptions) {
  const { url, file, song, totalLength, retryTimeout, retryTimes, skipExists } = options

  let skip = false

  try {
    ;({ skip } = await dl({
      url,
      file,
      skipExists,
      retry: {
        timeout: retryTimeout,
        times: retryTimes,
        onerror: function (e, i) {
          console.log(`${LogSymbols.warning} ${song.index}/${totalLength}  ${i + 1}次失败 ${file}`)
        },
      },
    }))
  } catch (e) {
    console.log(`${LogSymbols.error} ${song.index}/${totalLength} 下载失败 ${file}`)
    console.error(e.stack || e)
    return
  }

  console.log(
    `${LogSymbols.success} ${song.index}/${totalLength} ${skip ? '下载跳过' : '下载成功'} ${file}`
  )
}

/**
 * check page type
 */

export function getType(url: string): TypeItem {
  const item = typeItems.find((item) => url.includes(item.type))
  if (item) return item

  // #/radio & #/djradio 是一样的
  if (/#\/radio/.exec(url)) {
    return typeItems.find((item) => item.type === 'djradio')!
  }

  const msg = 'unsupported type'
  throw new Error(msg)
}

/**
 * get a adapter via `url`
 */
export function getAdapter(url: string) {
  const { adapter } = getType(url)
  return new adapter(url)
}

/**
 * 获取歌曲文件表示
 */
export function getFileName({
  format,
  song,
  url,
  // 专辑 or playlist 名称
  name,
}: {
  format: string
  song: Song
  url: string
  name: string
}) {
  const typesItem = getType(url)

  // 从 type 中取值, 先替换 `长的`
  ;['typeText', 'type'].forEach((t) => {
    const val = filenamify(String(typesItem[t]))
    format = format.replace(new RegExp(':' + t, 'ig'), val)
  })

  // 从 `song` 中取值
  type SongKey = keyof Song
  const keys = ['songName', 'singer', 'albumName', 'rawIndex', 'index', 'ext'] satisfies SongKey[]
  keys.forEach((token) => {
    const val = filenamify(String(song[token]))
    format = format.replace(new RegExp(':' + token, 'ig'), val)
  })

  // name
  format = format.replace(new RegExp(':name', 'ig'), filenamify(name))

  // djradio only
  if (typesItem.type === 'djradio') {
    const { programDate, programOrder } = song as ProgramSong
    if (programDate) {
      format = format.replace(new RegExp(':programDate'), filenamify(programDate))
    }
    if (programOrder) {
      format = format.replace(new RegExp(':programOrder'), filenamify(programOrder.toString()))
    }
  }

  if (song.isFreeTrial) {
    const dir = path.dirname(format)
    const ext = path.extname(format)
    const base = path.basename(format, ext)
    format = path.join(dir, `${base} [试听]${ext}`)
  }

  return format
}
