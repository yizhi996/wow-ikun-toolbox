<template>
  <div class="flex h-full select-none">
    <div class="w-full flex flex-col items-center bg-brown-900">
      <div class="w-full"></div>
      <div class="w-full h-full flex items-center justify-center bg-brown-950">
        <div class="w-full h-full px-5">
          <AppButton size="large" type="success" @click="onOpenBattleNet">登录新账号</AppButton>
          <AppButton size="large" type="primary" @click="onShowSaveAccountDialog"
            >保持当前账号</AppButton
          >

          <div class="mt-5 grid grid-cols-3 gap-2 overflow-y-auto max-h-[calc(100%-56px)]">
            <div
              v-for="saved of store.savedAccounts"
              :key="saved.SavedAccountNames"
              class="border rounded-sm w-64 p-3"
            >
              <div class="text-gray-400 text-sm">{{ saved.SavedAccountNames }}</div>
              <div class="font-semibold">{{ saved.remark }}</div>
              <AppButton type="success" size="small" @click="onLogin(saved)">登录</AppButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ElDialog v-model="saveAccountDialogVisible" title="保存账号" width="500" align-center>
    <ElForm label-width="auto" :model="saveAccountDialogForm">
      <ElFormItem label="账号">
        <ElInput v-model="saveAccountDialogForm.account" disabled />
      </ElFormItem>
      <ElFormItem label="备注">
        <ElInput v-model="saveAccountDialogForm.remark" autocomplete="off" placeholder="可选" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div>
        <AppButton @click="saveAccountDialogVisible = false">取消</AppButton>
        <AppButton type="primary" @click="onSaveAccount">保存</AppButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { checkProcessIsRunning, quitProcess } from '~/utils/process'
import { useStore } from '~/store'
import { shell } from 'electron'
import {
  BATTLE_NET_APP_NAME,
  BattleNetSaved,
  clearBattleNetSavedAccount,
  loadBattleNetSaved,
  writeBattleNetSaved
} from '~/core/account'
import { showWarningMessage } from '~/utils/message'
import { ElDialog, ElForm, ElFormItem, ElInput, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import AppButton from '~/components/AppButton.vue'

const store = useStore()

const saveAccountDialogVisible = ref(false)

const saveAccountDialogForm = reactive({
  account: '',
  remark: ''
})

let tempSaved: BattleNetSaved | undefined

const onShowSaveAccountDialog = async () => {
  const saved = await loadBattleNetSaved()
  if (!saved.SavedAccountNames) {
    showWarningMessage('请先登录一个账号')
    return
  }
  tempSaved = saved
  saveAccountDialogForm.account = saved.SavedAccountNames
  const exists = store.savedAccounts.find(
    saved => saved.SavedAccountNames === tempSaved!.SavedAccountNames
  )
  saveAccountDialogForm.remark = exists ? exists.remark || '' : ''
  saveAccountDialogVisible.value = true
}

const onSaveAccount = async () => {
  saveAccountDialogVisible.value = false

  const i = store.savedAccounts.findIndex(
    saved => saved.SavedAccountNames === tempSaved!.SavedAccountNames
  )
  if (i !== -1) {
    store.savedAccounts.splice(i, 1)
  }

  store.savedAccounts.unshift({
    SavedAccountNames: tempSaved!.SavedAccountNames,
    LastLoginAddress: tempSaved!.LastLoginAddress,
    LastLoginRegion: tempSaved!.LastLoginRegion,
    LastLoginTassadar: tempSaved!.LastLoginTassadar,
    remark: saveAccountDialogForm.remark
  })
}

const executeWhenBattleNetNotRunning = async (fn: () => Promise<void>) => {
  const isRunning = await checkProcessIsRunning(BATTLE_NET_APP_NAME)
  if (isRunning) {
    await quitProcess(BATTLE_NET_APP_NAME)

    const timer = setTimeout(() => {
      pause()
      showWarningMessage('无法退出战网，请手动退出')
    }, 50000)

    const { pause } = useIntervalFn(async () => {
      const isRunning = await checkProcessIsRunning(BATTLE_NET_APP_NAME)
      if (!isRunning) {
        clearTimeout(timer)
        pause()
        await fn()
      }
    }, 200)
  } else {
    await fn()
  }
}

const onOpenBattleNet = async () => {
  executeWhenBattleNetNotRunning(async () => {
    await clearBattleNetSavedAccount()
    await shell.openPath(store.battleNetDir)
  })
}

const onLogin = async (saved: BattleNetSaved) => {
  executeWhenBattleNetNotRunning(async () => {
    await writeBattleNetSaved(saved)
    await shell.openPath(store.battleNetDir)
  })
}
</script>
