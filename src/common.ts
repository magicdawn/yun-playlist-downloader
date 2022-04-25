import { Track } from './api/quicktype/playlist-detail'
import { SongPlayUrlInfo } from './api/quicktype/song-url-info'

export interface Song {
  // 歌手
  singer: string

  // 歌曲名
  songName: string

  // url for download
  url: string

  // raw data
  raw?: any

  // extension
  ext: string

  // index, first as 01
  index: string

  // rawIndex: 0,1 ...
  rawIndex: number
}

export type SongData = Track

export interface SongDataFull extends SongData {
  playUrlInfo?: SongPlayUrlInfo
}
