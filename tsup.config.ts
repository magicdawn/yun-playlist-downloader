import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  return {
    entry: ['src/bin.ts', 'src/index.ts'],
    format: 'esm',
    target: 'node16',
    clean: true,
    esbuildOptions(options, context) {
      options.charset = 'utf8'
    },
  }
})
