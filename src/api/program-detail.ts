import _ from 'lodash'
import debugFactory from 'debug'
import {umi} from '../singleton'

const debug = debugFactory('yun:api:program-detail')
const debugDetail = debugFactory('yun-detail:api:program-detail')

export default async function programDetail(id: string) {
  const json = await umi.post('/weapi/dj/program/detail', {
    data: {id},
  })

  debugDetail('result for id=%s,  json=%j', id, json)
  debug('result for id=%s, mainSong.name=%j', id, json.program.mainSong.name)
  return json && json.program
}
