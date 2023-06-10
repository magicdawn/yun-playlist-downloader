#!/usr/bin/env node

import fs from 'node:fs'
import { execSync } from 'node:child_process'

const dev = fs.existsSync(new URL('.dev', import.meta.url))
if (dev) {
  execSync(`pnpm tsx src/bin.ts`, {
    cwd: new URL('../', import.meta.url),
    stdio: 'inherit',
  })
} else {
  require('../lib/bin.js')
}
