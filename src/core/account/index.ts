import { readFile, writeFile, rm } from 'node:fs/promises'
import { useStore } from '~/store'
import { join, resolve } from 'node:path'
import { existsSync } from 'node:fs'

export interface BattleNetSaved {
  remark: string | undefined

  SavedAccountNames: string
  LastLoginRegion: string | undefined
  LastLoginAddress: string | undefined
  LastLoginTassadar: string | undefined
}

export const BATTLE_NET_APP_NAME = 'Battle.net'

const getBattleNetConfigPath = () => {
  const store = useStore()
  return resolve(store.appInfo.paths.appData, BATTLE_NET_APP_NAME, 'Battle.net.config')
}

export const loadBattleNetConfig = async () => {
  const path = getBattleNetConfigPath()
  if (!existsSync(path)) {
    throw new Error('Battle.net config file not found')
  }
  const data = await readFile(path, 'utf8')
  return JSON.parse(data)
}

export const clearBattleNetSavedAccount = async () => {
  const config = await loadBattleNetConfig()
  config.Client.SavedAccountNames = ''
  return writeFile(getBattleNetConfigPath(), JSON.stringify(config, null, 4))
}

export const loadBattleNetSaved = async () => {
  const config = await loadBattleNetConfig()
  const SavedAccountNames = config.Client.SavedAccountNames || ''
  const LastLoginRegion = findObjectValue(config, 'LastLoginRegion')
  const LastLoginAddress = findObjectValue(config, 'LastLoginAddress')
  const LastLoginTassadar = findObjectValue(config, 'LastLoginTassadar')
  return {
    SavedAccountNames,
    LastLoginRegion,
    LastLoginAddress,
    LastLoginTassadar
  } as BattleNetSaved
}

export const writeBattleNetSaved = async (saved: BattleNetSaved) => {
  let config = await loadBattleNetConfig()
  if (config.Client) {
    config.Client.SavedAccountNames = saved.SavedAccountNames || ''
  }
  config = updateObjectValue(config, 'LastLoginRegion', saved.LastLoginRegion || '')
  config = updateObjectValue(config, 'LastLoginAddress', saved.LastLoginAddress || '')
  config = updateObjectValue(config, 'LastLoginTassadar', saved.LastLoginTassadar || '')
  return writeFile(getBattleNetConfigPath(), JSON.stringify(config, null, 4))
}

function findObjectValue(obj: any, key: string): string | undefined {
  if (obj && typeof obj === 'object') {
    if (key in obj) {
      return obj[key]
    }

    for (const _key in obj) {
      if (obj.hasOwnProperty(_key)) {
        const result = findObjectValue(obj[_key], key)
        if (result) {
          return result
        }
      }
    }
  }
}

function updateObjectValue(obj: any, key: string, newValue: any) {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  const result: Record<string, any> = {}
  for (const _key in obj) {
    if (obj.hasOwnProperty(_key)) {
      if (_key === key) {
        result[key] = newValue
      } else {
        result[_key] = updateObjectValue(obj[_key], key, newValue)
      }
    }
  }

  return result
}

const ANONYMIZED_TEXT = '****'

export function secureString(input: string): string {
  if (input.includes('@')) {
    const [local, domain] = input.split('@')
    const anonymizedLocal = local[0] + ANONYMIZED_TEXT + local[local.length - 1]
    return anonymizedLocal + '@' + domain
  }

  if (/^\d+$/.test(input)) {
    return input[0] + ANONYMIZED_TEXT + input[input.length - 1]
  }

  if (/[a-zA-Z]/.test(input)) {
    const firstChar = input[0]
    const lastChar = input[input.length - 1]
    return firstChar + ANONYMIZED_TEXT + lastChar
  }

  return input
}

export const deleteBattleNetLoginBrowserCache = async () => {
  const store = useStore()
  const path = resolve(store.appInfo.paths.appData, BATTLE_NET_APP_NAME, 'BrowserCaches')

  let fp = join(path, 'common')
  if (existsSync(fp)) {
    await rm(fp, { recursive: true })
  }

  fp = join(path, 'LocalPrefs.json')
  if (existsSync(fp)) {
    await rm(fp)
  }
}
