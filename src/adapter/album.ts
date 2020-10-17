import API = require('@magicdawn/music-api')
import debugFactory from 'debug'
import BaseAdapter from './base'

const debug = debugFactory('yun:adapter:album')

export default class AlbumAdapter extends BaseAdapter {
  getTitle() {
    return this.$('h2.f-ff2').text()
  }

  async getDetail(quality) {
    const id = this.id
    const ret = await API.getAlbum('netease', {id, raw: true})
    return ret.songs
  }
}
