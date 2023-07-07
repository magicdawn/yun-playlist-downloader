import { DownloadSongOptions } from '$index'
import { dl } from 'dl-vampire'
import { Instance, Static, Text, render } from 'ink'
import Spinner from 'ink-spinner'
import { once } from 'lodash-es'
import logSymbols from 'log-symbols'
import { useEffect, useState } from 'react'
import { proxy, useSnapshot } from 'valtio'

type CompletedItem = DownloadSongOptions & { index: number; success: boolean; skip?: boolean }
type RunningItem = DownloadSongOptions & {
  index: number
  progress: number
  retry?: number
  started: number
}
const inkState = proxy<{ completed: CompletedItem[]; running: RunningItem[] }>({
  completed: [],
  running: [],
})

export async function downloadSongWithInk(options: DownloadSongOptions) {
  renderApp()

  const { url, file, song, totalLength, retryTimeout, retryTimes, skipExists } = options
  const index = song.rawIndex

  inkState.running.push({ ...options, index, progress: 0, started: Date.now() })

  function updateRunningItem(payload: Partial<RunningItem>) {
    const runningItem = inkState.running.find((x) => x.index === index)
    if (!runningItem) return
    Object.assign(runningItem, payload)
  }

  // 类似 Promise, 状态转换只能发生一次
  const moveToComplete = once((payload: Pick<CompletedItem, 'success' | 'skip'>) => {
    // running
    const idx = inkState.running.findIndex((x) => x.index === index)
    if (idx !== -1) inkState.running.splice(idx, 1)
    // completed
    inkState.completed.push({ ...options, index, ...payload })
  })

  // 成功, 可能会调用多次, 不知为何
  const success = once(() => {
    moveToComplete({ success: true, skip })
  })

  // 失败
  const fail = once(() => {
    moveToComplete({ success: false })
  })

  // 下载中
  const downloading = (percent: number) => {
    updateRunningItem({ progress: percent })
  }

  // 重试
  const retry = (i: number) => {
    updateRunningItem({
      retry: i,
      progress: 0,
      started: Date.now(),
    })
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

let inkInstance: Instance | undefined
const renderApp = once(() => {
  inkInstance = render(<App />)
})
const stopApp = () => {
  inkInstance?.unmount()
  inkInstance = undefined
}

function useNow(updateInterval = 100) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now())
    }, updateInterval)
    return () => {
      clearInterval(id)
    }
  }, [updateInterval])
  return now
}

function App() {
  const { completed, running } = useSnapshot(inkState)
  const now = useNow()

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
            {/* 目的: spinner delay */}
            {now - item.started < 100 ? (
              logSymbols.info
            ) : (
              <Text color='green'>
                <Spinner type='dots' />
              </Text>
            )}{' '}
            {item.song.index}/{item.totalLength} 下载中
            {'   '}
            <ProgressBar progress={item.progress} />{' '}
            {`(${Math.round(item.progress * 100)}%)`.padStart(5, ' ')}{' '}
            {item.retry ? `第${item.retry}次重试中 ` : null}
            {item.file}
          </Text>
        )
      })}
    </>
  )
}

function ProgressBar({ progress }: { progress: number }) {
  if (progress < 0) progress = 0
  if (progress > 1) progress = 1

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
