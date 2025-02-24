import { defineStore } from 'pinia'
import { ref, reactive, watch, computed } from 'vue'
import { useAppStorage } from '~/composables/useAppStorage'
import { existsSync } from 'node:fs'
import { ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { resolve, dirname, join } from 'node:path'
import { Flavor } from '~/core/wtf'
import { BattleNetSaved } from '~/core/account'

export const useStore = defineStore('main', () => {
  const router = useRouter()

  const appInfo = reactive({
    paths: {
      appData: '',
      userData: ''
    },
    version: ''
  })

  const wowRootDir = useAppStorage('wowRootDir', '')
  const battleNetDir = useAppStorage('battleNetDir', '')

  const selectedSourceFlavor = useAppStorage('selectedSourceFlavor', '')
  const selectedTargetFlavor = useAppStorage('selectedTargetFlavor', '')
  const onlyShowLoggedCharacters = useAppStorage('onlyShowLoggedCharacters', false)
  const overwriteWTFConfig = useAppStorage('overwriteWTFConfig', {
    accountAddon: true,
    accountSystem: true,
    playerAddon: true,
    playerSystem: true,
    chat: true
  })

  const savedAccounts = useAppStorage<BattleNetSaved[]>('savedAccounts', [])

  const WTF_PATH = (flavor: Flavor | string) => {
    return resolve(wowRootDir.value, flavor, 'WTF')
  }

  const ACCOUNT_PATH = (flavor: Flavor | string) => {
    return resolve(WTF_PATH(flavor), 'Account')
  }

  const checkWoWExists = () => {
    if (!wowRootDir.value) {
      return false
    }
    return existsSync(wowRootDir.value)
  }

  const checkBattleNetExists = () => {
    if (!battleNetDir.value) {
      return false
    }
    return existsSync(battleNetDir.value)
  }

  const showWowDirSetAlert = () => {
    ElMessageBox.alert('请设置魔兽世界所在目录', '设置', {
      confirmButtonText: '前往',
      callback: (action: string) => {
        if (action === 'confirm') {
          router.push('/settings')
        }
      }
    })
  }

  return {
    appInfo,
    wowRootDir,
    battleNetDir,
    selectedSourceFlavor,
    selectedTargetFlavor,
    onlyShowLoggedCharacters,
    overwriteWTFConfig,
    savedAccounts,
    WTF_PATH,
    ACCOUNT_PATH,
    checkWoWExists,
    checkBattleNetExists,
    showWowDirSetAlert
  }
})
