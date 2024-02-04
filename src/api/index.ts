import { COOKIE_CONTENT } from '$auth/cookie'
import { baseDebug } from '$common'
import { Album, DjradioProgram, Playlist, SongData, SongPlayUrlInfo } from '$define'
import Api from 'NeteaseCloudMusicApi'
import qrcode from 'qrcode-terminal' // 不能 import { xxx } from 'qrcode-terminal'，运行会出错，一个bug
import delay from 'delay'
import { chunk } from 'lodash-es'
import pmap from 'promise.map'
import { sleep } from '$util'

const debug = baseDebug.extend('api:index')

type Id = string | number

/**
 * 分片处理
 * songData / songUrl 需要分片, id 太多报错
 * see https://github.com/magicdawn/yun-playlist-downloader/issues/51
 */

export const BATCH_ID_SIZE = 200
export const BATCH_ID_CONCURRENCY = 4

const getApiBaseConfig = (): Api.RequestBaseConfig => {
  return { cookie: COOKIE_CONTENT }
}

/**
 * {
		"body": {
			"code": 406
			"message": "操作频繁，请稍候再试"
			"msg": "操作频繁，请稍候再试"
		}
		"cookie": []
		"status": 406
	}

	貌似只有 dj_program 有影响...
	先不包其他接口了
 */
export function handleRequestLimit<T extends (...args: any[]) => any>(fn: T, label: string) {
  return async function (...args: Parameters<T>) {
    let ret: ReturnType<T>

    const limitReached = (err: any) =>
      err &&
      typeof err === 'object' &&
      err.status === 406 &&
      err.body?.code === 406 &&
      /操作频繁/.test(err.body?.message || '')

    let wait = 1
    while (true) {
      let err: any

      try {
        ret = await fn(...args)
      } catch (e) {
        err = e
      }

      if (limitReached(err)) {
        debug('handleRequestLimit: 406-操作频繁 for %s, staring wait  %s seconds', label, wait)
        await delay(1000 * wait++)
        continue
      }

      if (err) {
        throw err
      } else {
        debug('handleRequestLimit: success for %s', label)
        return ret!
      }
    }
  }
}

/**
 * 歌单详情
 */

export async function playlistDetail(id: string) {
  const res = await Api.playlist_detail({ ...getApiBaseConfig(), id })
  const playlist = res.body.playlist as Playlist
  return playlist
}

/**
 * song 详情
 */

export async function songDetail(ids: Id[]) {
  const singleRequest = async (idsStr: string) => {
    const res = await Api.song_detail({ ...getApiBaseConfig(), ids: idsStr })
    const songDatas = res.body.songs as SongData[]
    return songDatas
  }

  // 500 首做一次 request
  const chunks = chunk(ids, BATCH_ID_SIZE)
  const songDatasArray = await pmap(
    chunks,
    (chunk) => {
      return singleRequest(chunk.join(','))
    },
    BATCH_ID_CONCURRENCY
  )

  return songDatasArray.flat()
}

/**
 * song 播放地址
 */

export async function songUrl(ids: Id[], quality?: string | number) {
  const singleRequest = async (id: string) => {
    const res = await Api.song_url({ ...getApiBaseConfig(), id, br: quality })
    const infos = res.body.data as SongPlayUrlInfo[]
    return infos
  }

  const chunks = chunk(ids, BATCH_ID_SIZE)
  const infosArr = await pmap(
    chunks,
    (chunk) => singleRequest(chunk.join(',')),
    BATCH_ID_CONCURRENCY
  )
  return infosArr.flat()
}

/**
 * 专辑
 */

export async function album(id: Id) {
  const res = await Api.album({ ...getApiBaseConfig(), id })
  const album = res.body.album as Album
  const songs = res.body.songs as SongData[]
  return { album, songs }
}

/**
 * 电台
 */

export async function djradioPrograms(id: Id) {
  let hasMore = true
  let pagesize = 100
  let pagenum = 1
  let allPrograms: DjradioProgram[] = []

  do {
    const res = await handleRequestLimit(
      Api.dj_program,
      `dj_program(${pagenum})`
    )({
      ...getApiBaseConfig(),
      rid: id,
      limit: pagesize,
      offset: (pagenum - 1) * pagesize,
      asc: 'false', // lastest published first
    })

    const programs = res.body.programs as DjradioProgram
    allPrograms = allPrograms.concat(programs)

    hasMore = res.body.more as boolean
    pagenum++
  } while (hasMore)

  return allPrograms
}

/**
 * 登录
 */

export async function QRCodeLogin() {
  // 1. 生成 key
  let r = await Api.login_qr_key({})
  if (r.body.code != 200) {
    console.log('生成二维码失败')
    process.exit(1)
  }

  const key = (r.body.data as any).unikey

  // 2. 生成二维码
  r = await Api.login_qr_create({ key: key })
  if (r.body.code != 200) {
    console.log('生成二维码失败')
    process.exit(1)
  }

  const qrurl = (r.body.data as any).qrurl
  qrcode.generate(qrurl, { small: true })
  console.log('请扫描二维码登录')

  // 3. 等待扫码
  while (true) {
    r = await Api.login_qr_check({ key: key })

    const code = r.body.code // 800 为二维码过期,801 为等待扫码,802 为待确认,803 为授权登录成功(803 状态码下会返回 cookies),如扫码后返回502,则需加上noCookie参数,如&noCookie=true

    if (code == 803) {
      return r.body.cookie
    } else if (code == 802 || code == 801) {
      await sleep(5000)
      // continue
    } else if (code == 800) {
      console.log('二维码超时')
      // break
      process.exit(1)
    }
  }
}
