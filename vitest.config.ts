import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {},
  // plugins: [tsconfigPaths()],
  test: {
    globals: true,
    testTimeout: 60000,
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
})
