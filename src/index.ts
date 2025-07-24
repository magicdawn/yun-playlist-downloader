import os from 'node:os'
import path from 'node:path'
import { dl } from 'dl-vampire'
import filenamify from 'filenamify'
import fs from 'fs-extra'
import logSymbols from 'log-symbols'
import type { Song } from '$define'
import { AlbumAdapter } from './adapter/album'
import { DjradioAdapter, type ProgramSong } from './adapter/djradio'
import { PlaylistAdapter } from './adapter/playlist'
import { downloadSongWithInk } from './download/progress/ink'

/**
 * page type
 */

const allowedPageTypes = ['playlist', 'album', 'djradio'] as const
type PageType = (typeof allowedPageTypes)[number]

interface AdapterItem {
  type: PageType
  typeText: string
  adapter: typeof PlaylistAdapter | typeof AlbumAdapter | typeof DjradioAdapter
}

export const adapterList = [
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
] as const

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
  skipTrial: boolean
}

export function downloadSong(options: DownloadSongOptions & { progress?: boolean }) {
  const { progress } = options
  if (progress) {
    return downloadSongWithInk(options)
  } else {
    return downloadSongPlain(options)
  }
}

// 移除判重数据
export function removeFileNameFromTracker(filePath: string, size: number | null) {
  if (!size) return
  const baseKey = getBaseNameWithoutNumbering(path.basename(filePath, path.extname(filePath))).toLocaleLowerCase('en')
  const sizes = generatedFileNames.get(baseKey)
  if (sizes) {
    sizes.delete(size)
    if (sizes.size === 0) generatedFileNames.delete(baseKey)
  }
}

export async function downloadSongPlain(options: DownloadSongOptions) {
  const { url, file, song, totalLength, retryTimeout, retryTimes, skipExists, skipTrial } = options
  const expectedSize =
    song.raw && song.raw.playUrlInfo && song.raw.playUrlInfo.size ? Number(song.raw.playUrlInfo.size) : null
  if (song.isFreeTrial && skipTrial) {
    console.log(`${logSymbols.warning} ${song.index}/${totalLength} 跳过试听 ${file}`)
    removeFileNameFromTracker(file, expectedSize)
    return
  }
  let skip = false
  try {
    ;({ skip } = await dl({
      url,
      file,
      skipExists,
      retry: {
        timeout: retryTimeout,
        times: retryTimes,
        onerror(e, i) {
          console.log(`${logSymbols.warning} ${song.index}/${totalLength}  ${i + 1}次失败 ${file}`)
        },
      },
    }))
  } catch (e: any) {
    console.log(`${logSymbols.error} ${song.index}/${totalLength} 下载失败 ${file}`)
    console.error(e.stack || e)
    removeFileNameFromTracker(file, expectedSize)
    return
  }
  console.log(`${logSymbols.success} ${song.index}/${totalLength} ${skip ? '下载跳过' : '下载成功'} ${file}`)
  removeFileNameFromTracker(file, expectedSize)
}

/**
 * check page type
 */
