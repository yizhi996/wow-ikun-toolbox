import { exec } from 'node:child_process'
import { existsSync, PathLike } from 'node:fs'
import { readdir, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { showWarningMessage } from './message'
import { isMacOS } from '.'

export const fs_readdir = (path: PathLike) => {
  if (isMacOS()) {
    return (async () => {
      const files = await readdir(path)
      return files.filter(path => path !== '.DS_Store')
    })()
  }
  return readdir(path)
}

export function openFolderInExplorer(fullPath: string) {
  if (!existsSync(fullPath)) {
    showWarningMessage('文件夹不存在')
    return
  }
  let command = ''
  switch (process.platform) {
    case 'darwin':
      command = 'open ' + fullPath
      break
    case 'win32':
      if (process.env.SystemRoot) {
        command = join(process.env.SystemRoot, 'explorer.exe')
      } else {
        command = 'explorer.exe'
      }
      command += ' ' + fullPath
      break
    default:
      fullPath = dirname(fullPath)
      command = 'xdg-open ' + fullPath
  }
  exec(command)
}

export async function dirDfs(
  dir: string,
  cb: (path: string, filename: string) => void,
  options?: { exclude: string[] }
) {
  const files = (await readdir(dir)).filter(path => path !== '.DS_Store')
  for await (const file of files) {
    const path = resolve(dir, file)
    const s = await stat(path)
    if (!s.isDirectory()) {
      if (options && !options.exclude.includes(file)) {
        await cb(path, file)
      } else {
        await cb(path, file)
      }
    } else {
      await dirDfs(path, cb, options)
    }
  }
}
