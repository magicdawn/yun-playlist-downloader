import {Playlist, Track} from './api/response/playlist-detail'

export interface Song {
  // 歌手
  singer: string

  // 歌曲名
  songName: string

  // url for download
  url: string

  // raw data
  raw?: any
}

export interface SongForFormat extends Song {
  // extension
  ext: string

  // index, first as 01
  index: string

  // rawIndex: 0,1 ...
  rawIndex: number
}

export type PlaylistJson = Playlist
export type SongJson = Track

export interface SongJsonWithAjaxdata extends SongJson {
  ajaxData: {
    url: string
  }
}
