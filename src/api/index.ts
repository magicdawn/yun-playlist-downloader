import * as Api from 'NeteaseCloudMusicApi'
import { COOKIE_CONTENT } from '../auth/cookie'
import { Album, DjradioProgram, Playlist, SongData, SongPlayUrlInfo } from '../define'

export type StringOrNumber = string | number

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

export async function songDetail(ids: string) {
  const res = await Api.song_detail({ ids })
  const songDatas = res.body.songs as SongData[]
  return songDatas
}

/**
 * song 播放地址
 */

export async function songUrl(
  id: Array<StringOrNumber> | StringOrNumber,
  quality?: StringOrNumber
) {
  if (Array.isArray(id)) {
    id = id.join(',')
  }
  const res = await Api.song_url({ id, br: quality })
  const infos = res.body.data as SongPlayUrlInfo[]
  return infos
}

/**
 * 专辑
 */

export async function album(id: StringOrNumber) {
  const res = await Api.album({ id })
  const album = res.body.album as Album
  const songs = res.body.songs as SongData[]
  return { album, songs }
}

/**
 * 电台
 */

export async function djradio(id: StringOrNumber) {}

export async function djradioPrograms(id: StringOrNumber) {
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
