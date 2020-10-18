import * as Api from 'NeteaseCloudMusicApi'
import {SongData} from '../common'
import {Playlist} from './quicktype/playlist-detail'
import {SongPlayUrlInfo} from './quicktype/song-url-info'

export type StringOrNumber = string | number

/**
 * 歌单详情
 */

export async function playlistDetail(id: string) {
  const res = await Api.playlist_detail({id})
  const playlist = res.body.playlist as Playlist
  return playlist
}

/**
 * song 详情
 */

export async function songDetail(ids: string) {
  const res = await Api.song_detail({ids})
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
  const res = await Api.song_url({id, br: quality})
  const infos = res.body.data as SongPlayUrlInfo[]
  return infos
}
