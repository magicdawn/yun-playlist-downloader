const API = require('@magicdawn/music-api')
import debugNew from 'debug'
import BaseAdapter from './base'
import * as yun from 'NeteaseCloudMusicApi'
import type {PlaylistJson, SongJson} from '../common'

const debug = debugNew('yun:adapter:playlist')

export default class PlaylistAdapter extends BaseAdapter {
  getTitle() {
    return this.$('h2.f-ff2.f-brk').text()
  }

  async getTracks() {
    const detail = await yun.playlist_detail({id: this.id})
    const trackIds = (detail.body.playlist as PlaylistJson).trackIds.map(
      (x) => x.id
    )

    const songDetails = await yun.song_detail({ids: trackIds.join(',')})
    const songs = songDetails.body.songs as SongJson[]
    return songs
  }

  async getDetail(quality: string) {
    return this.getTracks()
  }
}
