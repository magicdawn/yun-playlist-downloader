#!ts-node

import type { PackageJson } from 'type-fest'
import fse from 'fs-extra'
import { merge } from 'lodash'

const pkgjsonFile = __dirname + '/../package.json'
const pkg = fse.readJsonSync(pkgjsonFile)

function patchPkg(extendInfo: Partial<PackageJson>) {
  const newPkg = merge(pkg, extendInfo)
  fse.writeJSONSync(pkgjsonFile, newPkg, { spaces: 2 })
}

// patch for publish
function patch() {
  patchPkg({
    bin: {
      yun: 'bin/yun',
    },
  })
  console.log('[patch-pkg]: patch bin to %s', 'bin/yun')
}

// recover for dev & source code
function recover() {
  patchPkg({
    bin: {
      yun: 'src/bin.ts',
    },
  })
  console.log('[patch-pkg]: recover bin to %s', 'src/bin.ts')
}

if (process.argv.includes('--patch')) {
  patch()
} else if (process.argv.includes('--recover')) {
  recover()
}
