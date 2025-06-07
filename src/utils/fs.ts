import { PathLike } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { isMacOS } from '~shared'

export const fs_readdir = (path: PathLike) => {
  if (isMacOS()) {
    return (async () => {
      const files = await readdir(path)
      return files.filter(path => path !== '.DS_Store')
    })()
  }
  return readdir(path)
}
