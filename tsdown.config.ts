import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/cli.ts', 'src/index.ts'],
  format: 'esm',
  target: 'node20',
  clean: true,
  shims: true,
  dts: false,
  fixedExtension: false,
  deps: {
    // https://github.com/rolldown/tsdown/issues/907
    onlyBundle: ['tsdown'],
  },
})
