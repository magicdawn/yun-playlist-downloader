import * as Api from 'NeteaseCloudMusicApi'
import delay from 'delay'
import _ from 'lodash'
import pmap from 'promise.map'
import { COOKIE_CONTENT } from '../auth/cookie'
import { baseDebug } from '../common'
import { Album, DjradioProgram, Playlist, SongData, SongPlayUrlInfo } from '../define'

const debug = baseDebug.extend('api:index')

type Id = string | number

/**
 * 分片处理
 * songData / songUrl 需要分片, id 太多报错
 * see https://github.com/magicdawn/yun-playlist-downloader/issues/51
 */

export const BATCH_ID_SIZE = 200
export const BATCH_ID_CONCURRENCY = 4

/**
 * {
		"body": {
			"code": 406
			"message": "操作频繁，请稍候再试"
			"msg": "操作频繁，请稍候再试"
		}
		"cookie": []
		"status": 406
	}
 */
export function handleRequestLimit<T extends (...args: any[]) => any>(fn: T, label: string) {
  return async function (...args: Parameters<T>) {
    let ret: ReturnType<T>

    const limitReached = (err: any) =>
      err &&
      typeof err === 'object' &&
      err.status === 406 &&
      err.body?.code === 406 &&
      /操作频繁/.test(err.body?.message || '')

    let wait = 1
    while (true) {
      let err: any

      try {
        ret = await fn(...args)
      } catch (e) {
        err = e
      }

      if (limitReached(err)) {
        debug('handleRequestLimit: 406-操作频繁 for %s, staring wait  %s seconds', label, wait)
        await delay(1000 * wait++)
        continue
      }

      if (err) {
        throw err
      } else {
        debug('handleRequestLimit: success for %s', label)
        return ret!
      }
    }
  }
}

/**
 * 歌单详情
 */

export async function playlistDetail(id: string) {
  const res = await Api.playlist_detail({ id, cookie: COOKIE_CONTENT })
  const playlist = res.body.playlist as Playlist
  return playlist
}

/**
 * song 详情
 */

export async function songDetail(ids: Id[]) {
  const singleRequest = async (idsStr: string) => {
    const res = await Api.song_detail({ ids: idsStr })
    const songDatas = res.body.songs as SongData[]
    return songDatas
  }

  // 500 首做一次 request
  const chunks = _.chunk(ids, BATCH_ID_SIZE)
  const songDatasArray = await pmap(
    chunks,
    (chunk) => {
      return singleRequest(chunk.join(','))
    },
    BATCH_ID_CONCURRENCY
  )

  return songDatasArray.flat()
}

/**
 * song 播放地址
 */

export async function songUrl(ids: Id[], quality?: string | number) {
  const singleRequest = async (id: string) => {
    const res = await Api.song_url({ id, br: quality })
    const infos = res.body.data as SongPlayUrlInfo[]
    return infos
  }

  const chunks = _.chunk(ids, BATCH_ID_SIZE)
  const infosArr = await pmap(
    chunks,
    (chunk) => singleRequest(chunk.join(',')),
    BATCH_ID_CONCURRENCY
  )
  return infosArr.flat()
}

/**
 * 专辑
 */

export async function album(id: Id) {
  const res = await Api.album({ id })
  const album = res.body.album as Album
  const songs = res.body.songs as SongData[]
  return { album, songs }
}

/**
 * 电台
 */

export async function djradioPrograms(id: Id) {
  let hasMore = true
  let pagesize = 100
  let pagenum = 1
  let allPrograms: DjradioProgram[] = []

  do {
    const res = await handleRequestLimit(
      Api.dj_program,
      `dj_program(${pagenum})`
    )({
      rid: id,
      limit: pagesize,
      offset: (pagenum - 1) * pagesize,
      asc: 'false', // lastest published first
    })

    const programs = res.body.programs as DjradioProgram
    allPrograms = allPrograms.concat(programs)

    hasMore = res.body.more as boolean
    pagenum++
  } while (hasMore)

  return allPrograms
}
