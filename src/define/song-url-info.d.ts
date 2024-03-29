// Generated by https://quicktype.io
// http://localhost:3000/song/url?id=405998841,33894312

export interface SongPlayUrlInfo {
  id: number
  url: string
  br: number
  size: number
  md5: string
  code: number
  expi: number
  type: string
  gain: number
  peak: number
  fee: number
  uf: null
  payed: number
  flag: number
  canExtend: boolean
  freeTrialInfo: FreeTrialInfo | null
  level: string
  encodeType: string
  freeTrialPrivilege: FreeTrialPrivilege
  freeTimeTrialPrivilege: FreeTimeTrialPrivilege
  urlSource: number
  rightSource: number
  podcastCtrp: null
  effectTypes: null
  time: number
}

export interface FreeTimeTrialPrivilege {
  resConsumable: boolean
  userConsumable: boolean
  type: number
  remainTime: number
}

export interface FreeTrialInfo {
  start: number
  end: number
}

export interface FreeTrialPrivilege {
  resConsumable: boolean
  userConsumable: boolean
  listenType: null
  cannotListenReason: null
}
