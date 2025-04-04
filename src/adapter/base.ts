import { songUrl } from '$api'
import { Song, SongPlayUrlInfo } from '$define'
import { getId } from '$util'
import { invariant } from 'es-toolkit'
import { get } from 'es-toolkit/compat'
import { extname } from 'path'

export abstract class BaseAdapter {
  url: string
  id: string
  constructor(url: string) {
    this.url = url
    const id = getId(url)
    invariant(id, 'id cannot be empty')
    this.id = id!
  }

  /**
   * get title for a page
   */
  abstract getTitle(): Promise<string | undefined>

  /**
   * get cover
   */
  abstract getCover(): Promise<string | undefined>

  /**
   * get songs
   */
  abstract getSongs(quality: number): Promise<Song[]>

  /**
   * get songs detail
   */
  getSongsFromData<T extends { name: string; playUrlInfo?: SongPlayUrlInfo }>(
    songDatas: T[],
  ): Song[] {
    // e.g 100 songDatas -> len = 3
    const len = String(songDatas.length).length

    return songDatas.map(function (songData, index) {
      const url = songData.playUrlInfo?.url

      let ext: string | undefined
      if (url) {
        const pathname = new URL(url).pathname
        ext = extname(pathname)
        if (ext.startsWith('.')) ext = ext.slice(1)
      }

      return {
        // 歌手
        singer:
          (get(songData, 'ar.0.name') as string) ||
          (get(songData, 'artists.0.name') as string) ||
          '',

        // 歌曲名
        songName: songData.name,

        // 专辑名
        albumName: (get(songData, 'al.name') as string) || '',

        // url for download
        url,

        // free trial
        isFreeTrial: songData.playUrlInfo ? Boolean(songData.playUrlInfo.freeTrialInfo) : undefined,

        // extension
        ext,

        // index, first as 01
        index: String(index + 1).padStart(len, '0'),

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
