import { dl } from 'dl-vampire'
import { once } from 'es-toolkit'
import { render, Static, Text, type Instance } from 'ink'
import Spinner from 'ink-spinner'
import logSymbols from 'log-symbols'
import { useEffect, useMemo, useState } from 'react'
import { proxy, useSnapshot } from 'valtio'
import type { DownloadSongOptions } from '$index'
import { removeFileNameFromTracker } from '../../index'

type CompletedItem = DownloadSongOptions & {
  index: number
  success: boolean
  skip?: boolean
}
type RunningItem = DownloadSongOptions & {
  index: number
  progress: number
  retry?: number
  started: number
}

const store = proxy<{ completed: CompletedItem[]; running: RunningItem[] }>({
  completed: [],
  running: [],
})

export async function downloadSongWithInk(options: DownloadSongOptions) {
  const { url, file, song, totalLength, retryTimeout, retryTimes, skipExists, skipTrial } = options
  const expectedSize =
    song.raw && song.raw.playUrlInfo && song.raw.playUrlInfo.size ? Number(song.raw.playUrlInfo.size) : null

  renderApp()
  const index = song.rawIndex
  store.running.push({ ...options, index, progress: 0, started: Date.now() })

  function updateRunningItem(payload: Partial<RunningItem>) {
    const runningItem = store.running.find((x) => x.index === index)
    if (!runningItem) return
    Object.assign(runningItem, payload)
  }

  // 类似 Promise, 状态转换只能发生一次
  const moveToComplete = once((payload: Pick<CompletedItem, 'success' | 'skip'>) => {
    // running
    const idx = store.running.findIndex((x) => x.index === index)
    if (idx !== -1) store.running.splice(idx, 1)
    // completed
    store.completed.push({ ...options, index, ...payload })
    // 判重数据移除
    removeFileNameFromTracker(file, expectedSize)
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

  if (song.isFreeTrial && skipTrial) {
    moveToComplete({ success: false, skip: true })
    return
  }

  let skip = false
  try {
    ;({ skip } = await dl({
      url,
      file,
      skipExists,
      onprogress({ percent }) {
        if (percent === 1) {
          success()
        } else {
          downloading(percent)
        }
      },
      retry: {
        timeout: retryTimeout,
        times: retryTimes,
        onerror(e, i) {
          retry(i)
        },
      },
    }))
  } catch {
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
  const { completed, running } = useSnapshot(store)
  const now = useNow()

  return (
    <>
      <Static items={completed}>{(item) => <CompletedItemDisplay key={item.url} item={item} />}</Static>
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
            <ProgressBar progress={item.progress} /> {`(${Math.round(item.progress * 100)}%)`.padStart(5, ' ')}{' '}
            {item.retry ? `第${item.retry}次重试中 ` : null}
            {item.file}
          </Text>
        )
      })}
    </>
  )
}

function CompletedItemDisplay({ item }: { item: CompletedItem }) {
  const symbol = useMemo(() => {
    if (item.song.isFreeTrial && item.skipTrial) return logSymbols.warning
    return item.success ? logSymbols.success : logSymbols.error
  }, [item])

  const statusText = useMemo(() => {
    if (item.song.isFreeTrial && item.skipTrial) return '跳过试听'
    return item.success ? (item.skip ? '下载跳过' : '下载成功') : '下载失败'
  }, [item])

  return (
    <Text key={item.url}>
      {symbol} {item.song.index}/{item.totalLength} {statusText} {item.file}
    </Text>
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
