import type { Track } from './playlist-detail.js'
import type { SongPlayUrlInfo } from './song-url-info.js'

import type { SetRequired } from 'type-fest'

export { Album } from './album.js'
export { DjradioProgram } from './djradio.js'
export { Playlist } from './playlist-detail.js'
export { SongPlayUrlInfo } from './song-url-info.js'

export type Song = {
  // 歌手
  singer: string

  // 歌曲名
  songName: string

  // 所属专辑
  albumName: string

  // url for download
  url?: string

  // 试听?
  isFreeTrial?: boolean

  // extension
  ext?: string

  // raw data
  raw?: any

  // index, first as 01
  index: string

  // rawIndex: 0,1 ...
  rawIndex: number
}
export type SongValid = SetRequired<Song, 'url' | 'ext'>

export type SongData = Track

export interface SongDataFull extends SongData {
  playUrlInfo?: SongPlayUrlInfo
}
