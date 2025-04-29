<template>
  <div class="p-5 flex h-full">
    <div v-if="store.battleNetDir" class="w-full flex flex-col items-center">
      <div class="w-full h-full flex items-center justify-center">
        <div class="w-full h-full flex flex-col">
          <div class="flex items-center">
            <AppButton size="large" type="success" @click="onOpenBattleNet">登录新账号</AppButton>
            <AppButton size="large" type="primary" @click="onShowSaveAccountDialog"
              >保持当前账号</AppButton
            >
          </div>
          <ElInput
            v-model="search"
            class="mt-5"
            style="width: 256px"
            placeholder="搜索账号或备注"
            :suffix-icon="Search"
          ></ElInput>
          <ElCheckbox v-model="store.secureAccount" class="mt-5">匿名显示账号</ElCheckbox>

          <div
            class="grid gap-3 overflow-y-auto max-h-[calc(100%-156px)]"
            style="grid-template-columns: repeat(auto-fill, 280px)"
          >
            <div
              v-for="saved of filterSavedAccounts"
              :key="saved.SavedAccountNames"
              class="border rounded-sm p-3"
            >
              <div class="text-white/80 text-sm">
                {{
                  store.secureAccount
                    ? secureString(saved.SavedAccountNames)
                    : saved.SavedAccountNames
                }}
              </div>
              <div class="text-sm line-clamp-1">备注：<span class="text-rose-500">{{ saved.remark }}</span></div>
              <div class="flex justify-between mt-2">
                <div class="flex">
                  <AppButton type="success" size="small" @click="onLogin(saved)">登录</AppButton>
                  <AppButton plain :icon="Edit" size="small" @click="onEdit(saved)"></AppButton>
                </div>
                <AppButton plain :icon="Delete" size="small" @click="onDelete(saved)"></AppButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="w-full flex items-center justify-center h-full">
      <RouterLink to="/settings">
        <AppButton type="primary">设置战网路径</AppButton>
      </RouterLink>
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
  secureString,
  writeBattleNetSaved
} from '~/core/account'
import { showErrorMessage, showWarningMessage } from '~/utils/message'
import { ElDialog, ElForm, ElFormItem, ElInput, ElMessageBox } from 'element-plus'
import { computed, reactive, ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import AppButton from '~/components/AppButton.vue'
import { Delete, Edit, Search } from '@element-plus/icons-vue'
import { checkBattleNetExists } from '~/utils/path'

const store = useStore()

const saveAccountDialogVisible = ref(false)

const saveAccountDialogForm = reactive({
  account: '',
  remark: ''
})

const search = ref('')

let tempSaved: BattleNetSaved | undefined
let editSaved = false

const filterSavedAccounts = computed(() => {
  if (search.value) {
    const lower = search.value.toLowerCase()
    return store.savedAccounts.filter(
      saved =>
        saved.SavedAccountNames.toLowerCase().includes(lower) ||
        (saved.remark && saved.remark.toLowerCase().includes(lower))
    )
  }
  return store.savedAccounts
})

const onShowSaveAccountDialog = async () => {
  if (!checkBattleNetExists()) {
    showErrorMessage('请先设置战网路径')
    return
  }

  const saved = await loadBattleNetSaved()
  if (!saved.SavedAccountNames) {
    showWarningMessage('请先登录一个账号')
    return
  }
  tempSaved = saved
  editSaved = false
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
  if (!editSaved) {
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
  } else {
    if (i !== -1) {
      store.savedAccounts[i].remark = saveAccountDialogForm.remark
    }
  }
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
  if (!checkBattleNetExists()) {
    showErrorMessage('请先设置战网路径')
    return
  }
  executeWhenBattleNetNotRunning(async () => {
    await clearBattleNetSavedAccount()
    await shell.openPath(store.battleNetDir)
  })
}

const onLogin = async (saved: BattleNetSaved) => {
  if (!checkBattleNetExists()) {
    showErrorMessage('请先设置战网路径')
    return
  }
  executeWhenBattleNetNotRunning(async () => {
    await writeBattleNetSaved(saved)
    await shell.openPath(store.battleNetDir)
  })
}

const onEdit = (saved: BattleNetSaved) => {
  tempSaved = saved
  editSaved = true
  saveAccountDialogForm.account = saved.SavedAccountNames!
  saveAccountDialogForm.remark = saved.remark || ''
  saveAccountDialogVisible.value = true
}

const onDelete = (saved: BattleNetSaved) => {
  ElMessageBox.confirm(`确定要删除 "${saved.SavedAccountNames}" 吗`, '操作确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const i = store.savedAccounts.findIndex(e => e.SavedAccountNames === saved.SavedAccountNames)
      if (i !== -1) {
        store.savedAccounts.splice(i, 1)
      }
    })
    .catch(() => {})
}
</script>
