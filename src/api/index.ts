import _ from 'lodash'
import * as Api from 'NeteaseCloudMusicApi'
import pmap from 'promise.map'
import { COOKIE_CONTENT } from '../auth/cookie'
import { Album, DjradioProgram, Playlist, SongData, SongPlayUrlInfo } from '../define'

type Id = string | number

/**
 * 分片处理
 * songData / songUrl 需要分片, id 太多报错
 * see https://github.com/magicdawn/yun-playlist-downloader/issues/51
 */

export const BATCH_ID_SIZE = 200
export const BATCH_ID_CONCURRENCY = 4

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
    const res = await Api.dj_program({
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
