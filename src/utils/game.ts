import { resolve, dirname } from 'node:path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { useStore } from '~/store'

export function getWTFConfig(key: string) {
  const store = useStore()
  if (!store.checkWoWExists()) {
    return
  }

  const dir = store.WTF_PATH
  if (!existsSync(dir)) {
    mkdirSync(dir)
  }

  const configFilePath = resolve(dir, 'Config.wtf')
  let config = ''
  if (existsSync(configFilePath)) {
    config = readFileSync(configFilePath, 'utf8')
  }

  const lines = config.split(/\r?\n/)
  const find = `SET ${key}`
  const i = lines.findIndex(line => line.startsWith(find))
  if (i > -1) {
    return JSON.parse(lines[i].replace(find, ''))
  }
}

export function setWTFConfig(key: string, value?: any) {
  const store = useStore()
  if (!store.checkWoWExists()) {
    return
  }

  const dir = store.WTF_PATH
  if (!existsSync(dir)) {
    mkdirSync(dir)
  }

  const configFilePath = resolve(dir, 'Config.wtf')
  let config = ''
  if (existsSync(configFilePath)) {
    config = readFileSync(configFilePath, 'utf8')
  }

  const lines = config.split(/\r?\n/).filter(s => s)
  const i = lines.findIndex(line => line.startsWith(`SET ${key}`))
  if (i > -1) {
    lines.splice(i, 1)
  }
  if (value !== undefined) {
    lines.push(`SET ${key} "${value}"`)
  }
  writeFileSync(configFilePath, lines.join('\n'))
}


export function getRealmAddress() {
  const store = useStore()
  if (!store.checkWoWExists()) {
    return
  }

  const root = dirname(store.wowRootDir)
  if (!existsSync(root)) {
    return
  }

  const filePath = resolve(root, 'realmlist.wtf')
  if (!existsSync(filePath)) {
    return
  }

  let config = readFileSync(filePath, 'utf8')
  const lines = config.split(/\r?\n/)
  const find = 'SET realmlist'
  const i = lines.findIndex(line => line.toLowerCase().startsWith(find.toLowerCase()))
  if (i > -1) {
    return lines[i].replace(find, '').replace(find.toLowerCase(), '').trimStart()
  }
}

export function setRealmAddress(address: string) {
  const store = useStore()
  if (!store.checkWoWExists()) {
    return
  }

  const root = dirname(store.wowRootDir)
  if (!existsSync(root)) {
    return
  }

  let config = ''
  const filePath = resolve(root, 'realmlist.wtf')
  if (existsSync(filePath)) {
    config = readFileSync(filePath, 'utf8')
  }

  const lines = config.split(/\r?\n/).filter(s => s)

  let i = 0
  while (i > -1) {
    i = lines.findIndex(line => line.toLowerCase().startsWith('SET realmlist'.toLowerCase()))
    if (i > -1) {
      lines.splice(i, 1)
    }
  }
  lines.push(`SET realmlist ${address}`)

  i = 0
  while (i > -1) {
    i = lines.findIndex(line => line.toLowerCase().startsWith('SET patchlist'.toLowerCase()))
    if (i > -1) {
      lines.splice(i, 1)
    }
  }
  lines.push(`SET patchlist ${address}`)

  writeFileSync(filePath, lines.join('\n'))
}
