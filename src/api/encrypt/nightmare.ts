const Nightmare = require('nightmare')
const _ = require('lodash')

export default async function encryptViaNightmare(reqbody) {
  reqbody = JSON.stringify(reqbody)

  // args
  const defaultArgs = [
    '010001',
    [
      '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17',
      'a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c938701',
      '14af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97dde',
      'f52741d546b8e289dc6935b3ece0462db0a22b8e7',
    ].join(''),
    '0CoJUm6Qyw8W8jud',
  ]
  const args = _.cloneDeep(defaultArgs)
  args.unshift(reqbody)
  const night = Nightmare()

  let body
  let err
  let cookies
  try {
    await night.goto('http://music.163.com')
    body = await night.evaluate((args) => {
      /* eslint-env browser */
      return (window as any).asrsea.apply(window, args)
    }, args)
    cookies = await night.cookies.get()
    await night.end()
  } catch (e) {
    err = e
    if (err) {
      throw err
    }
  }

  // encText -> params
  body.params = body.encText
  delete body.encText

  return body
}
