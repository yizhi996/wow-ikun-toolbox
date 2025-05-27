import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'
import { parseLua } from '~/utils/lua'
import { isArray } from '~/utils'

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

const WOW_CLASSES_NAME_CHINESE_INDEX: Record<string, number> = {
  '': 0,
  战士: 1,
  圣骑士: 2,
  猎人: 3,
  潜行者: 4,
  牧师: 5,
  死亡骑士: 6,
  萨满祭司: 7,
  法师: 8,
  术士: 9,
  武僧: 10,
  德鲁伊: 11,
  恶魔猎手: 12,
  唤魔师: 13
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

export const classNameToIndex = (className: string) => {
  return WOW_CLASSES_NAME_INDEX[className] || 0
}

export const classColorFromIndex = (index: number) => {
  return WOW_CLASSES_COLORS[index] || WOW_CLASSES_COLORS[0]
}

export const classChineseNameToIndex = (className: string) => {
  return WOW_CLASSES_NAME_CHINESE_INDEX[className] || 0
}

export const getClassCharacterMapFromElvUI = async (dir: string) => {
  let classesMap: Record<string, Record<string, string>> | undefined = undefined
  const luaPath = resolve(dir, 'ElvUI.lua')
  if (existsSync(luaPath)) {
    const luaString = await readFile(luaPath, { encoding: 'utf-8' })
    const luaObj = parseLua(luaString)
    if (luaObj['ElvDB'] && luaObj['ElvDB']['class']) {
      classesMap = luaObj['ElvDB']['class']
    }
  }
  return classesMap
}

export const getClassCharacterMapFromNDui = async (dir: string) => {
  let classesMap: Record<string, Record<string, string>> | undefined = undefined
  const luaPath = resolve(dir, 'NDui.lua')
  if (existsSync(luaPath)) {
    const luaString = await readFile(luaPath, { encoding: 'utf-8' })
    const luaObj = parseLua(luaString)
    if (luaObj['NDuiADB'] && luaObj['NDuiADB']['totalGold']) {
      classesMap = transformNDuiObject(luaObj['NDuiADB']['totalGold'])
    }
  }
  return classesMap
}

const transformNDuiObject = (obj: any): any => {
  const transformed: any = {}
  for (const key in obj) {
    if (typeof obj[key] === 'object' && !isArray(obj[key])) {
      transformed[key] = transformNDuiObject(obj[key])
    } else if (isArray(obj[key])) {
      transformed[key] = obj[key][obj[key].length - 1]
    } else {
      transformed[key] = obj[key]
    }
  }
  return transformed
}

export const getClassIndexFromYishier = async (dir: string) => {
  const lua = resolve(dir, 'Yishier.lua')
  if (existsSync(lua)) {
    const content = await readFile(lua, { encoding: 'utf-8' })
    const match = content.match(/YishierCharacterDB = (\d+)/)
    if (match) {
      return parseInt(match[1])
    }
  }
  return -1
}
