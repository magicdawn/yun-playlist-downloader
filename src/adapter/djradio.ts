import moment from 'moment'
import { djradioPrograms } from '$api'
import type { DjradioProgram, Song } from '$define'
import { BaseAdapter } from './base'

export interface ProgramSong extends Song {
  // 日期
  programDate: string
  // 第x期
  programOrder: number
}

export class DjradioAdapter extends BaseAdapter {
  private programs: DjradioProgram[] | undefined
  async fetchAllPrograms() {
    if (this.programs) return
    this.programs = (await djradioPrograms(this.id)) || []
  }

  get radio() {
    return this.programs?.[0]?.radio
  }

  override async getTitle() {
    await this.fetchAllPrograms()
    return this.radio?.name
  }

  override async getCover() {
    await this.fetchAllPrograms()
    return this.radio?.picUrl
  }

  override async getSongs(quality: number): Promise<ProgramSong[]> {
    await this.fetchAllPrograms()
    const allPrograms = this.programs!
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
