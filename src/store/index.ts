import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { useAppStorage } from '~/composables/useAppStorage'
import { BattleNetSaved } from '~/core/account'

export const useStore = defineStore('main', () => {
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
  const selectedSynchronizeFlavor = useAppStorage('selectSynchronizeFlavor', '')

  const savedAccounts = useAppStorage<BattleNetSaved[]>('savedAccounts', [])
  const secureAccount = useAppStorage('secureAccount', false)

  return {
    appInfo,
    wowRootDir,
    battleNetDir,
    selectedSourceFlavor,
    selectedTargetFlavor,
    onlyShowLoggedCharacters,
    overwriteWTFConfig,
    selectedSynchronizeFlavor,
    savedAccounts,
    secureAccount
  }
})
