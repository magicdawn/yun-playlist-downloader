const API = require('@magicdawn/music-api')
const debug = require('debug')('yun:adapter:djradio')
const pmap = require('promise.map')
const BaseAdapter = require('./base')
const {normalizeUrl, getId} = require('../util.js')
const programDetail = require('../api/program-detail.js')

module.exports = class DjradioAdapter extends BaseAdapter {
  getTitle($) {
    return $('h2.f-ff2').text()
  }

  async getDetail($, url, quality) {
    const text = $('#radio-data').text()

    const $rows = $('.m-table.m-table-program tr')
    let programs = $rows.map(function() {
      const $row = $(this)
      const getText = selector =>
        $row
          .find(selector)
          .text()
          .trim()

      // song-id
      const songId = $row.attr('id').replace(/^songlist-/g, '')

      // 节目顺序
      const programOrder = getText('.col1')

      // 名称
      const name = getText('.col2 .tt a')

      // 链接
      let programUrl = $row.find('.col2 .tt a').attr('href')
      programUrl = new URL(programUrl, url).href

      const programId = getId(programUrl)

      // 播放数量
      const playCount = getText('.col3')

      // 赞数量
      const likeCount = getText('.col4')

      // 日期
      const date = getText('.col5')

      // 时长
      const audioDuration = getText('.f-pr')

      return {
        songId,
        programId,
        programOrder,
        name,
        programUrl,
        playCount,
        likeCount,
        date,
        audioDuration,
      }
    })

    // get mainSong via API
    programs = await pmap(
      programs,
      async programUi => {
        const {programId} = programUi
        const program = await programDetail(programId)
        const {mainSong} = program
        return {mainSong, programDetail, programUi}
      },
      10
    )

    // 和其他 adapter 一样的格式
    const detail = programs.map(item => {
      const {mainSong, programDetail, programUi} = item
      Object.assign(mainSong, {programDetail, programUi})
      return mainSong
    })
    return detail
  }
}
