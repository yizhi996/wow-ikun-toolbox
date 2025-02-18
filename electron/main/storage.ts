import { app, ipcMain } from 'electron'
import { join } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'

interface AppConfig {
  [x: string]: any

  bounds: { x: number; y: number; width: number; height: number }
}

export let config: AppConfig = {
  bounds: { x: 0, y: 0, width: 1024, height: 768 }
}

const configPath = join(app.getPath('userData'), 'config.json')

try {
  const json = readFileSync(configPath, 'utf8')
  config = JSON.parse(json)
} catch (e) {}

config.version = app.getVersion()

export function save() {
  writeFileSync(configPath, JSON.stringify(config))
}

ipcMain.handle('app-storage-get', (event, key) => {
  return config[key]
})

ipcMain.handle('app-storage-set', (event, key, value) => {
  config[key] = value
  save()
})

ipcMain.handle('app-storage-remove', (event, key) => {
  delete config[key]
  save()
})

ipcMain.handle('app-storage-clear', event => {
  config = { bounds: { x: 0, y: 0, width: 1024, height: 768 } }
  save()
})
