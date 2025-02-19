import { resolve, dirname } from 'node:path'
import { existsSync } from 'node:fs'
import { mkdir, stat } from 'node:fs/promises'
import { readFile, writeFile } from 'node:fs/promises'
import { useStore } from '~/store'
import { fs_readdir } from '~/utils/fs'
import {
  getClassCharacterMapFromElvUI,
  getClassCharacterMapFromNDui,
  getClassIndexFromYishier
} from './classes'

export interface WTF {
  account: string
  realm: string
  name: string
  flavor: Flavor | string
  classes: number
  classColor: string
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

// None = 0
// Warrior = 1
// Paladin = 2
// Hunter = 3
// Rogue = 4
// Priest = 5
// DeathKnight = 6
// Shaman = 7
// Mage = 8
// Warlock = 9
// Monk = 10
// Druid = 11
// Demon Hunter = 12
// Evoker = 13

const WOW_CLASSES_NAME_INDEX: Record<string, number> = {
  '': 0,
  WARRIOR: 1,
  PALADIN: 2,
  HUNTER: 3,
  ROGUE: 4,
  PRIEST: 5,
  DEATHKNIGHT: 6,
  SHAMAN: 7,
  MAGE: 8,
  WARLOCK: 9,
  MONK: 10,
  DRUID: 11,
  DEMONHUNTER: 12,
  EVOKER: 13
}

const WOW_CLASSES_COLORS = [
  'var(--el-table-text-color)',
  '#C69B6D',
  '#F48CBA',
  '#AAD372',
  '#FFF468',
  '#FFFFFF',
  '#C41E3A',
  '#0070DD',
  '#3FC7EB',
  '#8788EE',
  '#00FF98',
  '#FF7C0A',
  '#A330C9',
  '#33937F'
]

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
      let classesMap: Record<string, Record<string, string>> | undefined = undefined

      const realms = await fs_readdir(dir)
      for await (const realm of realms) {
        const absolute = resolve(dir, realm)
        const s = await stat(absolute)
        if (s.isDirectory() && realm !== FILENAME_SAVED_VARIABLES) {
          const names = await fs_readdir(absolute)
          for await (const name of names) {
            const s = await stat(resolve(dir, realm, name))
            if (s.isDirectory() && name !== FILENAME_SAVED_VARIABLES) {
              let classes = 0
              classes = await getClassIndexFromYishier(
                resolve(dir, realm, name, FILENAME_SAVED_VARIABLES)
              )

              if (!classes) {
                if (!classesMap) {
                  classesMap =
                    (await getClassCharacterMapFromElvUI(dir)) ||
                    (await getClassCharacterMapFromNDui(dir))
                  if (!classesMap) {
                    classesMap = {}
                  }
                }

                if (classesMap[realm] && classesMap[realm][name]) {
                  classes = WOW_CLASSES_NAME_INDEX[classesMap[realm][name]] || 0
                }
              }

              result.push({
                account,
                name,
                realm,
                flavor,
                classes,
                classColor: WOW_CLASSES_COLORS[classes]
              })
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
