import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { checkWoWExists, getWTFPath } from './path'
import { Flavor } from '~/core/wtf'
import { readFile, writeFile } from 'node:fs/promises'

const FILENAME_CONFIG = 'Config.wtf'

export const getWTFConfigs = async (flavor: Flavor | string) => {
  if (!checkWoWExists()) {
    return {}
  }

  const dir = getWTFPath(flavor)
  const configFilePath = resolve(dir, FILENAME_CONFIG)
  if (!existsSync(configFilePath)) {
    return {}
  }

  const config = await readFile(configFilePath, 'utf8')
  const lines = config.split(/\r?\n/).filter(s => s)
  const result: Record<string, any> = {}
  lines.forEach(line => {
    const [_, key, value] = line.split(' ')
    try {
      result[key] = JSON.parse(value)
    } catch {
      result[key] = value
    }
  })
  return result
}

export const getWTFConfig = async (flavor: Flavor | string, key: string) => {
  return (await getWTFConfigs(flavor))[key]
}

export const setWTFConfig = async (flavor: Flavor | string, key: string, value?: any) => {
  if (!checkWoWExists()) {
    return
  }

  const dir = getWTFPath(flavor)
  const configFilePath = resolve(dir, FILENAME_CONFIG)
  if (!existsSync(configFilePath)) {
    return
  }

  const config = await readFile(configFilePath, 'utf8')
  const lines = config.split(/\r?\n/).filter(s => s)
  const i = lines.findIndex(line => line.startsWith(`SET ${key}`))
  if (i > -1) {
    lines.splice(i, 1)
  }
  if (value !== undefined) {
    lines.push(`SET ${key} "${value}"`)
  }
  return writeFile(configFilePath, lines.join('\n'))
}