export function getType(url: string): AdapterItem {
  const item = adapterList.find((item) => url.includes(item.type))
  if (item) return item

  // #/radio & #/djradio 是一样的
  if (/#\/radio/.test(url)) {
    return adapterList.find((item) => item.type === 'djradio')!
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

// 用于跟踪已分配的文件名及其大小，避免重名和内容重复
const generatedFileNames: Map<string, Set<number>> = new Map()

export function resetFileNameTracker() {
  generatedFileNames.clear()
}

function getBaseNameWithoutNumbering(filename: string) {
  const ext = path.extname(filename)
  let base = path.basename(filename, ext)
  base = base.replace(/ \(\d+\)$/, '')
  return base
}

function fileExistsCaseInsensitiveWithSizeCheck(filePath: string, expectedSize: number | null): boolean {
  const dir = path.dirname(filePath)
  const targetBase = getBaseNameWithoutNumbering(path.basename(filePath)).toLocaleLowerCase('en')
  try {
    const files = fs.readdirSync(dir)
    for (const f of files) {
      if (getBaseNameWithoutNumbering(f).toLocaleLowerCase('en') === targetBase) {
        const abs = path.join(dir, f)
        try {
          const stat = fs.statSync(abs)
          if (expectedSize && stat.size === expectedSize) {
            return true
          }
        } catch {}
      }
    }
  } catch {}
  return false
}

function handleDuplicateFileName(filePath: string, expectedSize: number | null): string | typeof SKIP_DOWNLOAD {
  const isWin = os.platform() === 'win32'
  const dir = path.dirname(filePath)
  const ext = path.extname(filePath)
  const base = path.basename(filePath, ext)
  let counter = 0
  let newPath: string
  while (true) {
    newPath = counter === 0 ? path.join(dir, `${base}${ext}`) : path.join(dir, `${base} (${counter})${ext}`)
    // 检查本地和进程内是否有同“本名+大小”文件，若有则直接跳过
    let skip = false
    // 本地判重
    if (isWin) {
      try {
        if (fs.existsSync(newPath)) {
          let stat: fs.Stats | undefined
          try {
            stat = fs.statSync(newPath)
          } catch {}
          if (expectedSize && stat && stat.size === expectedSize) {
            skip = true
          }
        }
      } catch {}
    } else {
      try {
        if (fs.existsSync(newPath)) {
          let stat: fs.Stats | undefined
          try {
            stat = fs.statSync(newPath)
          } catch {}
          if (expectedSize && stat && stat.size === expectedSize) {
            skip = true
          }
        }
      } catch {}
    }
    // 进程内判重
    const baseKey = getBaseNameWithoutNumbering(path.basename(newPath, ext)).toLocaleLowerCase('en')
    const sizes = generatedFileNames.get(baseKey)
    if (!skip && sizes && expectedSize && sizes.has(expectedSize)) {
      skip = true
    }
    if (skip) {
      return SKIP_DOWNLOAD
    }
    // 只判定当前 newPath 是否被本地或进程内占用
    let localExists = false
    try {
      localExists = fs.existsSync(newPath)
    } catch {
      localExists = false
    }
    let memExists = false
    if (sizes && expectedSize && sizes.has(expectedSize)) {
      memExists = true
    }
    if (!localExists && !memExists) {
      // 记录到进程内Map
      if (expectedSize) {
        if (!generatedFileNames.has(baseKey)) generatedFileNames.set(baseKey, new Set())
        generatedFileNames.get(baseKey)!.add(expectedSize)
      }
      return newPath
    }
    counter++
  }
}

// 跳过下载的特殊标记
export const SKIP_DOWNLOAD = Symbol('SKIP_DOWNLOAD')

/**
 * 获取歌曲文件表示
 */
export function getFileName({
  format,
  song,
  url,
  name,
  checkSkipExists = true,
}: {
  format: string
  song: Song
  url: string
  name: string
  checkSkipExists?: boolean
}) {
  const adapterItem = getType(url)

  // 从 type 中取值, 先替换 `长的`
  {
    const keys: (keyof AdapterItem)[] = ['typeText', 'type']
    keys.forEach((t) => {
      const val = filenamify(String(adapterItem[t]))
      format = format.replaceAll(new RegExp(`:${t}`, 'gi'), val)
    })
  }

  // 从 `song` 中取值
  type SongKey = keyof Song
  const keys = ['songName', 'singer', 'albumName', 'rawIndex', 'index', 'ext'] satisfies SongKey[]
  keys.forEach((token) => {
    const val = filenamify(String(song[token]))
    format = format.replaceAll(new RegExp(`:${token}`, 'gi'), val)
  })

  // name
  format = format.replaceAll(/:name/gi, filenamify(name))

  // djradio only
  if (adapterItem.type === 'djradio') {
    const { programDate, programOrder } = song as ProgramSong
    if (programDate) {
      format = format.replace(/:programDate/, filenamify(programDate))
    }
    if (programOrder) {
      format = format.replace(/:programOrder/, filenamify(programOrder.toString()))
    }
  }

  if (song.isFreeTrial) {
    const dir = path.dirname(format)
    const ext = path.extname(format)
    const base = path.basename(format, ext)
    format = path.join(dir, `${base} [试听]${ext}`)
  }

  // 检查本名+大小是否已存在，若是则跳过下载，否则始终走 handleDuplicateFileName
  if (checkSkipExists) {
    try {
      const absPath = path.resolve(format)
      const isWin = os.platform() === 'win32'
      const expectedSize =
        song.raw && song.raw.playUrlInfo && song.raw.playUrlInfo.size ? Number(song.raw.playUrlInfo.size) : null
      let skip = false
      if (isWin) {
        skip = fileExistsCaseInsensitiveWithSizeCheck(absPath, expectedSize)
      } else if (fs.existsSync(absPath)) {
        let stat: fs.Stats | undefined
        try {
          stat = fs.statSync(absPath)
        } catch {}
        if (expectedSize && stat && stat.size === expectedSize) {
          skip = true
        }
      }
      // 检查当前进程内已分配的文件名（generatedFileNames Map）
      if (!skip && expectedSize) {
        const targetBase = getBaseNameWithoutNumbering(path.basename(absPath)).toLocaleLowerCase('en')
        const sizes = generatedFileNames.get(targetBase)
        if (sizes && sizes.has(expectedSize)) {
          skip = true
        }
      }
      if (skip) {
        return SKIP_DOWNLOAD
      }
    } catch {
      // ignore
    }
  }
  // 只要没跳过，始终走 handleDuplicateFileName，确保同名不同大小的文件自动编号
  const expectedSize =
    song.raw && song.raw.playUrlInfo && song.raw.playUrlInfo.size ? Number(song.raw.playUrlInfo.size) : null
  return handleDuplicateFileName(format, expectedSize)
}
