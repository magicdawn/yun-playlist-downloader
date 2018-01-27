const API = require('@magicdawn/music-api')
const debug = require('debug')('yun:adapter:album')
const BaseAdapter = require('./base')

module.exports = class AlbumAdapter extends BaseAdapter {
  getTitle($) {
    return $('h2.f-ff2').text()
  }

  async getDetail($, url, quality) {
    const id = this.getId(url)
    const ret = await API.getAlbum('netease', { id, raw: true })
    return ret.songs
  }
}
