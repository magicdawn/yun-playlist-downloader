import { album } from '$api'
import { Album, Song, SongData } from '$define'
import { BaseAdapter } from './base'

export class AlbumAdapter extends BaseAdapter {
  #detail: { album: Album; songs: SongData[] }
  private async fetchDetail() {
    if (this.#detail) return
    this.#detail = await album(this.id)
  }

  async getTitle() {
    await this.fetchDetail()
    return this.#detail.album.name
  }

  async getCover() {
    await this.fetchDetail()
    return this.#detail.album.picUrl
  }

  async getSongs(quality: number): Promise<Song[]> {
    await this.fetchDetail()
    const { all: songDatas } = await this.filterSongs(this.#detail.songs, quality)
    return this.getSongsFromData(songDatas)
  }
}
