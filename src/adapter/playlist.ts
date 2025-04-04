import { playlistDetail, songDetail } from '$api'
import { Playlist } from '$define'
import { BaseAdapter } from './base'

export class PlaylistAdapter extends BaseAdapter {
  private playlist: Playlist | undefined
  private async fetchPlaylist() {
    if (this.playlist) return
    this.playlist = await playlistDetail(this.id)
  }

  override async getTitle() {
    await this.fetchPlaylist()
    return this.playlist!.name
  }

  override async getCover() {
    await this.fetchPlaylist()
    return this.playlist!.coverImgUrl
  }

  private async getSongDatas() {
    await this.fetchPlaylist()
    const trackIds = this.playlist!.trackIds.map((x) => x.id)
    const songDatas = await songDetail(trackIds)
    return songDatas
  }
  override async getSongs(quality: number) {
    const songDatas = await this.getSongDatas()
    const { all } = await this.filterSongs(songDatas, quality)
    const songs = this.getSongsFromData(all)
    return songs
  }
}
