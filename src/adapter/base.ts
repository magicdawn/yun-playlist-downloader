import { songUrl } from '$api'
import { Song, SongPlayUrlInfo } from '$define'
import { getId } from '$util'
import { assert } from 'console'
import * as _ from 'lodash-es'
import { padStart, trimStart } from 'lodash-es'
import { extname } from 'path'

const NOT_IMPLEMENTED = 'not NOT_IMPLEMENTED'

export class BaseAdapter {
  url: string
  id: string
  constructor(url: string) {
    this.url = url
    const id = getId(url)
    assert(id, 'id is empty')
    this.id = id!
  }

  /**
   * get title for a page
   */

  async getTitle(): Promise<string> {
    throw new Error(NOT_IMPLEMENTED)
  }

  /**
   * get cover
   */

  async getCover(): Promise<string> {
    return ''
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

  getSongsFromData<T extends { name: string; playUrlInfo?: SongPlayUrlInfo }>(
    songDatas: T[]
  ): Song[] {
    // e.g 100 songDatas -> len = 3
    const len = String(songDatas.length).length

    return songDatas.map(function (songData, index) {
      const url = songData.playUrlInfo?.url

      return {
        // 歌手
        singer:
          (_.get(songData, 'ar.0.name') as string) ||
          (_.get(songData, 'artists.0.name') as string) ||
          '',

        // 歌曲名
        songName: songData.name,

        // 专辑名
        albumName: (_.get(songData, 'al.name') as string) || '',

        // url for download
        url,

        // free trial
        isFreeTrial: songData.playUrlInfo ? Boolean(songData.playUrlInfo.freeTrialInfo) : undefined,

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

  async filterSongs<T extends { id: number }>(songDatas: T[], quality: number) {
    type WithOptionalPlayUrlInfo = T & { playUrlInfo?: SongPlayUrlInfo }

    // 获取下载链接
    const ids = songDatas.map((s) => s.id)
    const playUrlInfos = await songUrl(ids, quality)
    const ret: {
      songs: WithOptionalPlayUrlInfo[]
      removed: WithOptionalPlayUrlInfo[]
      all: WithOptionalPlayUrlInfo[]
    } = { songs: [], removed: [], all: [] }

    for (let songData of songDatas) {
      const { id } = songData
      const info = playUrlInfos.find((x) => String(x.id) === String(id))

      const songDataFull = songData as WithOptionalPlayUrlInfo
      songDataFull.playUrlInfo = info
      ret.all.push(songDataFull)

      // 版权受限
      if (!info?.url) {
        ret.removed.push(songDataFull)
      } else {
        ret.songs.push(songDataFull)
      }
    }

    return ret
  }
}
