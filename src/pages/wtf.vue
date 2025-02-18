<template>
  <div class="flex h-full select-none">
    <div class="w-full flex flex-col items-center bg-brown-900">
      <div class="w-full h-10"></div>
      <div class="w-full h-full flex items-center justify-center bg-brown-950">
        <div class="flex h-full space-x-5">
          <!-- 来源 -->
          <div class="flex flex-col space-y-3">
            <span class="flex items-center"
              ><span class="text-lg">来源角色：</span>
              <span v-if="source" class="font-semibold"
                >{{ source.name }} - {{ source.realm }}</span
              >
            </span>
            <div class="flex space-x-2">
              <ElSelect v-model="store.selectedSourceFlavor" @change="onSourceFlavorChange">
                <ElOption
                  v-for="item in flavors"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  <div class="flex items-center justify-between">
                    <span>{{ item.label }}</span>
                    <span class="text-gray-400 text-xs">
                      {{ item.value }}
                    </span>
                  </div>
                </ElOption>
              </ElSelect>
              <ElInput
                v-model="searchSourceCharacter"
                placeholder="搜索角色名"
                :prefix-icon="Search"
              />
            </div>

            <ElTable
              border
              style="height: calc(100% - 148px)"
              :data="
                searchSourceCharacter
                  ? sourceCharacters.filter(character =>
                      character.name.includes(searchSourceCharacter)
                    )
                  : sourceCharacters
              "
              highlight-current-row
              @current-change="onSourceChange"
            >
              <ElTableColumn property="name" label="角色" width="140" />
              <ElTableColumn property="realm" label="服务器" width="120" />
              <ElTableColumn property="account" label="子账号" width="150" />
              <!-- <ElTableColumn label="操作" width="100">
              <template #default="scope">
                <ElButton size="small" type="success" @click="handleEdit(scope.$index, scope.row)">
                  收藏
                </ElButton>
              </template>
            </ElTableColumn> -->
            </ElTable>
          </div>

          <div class="flex items-center">
            <AppButton
              type="success"
              size="large"
              :disabled="!source || !target"
              @click="onOverwrite"
              >覆盖 >></AppButton
            >
          </div>

          <!-- 目标 -->
          <div class="flex flex-col space-y-3">
            <span class="flex items-center"
              ><span class="text-lg">目标角色：</span>
              <span v-if="target" class="font-semibold"
                >{{ target.name }} - {{ target.realm }}</span
              >
            </span>
            <div class="flex space-x-3">
              <ElSelect v-model="store.selectedTargetFlavor" @change="onTargetFlavorChange">
                <ElOption
                  v-for="item in flavors"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  <div class="flex items-center justify-between">
                    <span>{{ item.label }}</span>
                    <span class="text-gray-400 text-xs">
                      {{ item.value }}
                    </span>
                  </div>
                </ElOption>
              </ElSelect>
              <ElInput
                v-model="searchTargetCharacter"
                placeholder="搜索角色名"
                :prefix-icon="Search"
              />
            </div>
            <ElTable
              border
              style="height: calc(100% - 148px)"
              :data="
                searchTargetCharacter
                  ? targetCharacters.filter(character =>
                      character.name.includes(searchTargetCharacter)
                    )
                  : targetCharacters
              "
              highlight-current-row
              @current-change="onTargetChange"
            >
              <ElTableColumn property="name" label="角色" width="140" />
              <ElTableColumn property="realm" label="服务器" width="120" />
              <ElTableColumn property="account" label="子账号" width="150" />
            </ElTable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ElButton,
  ElInput,
  ElMessageBox,
  ElOption,
  ElSelect,
  ElTable,
  ElTableColumn
} from 'element-plus'
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import {
  Flavor,
  loadWTFCharacters,
  WTF,
  loadFlavors,
  flavorToSelector,
  overwriteCharacterConfig
} from '~/core/wtf'
import { useStore } from '~/store'
import { resolve } from 'node:path'
import { Search } from '@element-plus/icons-vue'
import AppButton from '~/components/AppButton.vue'
import { showErrorMessage, showSuccessMessage, showWarningMessage } from '~/utils/message'
import { useEventBus } from '@vueuse/core'

const store = useStore()

const bus = useEventBus<string>('WOW_DIR_CHANGED')

const sourceCharacters = ref<WTF[]>([])
const targetCharacters = ref<WTF[]>([])

const flavors = ref<{ label: string; value: string }[]>([])

const source = ref<WTF>()
const target = ref<WTF>()

onMounted(() => {
  load()
  bus.on(load)
})

onUnmounted(() => {
  bus.off(load)
})

const load = async () => {
  const diskFlavors = await loadFlavors()
  flavors.value = diskFlavors.map(flavorToSelector)

  if (!diskFlavors.find(flavor => flavor === store.selectedSourceFlavor)) {
    store.selectedSourceFlavor = diskFlavors[0]
  }

  if (!diskFlavors.find(flavor => flavor === store.selectedTargetFlavor)) {
    store.selectedTargetFlavor = store.selectedSourceFlavor
  }

  if (store.selectedSourceFlavor) {
    const res = await loadWTFCharacters(store.selectedSourceFlavor)
    sourceCharacters.value = res
  }

  if (store.selectedTargetFlavor) {
    if (store.selectedSourceFlavor === store.selectedTargetFlavor) {
      targetCharacters.value = sourceCharacters.value
    } else {
      const res = await loadWTFCharacters(store.selectedTargetFlavor)
      targetCharacters.value = res
    }
  }
}

const onSourceFlavorChange = async (val: string) => {
  const res = await loadWTFCharacters(val)
  sourceCharacters.value = res
}

const onTargetFlavorChange = async (val: string) => {
  const res = await loadWTFCharacters(val)
  targetCharacters.value = res
}

const onSourceChange = (val: WTF | undefined) => {
  source.value = val
}

const onTargetChange = (val: WTF | undefined) => {
  target.value = val
}

const searchSourceCharacter = ref('')
const searchTargetCharacter = ref('')

const onOverwrite = () => {
  if (!source.value || !target.value) {
    return
  }

  if (
    source.value.account === target.value.account &&
    source.value.realm === target.value.realm &&
    source.value.name === target.value.name &&
    source.value.flavor === target.value.flavor
  ) {
    showErrorMessage('来源角色和目标角色不能相同')
    return
  }

  ElMessageBox.confirm(
    `确定使用 "${source.value.name} - ${source.value.realm}" 覆盖 "${target.value.name} - ${target.value.realm}" 的配置吗`,
    '操作确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        await overwriteCharacterConfig(source.value!, target.value!)
        showSuccessMessage('覆盖成功')
      } catch (e) {
        console.log(e)
        showErrorMessage('覆盖失败')
      }
    })
    .catch(() => {})

  // const sourceCharacter = resolve(
  //   store.ACCOUNT_PATH,
  //   source.value!.account,
  //   source.value!.server,
  //   source.value!.character
  // )
  // console.log(sourceCharacter)
}
</script>
