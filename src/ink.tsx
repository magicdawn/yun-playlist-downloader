import delay from 'delay'
import { Newline, Static, Text, render } from 'ink'
import pmap from 'promise.map'
import { proxy, useSnapshot } from 'valtio'

export const state = proxy({
  completed: [] as any[],
  runing: [] as {
    value: number
    label: string
  }[],
})

function App() {
  const { completed, runing } = useSnapshot(state)

  return (
    <>
      <Static items={completed}>
        {(item, index) => {
          return <Text key={item}>{item}</Text>
        }}
      </Static>

      <Text>
        ------------- <Newline />
      </Text>

      {runing.map(({ value, label }) => {
        return <Text key={value}>({value + ' ' + label})</Text>
      })}
    </>
  )
}

void (async () => {
  render(<App />)

  const arr = new Array(100).fill(0).map((_, index) => index)
  await pmap(
    arr,
    async (i) => {
      const _item = { id: i, value: i, label: `runing` }
      state.runing.push(_item)
      const item = state.runing.at(-1)!

      await delay(Math.floor(3 * 1000 * Math.random()))
      item.label = `changing`
      await delay(Math.floor(3 * 1000 * Math.random()))

      const index = state.runing.findIndex((x) => x.value === i)
      state.runing.splice(index, 1)
      state.completed.push(`completed: ${i}`)
    },
    5
  )
})()
