import path from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import { getFileName, resetFileNameTracker } from '../src/index'
import type { Song } from '../src/define'

describe('Debug filename generation', () => {
  beforeEach(() => {
    resetFileNameTracker()
  })

  it('should debug filename generation', () => {
    const format = ':name/:songName.:ext'
    const url = 'https://music.163.com/#/playlist?id=123'
    const name = 'Test Playlist'

    const song1: Song = {
      singer: 'Artist A',
      songName: 'Same Song',
      albumName: 'Album 1',
      index: '01',
      rawIndex: 0,
      ext: 'mp3',
    }

    const song2: Song = {
      singer: 'Artist B',
      songName: 'Same Song',
      albumName: 'Album 2',
      index: '02',
      rawIndex: 1,
      ext: 'mp3',
    }

    const filename1 = getFileName({ format, song: song1, url, name })
    const filename2 = getFileName({ format, song: song2, url, name })

    console.log('Filename 1:', filename1)
    console.log('Filename 2:', filename2)

    // 使用 path.normalize 来处理路径分隔符

    expect(path.normalize(filename1 as string)).toBe(path.normalize('Test Playlist/Same Song.mp3'))
    expect(path.normalize(filename2 as string)).toBe(path.normalize('Test Playlist/Same Song (1).mp3'))
  })
})
