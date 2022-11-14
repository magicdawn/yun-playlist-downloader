import { playlistDetail, songDetail } from '../api'
import { Playlist } from '../define'
import BaseAdapter from './base'

// import debugNew from 'debug'
// const debug = debugNew('yun:adapter:playlist')

export default class PlaylistAdapter extends BaseAdapter {
  #playlist: Playlist

  private async getPlaylist() {
    if (!this.#playlist) {
      this.#playlist = await playlistDetail(this.id)
    }
    return this.#playlist
  }

  async getTitle() {
    await this.getPlaylist()
    return this.#playlist.name
  }

  async getCover() {
    await this.getPlaylist()
    return this.#playlist.coverImgUrl
  }

  async getSongDatas() {
    const playlist = await this.getPlaylist()
    const trackIds = playlist.trackIds.map((x) => x.id)
    const songDatas = await songDetail(trackIds)
    return songDatas
  }

  async getSongs(quality: number) {
    const songDatas = await this.getSongDatas()
    const { all } = await this.filterSongs(songDatas, quality)
    const songs = this.getSongsFromData(all)
    return songs
  }
}
