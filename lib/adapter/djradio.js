const API = require('@magicdawn/music-api')
const debug = require('debug')('yun:adapter:djradio')
const BaseAdapter = require('./base')

module.exports = class DjradioAdapter extends BaseAdapter {
  getTitle($) {
    return $('h2.f-ff2').text()
  }

  async getDetail($, url, quality) {
    const text = $('#radio-data').text()

    console.log('text=')
    console.log(text)
    // const json = JSON.parse(text)
    // console.log(json)
    // return json
  }
}
