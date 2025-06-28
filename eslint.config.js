import { fromSxzz, GLOB_TS, GLOB_TSX } from '@magicdawn/eslint-config'
export default fromSxzz(undefined, [
  {
    files: [GLOB_TS, GLOB_TSX],
    rules: {
      '@typescript-eslint/consistent-type-assertions': 'off',
    },
  },
])
