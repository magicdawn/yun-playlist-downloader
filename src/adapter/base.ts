import {extname} from 'path'
import {padStart, remove, trimStart} from 'lodash'
import _ from 'lodash'
import debugFactory from 'debug'
import {getId} from '../util'
import {Song, SongData, SongDataFull} from '../common'
import {songDetail, songUrl} from '../api'

const debug = debugFactory('yun:adapter:base')
const NOT_IMPLEMENTED = 'not NOT_IMPLEMENTED'

interface AdapterOptions {
  $: cheerio.Root
  url: string
}

export default class BaseAdapter {
  options: AdapterOptions
  constructor(options: AdapterOptions) {
    this.options = options
  }

  get url() {
    return this.options.url
  }

  get $() {
    return this.options.$
  }

  get id() {
    return getId(this.url)
  }

  /**
   * get title for a page
   */

  getTitle(): string {
    throw new Error(NOT_IMPLEMENTED)
  }

  /**
   * get songs
   */
  getSongs(quality: number): Promise<Song[]> {
    throw new Error(NOT_IMPLEMENTED)
  }

  /**
   * get songs detail
   */

  getSongsFromData(songDatas: SongDataFull[]): Song[] {
    // e.g 100 songDatas -> len = 3
    const len = String(songDatas.length).length

    return songDatas.map(function (songData, index) {
      const url = songData.playUrlInfo?.url

      return {
        // 歌手
        singer:
          _.get(songData, 'ar.0.name') || _.get(songData, 'artists.0.name'),

        // 歌曲名
        songName: songData.name,

        // url for download
        url,

        // extension
        ext: url && trimStart(extname(url), '.'),

        // index, first as 01
        index: padStart(String(index + 1), len, '0'),

        // rawIndex: 0,1 ...
        rawIndex: index,

        // raw
        raw: songData,
      }
    })
  }

  async filterSongs(
    songDatas: SongData[],
    quality: number
  ): Promise<{
    songs: SongDataFull[]
    removed: SongDataFull[]
    all: SongDataFull[]
  }> {
    // 获取下载链接
    const ids = songDatas.map((s) => s.id).join(',')
    const playUrlInfos = await songUrl(ids, quality)
    const ret = {songs: [], removed: [], all: []}

    for (let songData of songDatas) {
      const {id} = songData
      const info = playUrlInfos.find((x) => String(x.id) === String(id))

      const songDataFull = songData as SongDataFull
      songDataFull.playUrlInfo = info
      ret.all.push(songDataFull)

      // 版权受限
      if (!info || !info.url) {
        ret.removed.push(songDataFull)
      } else {
        ret.songs.push(songDataFull)
      }
    }

    return ret
  }
}
