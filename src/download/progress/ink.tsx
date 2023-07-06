import { DownloadSongOptions } from '$index'
import { dl } from 'dl-vampire'
import { Static, Text, render } from 'ink'
import { once } from 'lodash-es'
import logSymbols from 'log-symbols'
import { proxy, useSnapshot } from 'valtio'

const inkState = proxy<{
  completed: (DownloadSongOptions & { index: number; success: boolean; skip?: boolean })[]
  running: (DownloadSongOptions & { index: number; progress: number; retry?: number })[]
}>({
  completed: [],
  running: [],
})

export async function downloadSongWithInk(options: DownloadSongOptions) {
  renderApp()

  const { url, file, song, totalLength, retryTimeout, retryTimes, skipExists } = options
  const index = song.rawIndex

  inkState.running.push({ ...options, index, progress: 0 })

  // 成功
  // 可能会调用多次, 不知为何
  const success = once(() => {
    // running
    const idx = inkState.running.findIndex((x) => x.index === index)
    if (idx !== -1) inkState.running.splice(idx, 1)
    // completed
    inkState.completed.push({ ...options, index, success: true, skip })
  })

  // 失败
  const fail = once(() => {
    // running
    const idx = inkState.running.findIndex((x) => x.index === index)
    if (idx !== -1) inkState.running.splice(idx, 1)
    // completed
    inkState.completed.push({ ...options, index, success: false })
  })

  // 下载中
  const downloading = (percent: number) => {
    const runningItem = inkState.running.find((x) => x.index === index)
    if (!runningItem) return
    runningItem.progress = percent
  }

  // 重试
  const retry = (i: number) => {
    const runningItem = inkState.running.find((x) => x.index === index)
    if (!runningItem) return
    runningItem.retry ||= 0
    runningItem.retry++
    runningItem.progress = 0
  }

  let skip = false
  try {
    ;({ skip } = await dl({
      url,
      file,
      skipExists,
      onprogress(p) {
        const { percent } = p
        if (percent === 1) {
          success()
        } else {
          downloading(percent)
        }
      },
      retry: {
        timeout: retryTimeout,
        times: retryTimes,
        onerror: function (e, i) {
          retry(i)
        },
      },
    }))
  } catch (e) {
    fail()
    return
  }

  success()
}

const renderApp = once(() => {
  render(<App />)
})

function App() {
  const { completed, running } = useSnapshot(inkState)

  return (
    <>
      <Static items={completed}>
        {(item) => {
          return (
            <Text key={item.index}>
              {item.success ? logSymbols.success : logSymbols.error} {item.song.index}/
              {item.totalLength} {item.success ? (item.skip ? '下载跳过' : '下载成功') : '下载失败'}{' '}
              {item.file}
            </Text>
          )
        }}
      </Static>

      {running.map((item) => {
        return (
          <Text key={item.index}>
            {logSymbols.info} {item.song.index}/{item.totalLength} 下载中
            {'   '}
            <ProgressBar progress={item.progress || 0} />
            {'   '}
            {item.retry ? '重试中 ' : null}
            {item.file}
          </Text>
        )
      })}
    </>
  )
}

function ProgressBar({ progress }: { progress: number }) {
  const width = 10

  const filledChar = '='
  const filledLen = Math.round(width * progress)

  const restChar = ' '
  const restLen = width - filledLen

  return (
    <Text>
      [
      <Text color={'green'}>
        {filledChar.repeat(filledLen)}
        {restChar.repeat(restLen)}
      </Text>
      ]
    </Text>
  )
}
