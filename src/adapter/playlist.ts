const API = require('@magicdawn/music-api')
import debugNew from 'debug'
import BaseAdapter from './base'
import {playlistDetail, songDetail} from '../api'

const debug = debugNew('yun:adapter:playlist')

export default class PlaylistAdapter extends BaseAdapter {
  getTitle() {
    return this.$('h2.f-ff2.f-brk').text()
  }

  async getSongDatas() {
    const playlist = await playlistDetail(this.id)
    const trackIds = playlist.trackIds.map((x) => x.id)
    const songDatas = await songDetail(trackIds.join(','))
    return songDatas
  }

  async getSongs(quality: number) {
    const songDatas = await this.getSongDatas()
    const {all} = await this.filterSongs(songDatas, quality)
    const songs = this.getSongsFromData(all)
    return songs
  }
}
