<template>
  <div class="w-full h-full p-5 flex flex-col">
    <div>
      <ElSelect
        style="width: 180px"
        v-model="store.selectedSynchronizeFlavor"
        @change="onFlavorChange"
      >
        <ElOption v-for="item in flavors" :key="item.value" :label="item.label" :value="item.value">
          <div class="flex items-center justify-between">
            <span>{{ item.label }}</span>
            <span class="text-white/50 text-xs">
              {{ item.value }}
            </span>
          </div>
        </ElOption>
      </ElSelect>
    </div>
    <div class="flex flex-col mt-5">
      <ElCheckbox v-model="synchronize.synchronizeConfig" @change="onChangeConfig"
        >同步设置参数
        <span class="text-sm font-normal ml-5 text-white/70"
          >如果你需要上别人的号，推荐关闭，否则会同步你的设置到他的账号上</span
        ></ElCheckbox
      >
      <ElCheckbox v-model="synchronize.synchronizeBindings" @change="onChangeBindings"
        >同步按键绑定<span class="text-sm font-normal ml-5 text-white/70">
          多数情况下按键都是使用 Myslot 导入导出的，所以不需要关闭</span
        ></ElCheckbox
      >
      <ElCheckbox v-model="synchronize.synchronizeChatFrames" @change="onChangeChatFrames"
        >同步聊天窗口
        <span class="text-sm font-normal ml-5 text-white/70"
          >如果你需要上别人的号，推荐关闭，否则会同步你的设置到他的账号上</span
        ></ElCheckbox
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckboxValueType, ElCheckbox, ElOption, ElSelect } from 'element-plus'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { loadFlavors, flavorToSelector } from '~/core/wtf'
import { useStore } from '~/store'
import { showErrorMessage, showSuccessMessage } from '~/utils/message'
import { useEventBus } from '@vueuse/core'
import { checkWoWExists } from '~/utils/path'
import { converWTFValueToBoolean, getWTFConfigs, setWTFConfig } from '~/utils/config'

const store = useStore()

const bus = useEventBus<string>('WOW_DIR_CHANGED')

const flavors = ref<{ label: string; value: string }[]>([])

onMounted(() => {
  if (checkWoWExists()) {
    load()
  }
  bus.on(load)
})

onUnmounted(() => {
  bus.off(load)
})

const load = async () => {
  const diskFlavors = await loadFlavors()
  flavors.value = diskFlavors.map(flavorToSelector)

  if (!diskFlavors.find(flavor => flavor === store.selectedSynchronizeFlavor)) {
    store.selectedSynchronizeFlavor = diskFlavors[0]
  }
  onFlavorChange(store.selectedSynchronizeFlavor)
}

const enum WTF_KEY {
  CONFIG = 'synchronizeConfig',
  BINDINGS = 'synchronizeBindings',
  CHAT_FRAMES = 'synchronizeChatFrames'
}

const synchronize = reactive({
  [WTF_KEY.CONFIG]: true,
  [WTF_KEY.BINDINGS]: true,
  [WTF_KEY.CHAT_FRAMES]: true
})

const onFlavorChange = async (val: string) => {
  const configs = await getWTFConfigs(val)
  synchronize[WTF_KEY.CONFIG] = converWTFValueToBoolean(configs[WTF_KEY.CONFIG])
  synchronize[WTF_KEY.BINDINGS] = converWTFValueToBoolean(configs[WTF_KEY.BINDINGS])
  synchronize[WTF_KEY.CHAT_FRAMES] = converWTFValueToBoolean(configs[WTF_KEY.CHAT_FRAMES])
}

const onChangeConfig = async (value: CheckboxValueType) => {
  await setWTFConfig(store.selectedSynchronizeFlavor, WTF_KEY.CONFIG, value ? 1 : 0)
}

const onChangeBindings = async (value: CheckboxValueType) => {
  await setWTFConfig(store.selectedSynchronizeFlavor, WTF_KEY.BINDINGS, value ? 1 : 0)
}

const onChangeChatFrames = async (value: CheckboxValueType) => {
  await setWTFConfig(store.selectedSynchronizeFlavor, WTF_KEY.CHAT_FRAMES, value ? 1 : 0)
}
</script>
