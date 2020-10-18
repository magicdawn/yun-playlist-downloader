import API from '@magicdawn/music-api'
import pmap from 'promise.map'
import {normalizeUrl, getId, get$} from '../util'
import programDetail from '../api/program-detail'
import debugFactory from 'debug'
import BaseAdapter from './base'
import {Song} from '../common'
import {djradioPrograms} from '../api'
import {create} from 'lodash'
import moment from 'moment'

const debug = debugFactory('yun:adapter:djradio')

export interface ProgramSong extends Song {
  // 日期
  programDate: string
  // 第x期
  programOrder: number
}

export default class DjradioAdapter extends BaseAdapter {
  #detail: any
  private getDetail() {
    // if()
  }

  async getTitle() {
    return this.$('h2.f-ff2').text()
  }

  async getSongs(quality: number): Promise<ProgramSong[]> {
    const allPrograms = await djradioPrograms(this.id)

    const mainSongs = allPrograms.map((x) => x.mainSong)
    const {all} = await this.filterSongs(mainSongs, quality)
    const songs = this.getSongsFromData(all)
    const programsSongs = songs.map((i, index) => {
      const {createTime} = allPrograms[index]
      const programDate = moment(createTime).format('YYYY-MM-DD')
      const programOrder = allPrograms.length - index
      return {
        ...i,
        programDate,
        programOrder,
      } as ProgramSong
    })
    return programsSongs
  }
}
