import { resolve, dirname } from 'node:path'
import { existsSync } from 'node:fs'
import { mkdir, stat } from 'node:fs/promises'
import { readFile, writeFile } from 'node:fs/promises'
import { useStore } from '~/store'
import { fs_readdir } from '~/utils/fs'

export interface WTF {
  account: string
  realm: string
  name: string
  flavor: Flavor | string
}

export const enum Flavor {
  RETAIL = '_retail_',
  CLASSIC = '_classic_',
  XPTR = '_xptr_',
  CLASSIC_ERA = '_classic_era_'
}

const FLAVOR_NAMES = {
  [Flavor.RETAIL]: '正式服',
  [Flavor.CLASSIC]: '怀旧服',
  [Flavor.XPTR]: '测试服',
  [Flavor.CLASSIC_ERA]: '经典旧世'
}

const FILENAME_SAVED_VARIABLES = 'SavedVariables'

export const loadFlavors = async (root?: string) => {
  const store = useStore()
  const rootDir = root || store.wowRootDir
  const dirs = await fs_readdir(rootDir)
  const result: Flavor[] = []
  for await (const dir of dirs) {
    const s = await stat(resolve(rootDir, dir))
    if (s.isDirectory() && dir.startsWith('_') && dir.endsWith('_')) {
      result.push(dir as Flavor)
    }
  }
  result.sort((a, b) => {
    if (a === Flavor.RETAIL) {
      return -1
    }
    if (b === Flavor.RETAIL) {
      return 1
    }
    return 0
  })
  return result
}

export const flavorToSelector = (flavor: Flavor) => {
  let label = '未知'
  if (FLAVOR_NAMES[flavor]) {
    label = FLAVOR_NAMES[flavor]
  }
  return { label, value: flavor }
}

export const loadWTFCharacters = async (flavor: Flavor | string) => {
  const store = useStore()
  if (!store.checkWoWExists()) {
    return []
  }

  const root = store.ACCOUNT_PATH(flavor)

  if (!existsSync(root)) {
    return []
  }

  const accounts = (await fs_readdir(root)).filter(account => /^[a-zA-Z0-9#]+$/.test(account))
  const result: WTF[] = []

  for await (const account of accounts) {
    const dir = resolve(root, account)
    const s = await stat(dir)
    if (s.isDirectory()) {
      const realms = await fs_readdir(dir)
      for await (const realm of realms) {
        const absolute = resolve(dir, realm)
        const s = await stat(absolute)
        if (s.isDirectory() && realm !== FILENAME_SAVED_VARIABLES) {
          const names = await fs_readdir(absolute)
          for await (const name of names) {
            const s = await stat(resolve(dir, realm, name))
            if (s.isDirectory() && name !== FILENAME_SAVED_VARIABLES) {
              result.push({ account, name, realm, flavor })
            }
          }
        }
      }
    }
  }
  return result
}

const OVERWRITE_ENABLE_FILES = [
  'config-cache.wtf',
  'AddOns.txt',
  'chat-cache.txt',
  'layout-local.txt'
]

export const overwriteCharacterConfig = async (socure: WTF, target: WTF) => {
  const store = useStore()
  const sourceAccountPath = resolve(store.ACCOUNT_PATH(socure.flavor), socure.account)
  const targetAccountPath = resolve(store.ACCOUNT_PATH(target.flavor), target.account)

  const files: { source: string; target: string }[] = []

  if (sourceAccountPath !== targetAccountPath) {
    const sourceAccountFiles = await fs_readdir(sourceAccountPath)
    for await (const file of sourceAccountFiles) {
      const fp = resolve(sourceAccountPath, file)
      const targetFilepath = fp.replace(sourceAccountPath, targetAccountPath)
      const s = await stat(fp)
      if (s.isDirectory()) {
        if (file === FILENAME_SAVED_VARIABLES) {
          const sourceSavedVariables = await fs_readdir(
            resolve(sourceAccountPath, FILENAME_SAVED_VARIABLES)
          )
          sourceSavedVariables.forEach(file => {
            files.push({
              source: resolve(fp, file),
              target: resolve(targetFilepath, file)
            })
          })
        }
      } else if (OVERWRITE_ENABLE_FILES.includes(file)) {
        files.push({
          source: fp,
          target: targetFilepath
        })
      }
    }
  }

  const sourceCharacterPath = resolve(sourceAccountPath, socure.realm, socure.name)
  const targetCharacterPath = resolve(targetAccountPath, target.realm, target.name)

  const sourceCharacterFiles = await fs_readdir(sourceCharacterPath)
  for await (const file of sourceCharacterFiles) {
    const fp = resolve(sourceCharacterPath, file)
    const targetFilepath = fp.replace(sourceCharacterPath, targetCharacterPath)
    const s = await stat(fp)
    if (s.isDirectory()) {
      if (file === FILENAME_SAVED_VARIABLES) {
        const sourceSavedVariables = await fs_readdir(
          resolve(sourceCharacterPath, FILENAME_SAVED_VARIABLES)
        )
        sourceSavedVariables.forEach(file => {
          files.push({
            source: resolve(fp, file),
            target: resolve(targetFilepath, file)
          })
        })
      }
    } else if (OVERWRITE_ENABLE_FILES.includes(file)) {
      files.push({
        source: fp,
        target: targetFilepath
      })
    }
  }

  for await (const f of files) {
    if (existsSync(f.source)) {
      const directoryName = dirname(f.target)
      if (!existsSync(directoryName)) {
        await mkdir(directoryName, { recursive: true })
      }

      const s = await stat(f.source)
      if (!s.isDirectory()) {
        let content = await readFile(f.source, { encoding: 'utf-8' })
        content = content.replaceAll(socure.name, target.name)
        content = content.replaceAll(socure.realm, target.realm)
        await writeFile(f.target, content, { encoding: 'utf-8' })
      }
    }
  }
}
