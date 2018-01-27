const API = require('@magicdawn/music-api')
const debug = require('debug')('yun:adapter:playlist')
const BaseAdapter = require('./base')

module.exports = class PlaylistAdapter extends BaseAdapter {
  getTitle($) {
    return $('h2.f-ff2.f-brk').text()
  }

  async getDetail($, url, quality) {
    const id = this.getId(url)
    const ret = await API.getPlaylist('netease', { id, raw: true })
    return ret.playlist.tracks
  }
}
