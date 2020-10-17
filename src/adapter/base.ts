import {extname} from 'path'
import {padStart, trimStart} from 'lodash'
import _ from 'lodash'
import debugFactory from 'debug'
import {getId} from '../util'
import {Song, SongForFormat, SongJson} from '../common'

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
   * get detail
   */

  getDetail(quality: string): Promise<SongJson[]> {
    throw new Error(NOT_IMPLEMENTED)
  }

  /**
   * get songs detail
   *
   * @param {Array} [songs] songs
   */

  getSongs(songs): SongForFormat[] {
    // e.g 100 songs -> len = 3
    const len = String(songs.length).length

    return songs.map(function (song, index) {
      return {
        // 歌手
        singer: _.get(song, 'ar.0.name') || _.get(song, 'artists.0.name'),

        // 歌曲名
        songName: song.name,

        // url for download
        url: song.ajaxData.url,

        // extension
        ext: trimStart(extname(song.ajaxData.url), '.'),

        // index, first as 01
        index: padStart(String(index + 1), len, '0'),

        // rawIndex: 0,1 ...
        rawIndex: index,

        // raw
        raw: song,
      }
    })
  }
}
