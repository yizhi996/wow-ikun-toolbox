import { Flavor } from '~/core/wtf'
import { useStore } from '~/store'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

export const getWTFPath = (flavor: Flavor | string) => {
  const store = useStore()
  return join(store.wowRootDir, flavor, 'WTF')
}

export const getAccountPath = (flavor: Flavor | string) => {
  return join(getWTFPath(flavor), 'Account')
}

export const checkWoWExists = () => {
  const store = useStore()
  if (!store.wowRootDir) {
    return false
  }
  return existsSync(store.wowRootDir)
}

export const checkBattleNetExists = () => {
  const store = useStore()
  if (!store.battleNetDir) {
    return false
  }
  return existsSync(store.battleNetDir)
}
