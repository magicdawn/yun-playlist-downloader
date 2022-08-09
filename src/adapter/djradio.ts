import BaseAdapter from './base'
import { djradioPrograms } from '../api'
import moment from 'moment'
import debugFactory from 'debug'
import { DjradioProgram, Song } from '../define'

const debug = debugFactory('yun:adapter:djradio')

export interface ProgramSong extends Song {
  // 日期
  programDate: string
  // 第x期
  programOrder: number
}

export default class DjradioAdapter extends BaseAdapter {
  #programs: DjradioProgram[]

  async getAllPrograms() {
    if (!this.#programs) {
      const allPrograms = await djradioPrograms(this.id)
      this.#programs = allPrograms
    }
    return this.#programs
  }

  get radio() {
    return this.#programs?.[0]?.radio
  }

  async getTitle() {
    await this.getAllPrograms()
    return this.radio?.name
  }

  async getCover() {
    await this.getAllPrograms()
    return this.radio.picUrl
  }

  async getSongs(quality: number): Promise<ProgramSong[]> {
    const allPrograms = await this.getAllPrograms()
    const mainSongs = allPrograms.map((x) => x.mainSong)
    const { all } = await this.filterSongs(mainSongs, quality)
    const songs = this.getSongsFromData(all)
    const programsSongs = songs.map((i, index) => {
      const { createTime } = allPrograms[index]
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
