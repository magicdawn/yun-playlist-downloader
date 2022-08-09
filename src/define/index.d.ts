export { Album } from './album'
export { DjradioProgram } from './djradio'
export { Playlist } from './playlist-detail'
export { SongPlayUrlInfo } from './song-url-info'

import { Track } from './playlist-detail'
import { SongPlayUrlInfo } from './song-url-info'

export type Song = {
  // 歌手
  singer: string

  // 歌曲名
  songName: string

  // url for download
  url?: string

  // extension
  ext?: string

  // raw data
  raw?: any

  // index, first as 01
  index: string

  // rawIndex: 0,1 ...
  rawIndex: number
}

import { type SetRequired } from 'type-fest'
export type SongValid = SetRequired<Song, 'url' | 'ext'>

export type SongData = Track

export interface SongDataFull extends SongData {
  playUrlInfo?: SongPlayUrlInfo
}
