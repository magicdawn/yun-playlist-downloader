import { album } from '../api'
import { Album } from '../api/quicktype/album'
import { SongData, Song } from '../common'
import BaseAdapter from './base'

// import debugFactory from 'debug'
// const debug = debugFactory('yun:adapter:album')

export default class AlbumAdapter extends BaseAdapter {
  #detail: { album: Album; songs: SongData[] }
  private async getDetail() {
    if (this.#detail) {
      return this.#detail
    }
    this.#detail = await album(this.id)
  }

  async getTitle() {
    await this.getDetail()
    return this.#detail.album.name
  }

  async getCover() {
    await this.getDetail()
    return this.#detail.album.picUrl
  }

  async getSongs(quality: number): Promise<Song[]> {
    await this.getDetail()
    const { all: songDatas } = await this.filterSongs(this.#detail.songs, quality)
    return this.getSongsFromData(songDatas)
  }
}
