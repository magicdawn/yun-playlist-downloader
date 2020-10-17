import API from '@magicdawn/music-api'
import pmap from 'promise.map'
import {normalizeUrl, getId, get$} from '../util'
import programDetail from '../api/program-detail'
import debugFactory from 'debug'
import BaseAdapter from './base'

const debug = debugFactory('yun:adapter:djradio')

export default class DjradioAdapter extends BaseAdapter {
  getTitle() {
    return this.$('h2.f-ff2').text()
  }

  async getProgramsOnPage($, url, quality) {
    const text = $('#radio-data').text()

    const $rows = $('.m-table.m-table-program tr')
    let programs = $rows
      .map(function () {
        const $row = $(this)
        const getText = (selector) => $row.find(selector).text().trim()

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
      .toArray()

    return programs
  }

  async getAllPrograms($, url, quality) {
    let arr = await this.getProgramsOnPage($, url, quality)

    const hasNextPage = ($) => {
      const $a = $('.u-page a.zbtn.znxt')
      let has = true

      // text = 下一页
      has = has && $a.text().trim() === '下一页'

      // href = '/xxx' or 'http://' or 'https://'
      const href = $a.attr('href') || ''
      const validHref = href.startsWith('/') || href.startsWith('http')
      has = has && validHref

      return has
    }
    const nextPageUrl = ($) => {
      const href = $('.u-page a.zbtn.znxt').attr('href')
      const u = new URL(href, url)
      return u.href
    }

    while (hasNextPage($)) {
      url = nextPageUrl($)
      $ = await get$(url)
      const current = await this.getProgramsOnPage($, url, quality)
      arr = arr.concat(current)
    }

    return arr
  }

  // async getDetail($, url, quality) {
  //   let programs = await this.getAllPrograms($, url, quality)

  //   // get mainSong via API
  //   programs = await pmap(
  //     programs,
  //     async (programUi) => {
  //       const {programId} = programUi as any
  //       const program = await programDetail(programId)
  //       const {mainSong} = program
  //       return {mainSong, programDetail: program, programUi}
  //     },
  //     10
  //   )

  //   // 和其他 adapter 一样的格式
  //   const detail = programs.map((item) => {
  //     const {mainSong, programDetail, programUi} = item
  //     Object.assign(mainSong, {programDetail, programUi})
  //     return mainSong
  //   })
  //   return detail
  // }
}
