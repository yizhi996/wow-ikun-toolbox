<template>
  <div class="p-5 flex flex-col space-y-5 h-full">
    <div class="flex flex-col">
      <span class="text-xl font-semibold">路径</span>

      <ElForm class="mt-2" label-position="left" label-width="96">
        <ElFormItem label="魔兽世界">
          <ElInput
            style="width: 400px"
            :model-value="store.wowRootDir ? store.wowRootDir : '请设置魔兽世界所在路径'"
            disabled
          ></ElInput>
          <AppButton class="ml-5" @click="chooseWoWRootDir">设置</AppButton></ElFormItem
        >

        <ElFormItem label="战网">
          <ElInput
            style="width: 400px"
            :model-value="store.battleNetDir ? store.battleNetDir : '请设置战网所在路径'"
            disabled
          ></ElInput>
          <AppButton class="ml-5" @click="chooseBattleNetDir">设置</AppButton></ElFormItem
        >
      </ElForm>
    </div>

    <div class="flex flex-col">
      <span class="text-xl font-semibold">关于</span>

      <ElForm class="mt-2" label-position="left" label-width="96">
        <ElFormItem label="版本">
          <span>{{ store.appInfo.version }}</span>
        </ElFormItem>
      </ElForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron'
import { useStore } from '~/store'
import { showErrorMessage, showSuccessMessage } from '~/utils/message'
import { resolve, basename } from 'node:path'
import AppButton from '~/components/AppButton.vue'
import { loadFlavors } from '~/core/wtf'
import { useEventBus } from '@vueuse/core'
import { BATTLE_NET_APP_NAME } from '~/core/account'
import { ElForm, ElFormItem, ElInput } from 'element-plus'
import { IPCChannel } from '~shared'

const store = useStore()

const bus = useEventBus<string>('WOW_DIR_CHANGED')

const chooseWoWRootDir = async () => {
  let dir = (await ipcRenderer.invoke(IPCChannel.CHOOSE_WOW_DIR)) as string | undefined
  if (dir) {
    let flavors = await loadFlavors(dir)
    if (flavors.length === 0) {
      const parent = resolve(dir, '..')
      flavors = await loadFlavors(parent)
      dir = parent
      if (flavors.length === 0) {
        showErrorMessage('不是正确的魔兽世界客户端目录')
        return
      }
    }
    store.wowRootDir = dir
    showSuccessMessage('设置成功')
    bus.emit(dir)
  }
}

const chooseBattleNetDir = async () => {
  let dir = (await ipcRenderer.invoke(IPCChannel.CHOOSE_BATTLENET_DIR)) as string | undefined
  if (dir) {
    if (!basename(dir).includes(BATTLE_NET_APP_NAME)) {
      showErrorMessage('不是正确的战网客户端目录')
      return
    }
    store.battleNetDir = dir
    showSuccessMessage('设置成功')
  }
}
</script>
