import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'
import { parseLua } from '~/utils/lua'

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
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      transformed[key] = transformNDuiObject(obj[key])
    } else if (Array.isArray(obj[key])) {
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
  return 0
}
